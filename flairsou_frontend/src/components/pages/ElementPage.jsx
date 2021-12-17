import React from 'react';
import PropTypes from 'prop-types';

/*
 * Classe qui permet d'afficher un élément particulier obtenu dans l'URL
 */
class ElementPage extends React.Component {
  constructor(props) {
    super(props);

    // classe abstraite
    if (this.constructor === ElementPage) {
      throw new Error("Abstract classes can't be instantiated.");
    }

    // récupération du paramètre ?pk=<pk> dans la requête pour savoir sur
    // quel élément on se base
    const { search } = props.location;
    const elementPkStr = new URLSearchParams(search).get('pk');

    // conversion en int et passage à 0 si la conversion a échoué
    let elementPk;
    if (elementPkStr == null) {
      elementPk = 0;
    } else {
      elementPk = parseInt(elementPkStr, 10);
    }

    // définition de l'état du composant (élément qui sera réutilisé dans
    // les sous-classes, donc on désactive l'erreur eslint ici)
    this.state = { elementPk }; // eslint-disable-line react/no-unused-state
  }
}

// définition des propriétés de la classe ElementPage
ElementPage.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
};

export default ElementPage;
