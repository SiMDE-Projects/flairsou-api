import React from 'react';
import { Link } from 'react-router-dom';
import ElementPage from './ElementPage';

/*
 * Composant d'affichage de l'arborescence d'un livre de comptes
 */
class BookPage extends ElementPage {
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

    // définition de l'état du composant
    this.state = { ...this.state, accounts: [] };
  }

  componentDidMount() {
    // quand le composant est chargé, on récupère la liste des comptes
    // associés à ce livre
    const { elementPk } = this.state;

    fetch(`/api/books/${elementPk}/accounts/`, { method: 'GET' })
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
    const { elementPk } = this.state;
    if (elementPk === 0) {
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
          {elementPk}
        </>
        <>
          {BookPage.buildAccountTree(accounts)}
        </>
      </>
    );
  }
}

export default BookPage;
