import React, {
  useState, useEffect, useCallback, useContext, memo,
} from 'react';
import PropTypes from 'prop-types';
import { Table, Input } from 'semantic-ui-react';

import {
  centsToStr, filterCurrencyInput, strToCents,
} from '../../../../../utils/currencyFormat';
import { AppContext } from '../../../../contexts/contexts';

import './Operation.css';

/**
 * Valeur constante indiquant qu'aucun compte n'a été trouvé ou n'est associé à une opération
 * (dans le cas des nouvelles opérations notamment).
 */
const NO_ACCOUNT = -1;

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
  return NO_ACCOUNT;
};

const OpType = {
  CREDIT: 0,
  DEBIT: 1,
};

const formatAmount = (value) => (value > 0 ? centsToStr(value) : '');

/**
 * Composant effectuant le rendu d'une opération particulière
 */
const Operation = ({
  initialOp,
  clickToExpand, active, readOnly, updateCallback,
  operationValidatedCallback,
}) => {
  const appContext = useContext(AppContext);

  // état interne de l'opération enregistrée, similaire à initialOp mais maintenu
  // à jour par rapport aux  modifications
  const [operation, setOperation] = useState(initialOp);

  // variables pour gérer l'affichage du crédit et du débit
  const [credit, setCredit] = useState(formatAmount(initialOp.credit));
  const [debit, setDebit] = useState(formatAmount(initialOp.debit));

  // état pour la saisie du nom du compte
  const [accountInput, setAccountInput] = useState(initialOp.label);

  // erreur sur le compte sélectionné
  const [accountError, setAccountError] = useState(null);

  /**
   * Fonction permettant d'actualiser les formats des montants
   */
  const resetFormat = () => {
    setCredit(formatAmount(operation.credit));
    setDebit(formatAmount(operation.debit));
  };

  /**
   * Fonction mettant à jour l'état de l'opération dans le composant et
   * appelant le callback de mise à jour.
   */
  const updateOperation = useCallback((updatedOp) => {
    // mise à jour de l'objet opération
    setOperation(updatedOp);

    // appel du callback suite à la mise à jour de l'état de l'opération
    updateCallback(updatedOp);
  }, [updateCallback]);

  /**
   * Callback appelé lors de la mise à jour d'un montant de l'opération
   */
  const updateAmount = (event, opType) => {
    // récupération de la nouvelle valeur par filtrage de la saisie
    const strValue = filterCurrencyInput(event.target.value);

    // nouvel objet opération à mettre à jour
    const updatedOp = { ...operation };

    // mise à jour selon le type d'opération
    switch (opType) {
      case OpType.CREDIT:
        setCredit(strValue);
        updatedOp.credit = strToCents(strValue);
        break;
      case OpType.DEBIT:
        setDebit(strValue);
        updatedOp.debit = strToCents(strValue);
        break;
      default:
        break;
    }

    // mise à jour et callback
    updateOperation(updatedOp);
  };

  /**
   * Callback appelé lors de la mise à jour du compte lié à l'opération
   */
  const updateAccount = useCallback((accountNameInput) => {
    setAccountError(null);

    // on met à jour l'affichage avec la valeur saisie
    setAccountInput(accountNameInput);

    // on découpe le nom du compte pour récupérer son arborescence
    const hierarchy = accountNameInput.split(':');

    // on trouve la clé du compte et on la met à jour
    const accountPk = findAccount(appContext.accountList, hierarchy, 0);

    // mise à jour de l'opération
    updateOperation({
      ...operation,
      account: accountPk,
      accountFullName: accountPk !== NO_ACCOUNT ? accountNameInput : '',
    });
  }, [appContext.accountList, updateOperation, operation]);

  /**
   * Callback appelé lors de la mise à jour du label de l'opération
   */
  const updateLabel = (event) => {
    // construction d'un nouvel objet mis à jour
    const updatedOp = { ...operation, label: event.target.value };

    // mise à jour et callback
    updateOperation(updatedOp);
  };

  /**
   * Fonction appelée quand l'utilisateur frappe "Entrée" dans l'opération
   */
  const validateOperation = (event) => {
    // suppression de l'erreur
    setAccountError(null);

    if (event.key === 'Enter') {
      // mise à jour du format des montants
      resetFormat();

      // on vérifie que le compte est valide
      if (operation.account === NO_ACCOUNT) {
        // si le compte n'est pas valide, on ne met pas à jour l'opération
        setAccountError('Compte invalide');
        return;
      }

      // appel du callback pour signaler la validation
      operationValidatedCallback();
    }
  };

  /**
   * Mise à jour de la saisie du compte si la transaction initiale est modifiée, par
   * exemple suite à une réinitialisation de la transaction
   */
  useEffect(() => {
    if (initialOp.account !== NO_ACCOUNT) {
      setAccountInput(initialOp.accountFullName);
      setOperation((op) => ({ ...op, accountFullName: initialOp.accountFullName }));
    }
  }, [initialOp.account, initialOp.accountFullName]);

  // construction de l'élément correspondant au nom du compte
  let accountNameElement = null;
  if (clickToExpand !== null) {
    accountNameElement = clickToExpand;
  } else if (readOnly) {
    accountNameElement = initialOp.accountFullName;
  } else {
    accountNameElement = (
      <>
        <Input
          list="accounts"
          value={accountInput}
          transparent
          className="input-full-width"
          error={operation.account === NO_ACCOUNT}
          onChange={(event) => updateAccount(event.target.value)}
          onKeyPress={validateOperation}
        />
        <p className="ui error">
          {accountError}
        </p>
      </>
    );
  }

  return (
    <>
      <Table.Cell active={active}>
        { readOnly ? initialOp.label
          : (
            <Input
              transparent
              value={initialOp.label}
              className="input-full-width"
              onChange={(event) => updateLabel(event)}
              onKeyPress={validateOperation}
            />
          )}
      </Table.Cell>
      <Table.Cell active={active}>
        {accountNameElement}
      </Table.Cell>
      <Table.Cell active={active} textAlign="right">
        {readOnly ? credit
          : (
            <Input
              transparent
              value={credit}
              fluid
              onChange={(event) => updateAmount(event, OpType.CREDIT)}
              onBlur={() => resetFormat()}
              onKeyPress={validateOperation}
              className="input-full-width amount-input"
            />
          )}
      </Table.Cell>
      <Table.Cell active={active} textAlign="right">
        {readOnly ? debit
          : (
            <Input
              transparent
              value={debit}
              fluid
              onChange={(event) => updateAmount(event, OpType.DEBIT)}
              onBlur={() => resetFormat()}
              onKeyPress={validateOperation}
              className="input-full-width amount-input"
            />
          )}
      </Table.Cell>
    </>
  );
};

