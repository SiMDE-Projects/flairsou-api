# Utilisation de React

Ce document explique la manière dont utiliser React dans ce projet.
React étant une bibliothèque très libre, certains choix ont été faits pour harmoniser l'ensemble du code frontend.
Ceux-ci sont décrits dans ce document.

## Bien débuter avec React

Ce document **n'est pas** un tutoriel pour apprendre à utiliser React.
Il s'adresse à des lecteurs connaissant déjà les notions de cette bibliothèque.

Pour apprendre React, il est possible de lire [la documentation officielle](https://fr.reactjs.org/docs/getting-started.html), ou de suivre un des nombreux tutoriaux disponibles sur Internet.
Pour un bon tutoriel en Français, voir [ici](https://www.youtube.com/watch?v=SMgQlTSoXf0).

## Installation de React dans ce projet

### Organisation

L'installation de React a été faite à la main pour ce projet.
L'ensemble des fichiers mettant en place cette architecture sont situés dans le dossier [flairsou_frontend].

On y trouve notamment les fichiers suivants :

- `package.json` et `package-lock.json` qui listent les dépendances `npm` ainsi que les scripts pour la compilation du front.
- `.eslintrc.json` qui décrit les règles du linter `eslint`
- `webpack.config.json` la configuration du compilateur `webpack` (voir ci-après)

### Pourquoi un compilateur ?

React est une bibliothèque proposant des fonctionnalités utiles pour le développement JavaScript.
Néanmoins, la syntaxe React (JSX) ainsi que certaines notations utilisées ne sont pas comprises par les navigateurs.
C'est le travail de `webpack` et de `Babel` (appelé par `webpack`) de transformer le code source en code JavaScript valide.

À partir du point d'entrée `src/index.js` et en utilisant les `import` pour savoir quoi compiler, `webpack` crée ainsi le code JavaScript et les assets utilisés dans `flairsou_frontend/static/flairsou_frontend`.

### Une application Django

Pour simplifier la liaison entre le backend et le frontend, ce dernier est servi par le premier.
Ainsi, les URLs qui ne sont pas de la forme `/api` sont passées à l'application `flairsou_frontend`.

Celle-ci, quelle que soit la route, rend un document HTML simplissime dans lequel est chargé le frontend React.
À partir d'ici, toute la gestion est faite par React et non plus par Django.

Cette construction permet l'utilisation d'une session pour communiquer entre le frontend et le backend.
Ainsi, il n'est pas nécessaire d'utiliser de token pour les requêtes d'api et cela simplifie le code.

## Conventions React

React étant uniquement une bibliothèque logicielle, il n'impose pas de fonctionnement ou de style particulier.
Néanmoins, pour garder une cohérence au sein du code, les conventions suivantes **devront** être suivies.

### Eslint-Airbnb

Le linter `eslint` est utilisé pour vérifier la conformité du code à un certain nombre de règles de style.
Les règles et la configuration utilisées sont celles du plugin `airbnb` pour React.

Ces règles **prévalent** sur toutes les autres et sont les premières à devoir être appliquées.
Ainsi, un commit dont le code ne respecterait pas les règles du linter sera rejeté par les `hooks` git, puis ensuite par la CI sur github.

Il est possible de manière **exceptionnelle et raisonnée** de désactiver une règle pour un fichier ou une ligne particulière.
Il est alors apprécié qu'une explication soit donnée pour justifier le caractère nécessaire de la désactivation.

### Utilisation des fonctions fléchées

En JavaScript, l'opérateur `this` [a un fonctionnement différent en fonction de l'appel de fonction](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/this).
Pour éviter d'avoir à effectuer - et oublier - les `binds` des fonctions, on préfèrera utiliser des [fonctions fléchées](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Functions/Arrow_functions).

En effet, une fonction fléchée n'a pas sa propre version de `this`. On sait qu'il correspondra au `this` du contexte dans lequel elle est définie.
Par soucis de cohérence, on utilisera alors uniquement des fonctions fléchées (sauf cas justifié et documenté).

### Gestion des états dans l'application

#### Fonction pure vs composant React

En React, on distingue les composants (sous forme de classe héritant de `React.Component`) des fonctions pures (qui rendent du JSX sans gestion d'état).

On peut utiliser les deux formes de la manière suivante :

```jsx
class HelloWorld extends React.Component {
    render = () => (
        <p>Hello World</p>
    )
}

const HelloWorld = () => (
    <p>Hello World</p>
)
```

Les deux syntaxes sont équivalentes ici (noter l'utilisation des fonctions fléchées).
Néanmoins, dans le cas de composants stateless, on préfèrera pour être plus concis l'utilisation de fonctions pures (`eslint` n'écceptera pas l'utilisation de classes pour des composants stateless).

Pour des composants avec état, se référer à la section suivante.

#### Comment gérer les états ?

Un composant React peut diposer d'un état, permettant de stocker certaines informations (par exemple un compteur).
Par ailleurs, notre application peut aussi vouloir disposer d'un état « global » qui n'appartient à aucun composant mais qui peut être utilisé par tous, comme les données venant de l'API, le fait que l'on soit connecté ou non...

Ces états sont alors gérés différement :

- Pour les états globaux, voir Redux
- Pour les états locaux ou appartenant à un composant, voir les autres sections.

##### Les composants

Les composants héritant de `React.Component` sont la première manière (et la manière historique) de gérer les états.
Un composant peut en effet disposer d'un attribut `state` permettant de stocker son état (sous forme d'objet) et d'une méthode `setState` pour le modifier.

Exemple :

```jsx
class Compteur extends React.Component {
  constructor(props) {
    // Obligatoire
    super(props);
    // Déclaration de l'état
    this.state = {
      compteur: 0
    };
  }

  increment = () => {
    this.setState(({ compteur, ...rest }) => ({
      compteur: compteur + 1,
      ...rest
    }));
  };

  decrement = () => {
    this.setState(({ compteur, ...rest }) => ({
      compteur: compteur - 1,
      ...rest
    }));
  };

  render = () => (
    <>
      <p>Compteur : {this.state.compteur}</p>
      <button type="button" onClick={() => this.increment()}>
        Incrémenter
      </button>
      <button type="button" onClick={() => this.decrement()}>
        Décrémenter
      </button>
    </>
  );
}
```

Ici, on note que setState prend une fonction qui à l'ancien state associe le nouveau. C'est obligatoire puisque la valeur du nouveau state dépend de l'ancien.

On note que si ce code fonctionne très bien, il est assez lourd et long.
On préfèrera utiliser une des versions suivantes (voir `useState` et `useReducer`) et garder les composants pour le cas où on aurait besoin de leur cycle de vie (`componentDidMount`, `componentWillUnmount`...).

##### Le hook `useState`

Le hook `useState` permet l'utilisation d'un état géré par React dans une fonction.
Voir [la documentation](https://fr.reactjs.org/docs/hooks-state.html).

Ainsi, chaque `useState` donne un couple [`state`, `fonction`] avec `state` du type que l'on veut (représentant **une** variable d'état) et `fonction` la fonction pour le modifier.

Le code précédent devient alors :

```jsx
const Compteur = () => {
  const [compteur, setCompteur] = useState(0);

  return (
    <>
      <p>Compteur : {compteur}</p>
      <button type="button" onClick={() => setCompteur(compteur + 1)}>
        Incrémenter
      </button>
      <button type="button" onClick={() => setCompteur(compteur - 1)}>
        Décrémenter
      </button>
    </>
  );
};
```

(ce qui est beaucoup plus concis)

##### Le hook `useReducer`

Le hook `useReducer` ([documentation](https://fr.reactjs.org/docs/hooks-reference.html#usereducer)) permet l'utilisation d'une fonction appelée reducer pour une gestion plus complexe d'un état.
Le fonctionnement est semblable à celui de Redux, mais l'on parle bien ici de la gestion d'un état **local** et non pas de l'état global de Redux.

Le code devient :

```jsx
const compteurReducer = (state, action) => {
  switch (action.type) {
    case "increment":
      return { compteur: state.compteur + 1 };
    case "decrement":
      return { compteur: state.compteur - 1 };
    default:
      throw new Error();
  }
};

const Compteur = () => {
  const [state, dispatch] = useReducer(compteurReducer, initialState);

  return (
    <>
      <p>Compteur : {state.compteur}</p>
      <button type="button" onClick={() => dispatch({ type: "increment" })}>
        Incrémenter
      </button>
      <button type="button" onClick={() => dispatch({ type: "decrement" })}>
        Décrémenter
      </button>
    </>
  );
};
```

Cette méthode est un peu plus verbeuse, mais elle permet de séparer l'action de son traitement.
Ainsi, si les traitements sont complexes, il est préférable de l'utiliser par rapport à la méthode précédente (ici ce n'est pas la peine).

##### Le hook `useContext`

Le hook `useContext` peut être utilisé pour tuneler des passage de props (voir [la documentation](https://fr.reactjs.org/docs/hooks-reference.html#usecontext)).
On **ne l'utilisera pas pour créer un état global** puisque l'on utilise Redux pour cela.

##### Redux

Redux est utilisé pour la gestion de l'état global de l'application.
On s'en servira notamment pour la gestion des ressources provenant de l'API, ou les autres états que l'on jugera nécessaires de passer à Redux.

Celui-ci permet par ailleurs l'utilisation de middlewares, ce qui aidera pour le développement et la gestion des requêtes asynchrones.

Voir [la documentation de Redux](https://redux.js.org/introduction/getting-started) pour en comprendre le fonctionnement.

##### D'autres hooks ?

On pourra utiliser d'autres hooks de React au besoin.
Dans ce cas, merci de les ajouter à ce document ainsi que leurs cas d'usage.
