import React, {
  useState, useEffect, useContext, memo,
} from 'react';
import PropTypes from 'prop-types';
import { Table, Input } from 'semantic-ui-react';

import { currencyFormat, checkCurrencyFormat, strToCents } from '../../../../../utils/currencyFormat';
import { AppContext } from '../../../../contexts/contexts';

import './Operation.css';

const findAccount = (accountList, hierarchy, level) => {
  for (let i = 0; i < accountList.length; i += 1) {
    if (accountList[i].name === hierarchy[level]) {
      // on a trouvé le compte ou un parent
      if (accountList[i].virtual) {
        // c'est un compte parent, on descend
        return findAccount(accountList[i].account_set, hierarchy, level + 1);
      }

      // sinon on a trouvé le bon compte, on renvoie la clé
      return accountList[i].pk;
    }
  }

  // le compte n'existe pas
  return -1;
};

/**
 * Composant effectuant le rendu d'une opération particulière
 */
const Operation = ({
  operation, accountName, clickToExpand, active, reconciliated, updateCallback,
  transactionModified,
}) => {
  // affichage du crédit et du débit seulement si le montant est non nul
  const [credit, setCredit] = useState('');
  const [debit, setDebit] = useState('');
  const [account, setAccount] = useState(-1);
  const [accountError, setAccountError] = useState(null);
  const [label, setLabel] = useState('');

  const appContext = useContext(AppContext);

  useEffect(() => {
    // met en place les crédits et débits
    setCredit(operation.credit > 0 ? currencyFormat(operation.credit) : '');
    setDebit(operation.debit > 0 ? currencyFormat(operation.debit) : '');
    setLabel(operation.label);
  }, [operation.credit, operation.debit, operation.label]);

  useEffect(() => {
    // récupère la clé du compte initialement associé à l'opération
    // si c'est une transaction simple, on récupère la clé du compte en face, sinon
    // on utilise la clé du compte associé à l'opération
    setAccount(accountName
      ? findAccount(appContext.accountList, accountName.split(':'), 0)
      : operation.account);
  }, [accountName, appContext.accountList, operation.account]);

  const updateCredit = (event) => {
    setCredit(checkCurrencyFormat(event.target.value));
    transactionModified();
  };

  const updateDebit = (event) => {
    setDebit(checkCurrencyFormat(event.target.value));
    transactionModified();
  };

  const updateAccount = (event) => {
    setAccountError(null);
    const newAccount = event.target.value;

    // on découpe le nom du compte pour récupérer son arborescence
    const hierarchy = newAccount.split(':');

    // on trouve la clé du compte et on la met à jour
    const accountPk = findAccount(appContext.accountList, hierarchy, 0);
    setAccount(accountPk);
    transactionModified();
  };

  const updateLabel = (event) => {
    setLabel(event.target.value);
    transactionModified();
  };

  const keyPressedCallback = (event) => {
    setAccountError(null);
    if (event.key === 'Enter') {
      // on vérifie que le compte est valide
      if (account === -1) {
        // si le compte n'est pas valide, on ne met pas à jour l'opération
        setAccountError('Compte invalide');
        return;
      }

      updateCallback({
        ...operation,
        debit: strToCents(debit),
        credit: strToCents(credit),
        label,
      }, account);
    }
  };

  // construction de l'élément correspondant au nom du compte
  let accountNameElement = null;
  if (accountName !== null) {
    if (reconciliated) {
      accountNameElement = accountName;
    } else {
      accountNameElement = (
        <>
          <Input
            list="accounts"
            defaultValue={accountName}
            transparent
            className="input-full-width"
            error={accountError !== null}
            onChange={(event) => updateAccount(event)}
            onKeyPress={keyPressedCallback}
          />
          <p className="ui error">
            {accountError}
          </p>
        </>
      );
    }
  } else {
    accountNameElement = clickToExpand;
  }

  return (
    <>
      <Table.Cell active={active}>
        { reconciliated ? operation.label
          : (
            <Input
              transparent
              defaultValue={operation.label}
              className="input-full-width"
              onChange={(event) => updateLabel(event)}
              onKeyPress={keyPressedCallback}
            />
          )}
      </Table.Cell>
      <Table.Cell active={active}>
        {accountNameElement}
      </Table.Cell>
      <Table.Cell active={active} textAlign="right">
        {reconciliated ? credit
          : (
            <Input
              transparent
              value={credit}
              fluid
              onChange={(event) => updateCredit(event)}
              onKeyPress={keyPressedCallback}
              className="input-full-width amount-input"
            />
          )}
      </Table.Cell>
      <Table.Cell active={active} textAlign="right">
        {reconciliated ? debit
          : (
            <Input
              transparent
              value={debit}
              fluid
              onChange={(event) => updateDebit(event)}
              onKeyPress={keyPressedCallback}
              className="input-full-width amount-input"
            />
          )}
      </Table.Cell>
    </>
  );
};

Operation.propTypes = {
  // opération à afficher
  operation: PropTypes.shape({
    // clé primaire de l'opération dans la base de l'API
    pk: PropTypes.number.isRequired,
    // montant associé au crédit (centimes)
    credit: PropTypes.number.isRequired,
    // montant associé au débit (centimes)
    debit: PropTypes.number.isRequired,
    // label de l'opération
    label: PropTypes.string.isRequired,
    // clé primaire du compte lié à l'opération
    account: PropTypes.number.isRequired,
    // nom complet du compte lié à l'opération
    accountFullName: PropTypes.string.isRequired,
  }).isRequired,
  // nom de compte à afficher (ce nom ne correspond pas forcément au nom
  // du compte lié à l'opération : dans le cas d'une transaction simple, on
  // affiche le nom de l'autre compte pour indiquer vers quel compte se fait le
  // transfert). Dans le cas d'une transaction répartie, cette props est null.
  accountName: PropTypes.string,
  // bouton permettant d'étendre la transaction dans le cas où elle est répartie
  clickToExpand: PropTypes.element,
  // indique si la ligne correspond à l'opération courante dans la liste des opérations
  // d'une transaction répartie
  active: PropTypes.bool.isRequired,
  // indique si l'opération fait partie d'une transaction rapprochée, auquel cas les champs
  // ne peuvent pas être édités
  reconciliated: PropTypes.bool.isRequired,
  updateCallback: PropTypes.func.isRequired,
  transactionModified: PropTypes.func.isRequired,
};

Operation.defaultProps = {
  accountName: null,
  clickToExpand: null,
};

Operation.defaultProps = {
  accountName: null,
  clickToExpand: null,
};

export default memo(Operation);
