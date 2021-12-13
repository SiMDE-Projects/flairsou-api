import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

class BookPage extends React.Component {
  static buildAccountTree(accounts, depth = 0) {
    // construction de l'affichage des comptes à partir de la liste
    // imbriquée. La clé est placée sur le fragment pour identifier
    // chaque élément créé dans la boucle
    const typeLetter = ['A', 'P', 'R', 'D', 'CP'];

    if (accounts.length > 0) {
      return (
        <>
          {accounts.map((account) => (
            <React.Fragment key={`acc_${account.pk}`}>
              <tr>
                <td>
                  [
                  {typeLetter[account.account_type]}
                  ]
                </td>
                {/* on ajuste la classe en fonction du type de compte pour
                ajuster l'affichage dans le css */}
                <td className={account.virtual ? 'virtual_account_name' : 'account_name'}>
                  {/* on met en place le lien seulement pour les comptes non vituels, les
                  comptes virtuels n'ont pas d'opérations associées à afficher */}
                  {account.virtual ? account.name
                    : (
                      <Link to={`/account?pk=${account.pk}`}>
                        {account.name}
                      </Link>
                    )}
                </td>
                <td>
                  Solde
                </td>
              </tr>
              {BookPage.buildAccountTree(account.subaccounts, depth + 1)}
            </React.Fragment>
          ))}
        </>
      );
    }

    return (<></>);
  }

  constructor(props) {
    super(props);

    // récupération du paramètre ?pk=<pk> dans la requête pour savoir sur
    // quel livre on se base
    const { search } = props.location;
    const bookIdStr = new URLSearchParams(search).get('pk');

    // conversion en int et passage à 0 si la conversion a échoué
    let bookId;
    if (bookIdStr == null) {
      bookId = 0;
    } else {
      bookId = parseInt(bookIdStr, 10);
    }

    // définition de l'état du composant
    this.state = { bookId, accounts: [] };
  }

  componentDidMount() {
    // quand le composant est chargé, on récupère la liste des comptes
    // associés à ce livre
    const { bookId } = this.state;

    fetch(`/api/books/${bookId}/accounts/`, { method: 'GET' })
      .then((response) => (
        // on vérifie le statut de la réponse pour adapter le rendu
        // si le livre n'existe pas
        response.status === 404 ? 0 : response.json()))
      .then((response) => {
        if (response === 0) {
          this.setState({ bookId: 0 });
          return;
        }
        this.setState({ accounts: response.subaccounts });
      });
  }

  render() {
    const { bookId } = this.state;
    if (bookId === 0) {
      // affichage particulier si le livre n'existe pas
      return (
        <>
          Le livre demandé n&apos;existe pas
        </>
      );
    }

    const { accounts } = this.state;

    return (
      <>
        <>
          Je suis la page du livre
          {' '}
          {bookId}
        </>
        <>
          {BookPage.buildAccountTree(accounts)}
        </>
      </>
    );
  }
}

// définition des propriétés de la classe BookPage
BookPage.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
};

export default BookPage;
