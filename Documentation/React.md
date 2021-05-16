# Utilisation de React

Ce document explique la manière dont utilisé React dans ce projet.
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

### Utilisation des fonctions fléchées

### Gestion des états dans l'application

#### Fonction pure vs composant React

#### Comment gérer les états ?

##### Les composants

##### Le hook `useState`

##### Le hook `useReducer`

##### Le hook `useContext`

##### Redux