Operation.propTypes = {
  /** Valeur initiale de l'opération à afficher */
  initialOp: PropTypes.shape({
    /** clé primaire de l'opération dans la base de l'API */
    pk: PropTypes.number.isRequired,
    /** montant associé au crédit (centimes) */
    credit: PropTypes.number.isRequired,
    /** montant associé au débit (centimes) */
    debit: PropTypes.number.isRequired,
    /** label de l'opération */
    label: PropTypes.string.isRequired,
    /** clé primaire du compte lié à l'opération */
    account: PropTypes.number.isRequired,
    /** Nom complet du compte associé à l'opération (hiérarchie complète) */
    accountFullName: PropTypes.string.isRequired,
  }).isRequired,
  /**
   * Composant permettant d'étendre la transaction dans le cas où elle est répartie. Ce composant
   * se substitue à l'affichage du nom du compte dans l'opération.
   */
  clickToExpand: PropTypes.element,
  /**
   * Flag indiquant si la ligne correspond à l'opération courante dans la liste des opérations
   * d'une transaction répartie.
   */
  active: PropTypes.bool.isRequired,
  /**
   * Flag indiquant si l'opération est en lecture seule (non modifiable) ou non.
   */
  readOnly: PropTypes.bool.isRequired,
  /**
   * Callback appelé à chaque modification de l'opération. Le composant envoie en paramètre
   * du callback un objet correspondant à l'opération mise à jour.
   */
  updateCallback: PropTypes.func.isRequired,
  /**
   * Callback appelé comme un signal quand l'utilisateur valide la saisie de l'opération
   * (frappe sur la touche "Entrée")
   */
  operationValidatedCallback: PropTypes.func.isRequired,
};

Operation.defaultProps = {
  clickToExpand: null,
};

export default memo(Operation);
export { NO_ACCOUNT };
