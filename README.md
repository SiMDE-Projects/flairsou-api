# Flairsou

## Organisation du projet

Flairsou est un projet Django qui fournit une API Django le backend, et qui utilise React comme librairie front.

Le projet s'organise à haut niveau comme suit :

```
.
├── Documentation     => toute la documentation
├── flairsou          => projet Django de base
├── flairsou_api      => application Django pour l'API
├── flairsou_frontend => application Django pour le front avec React
└── Pipfile           => paquets python requis (voir la section d'installation)
```

## Installation

### Partie Python/Django

L'installation des dépendances Python et l'environement virtuel sont gérés par [pipenv](https://pypi.org/project/pipenv/).
Il faut donc l'installer sur sa machine (depuis son gestionnaire de paquets, sinon voir [la documentation](https://pipenv.pypa.io/en/latest/#install-pipenv-today)).

`pipenv` est une alternative au couple `virtualenv` + `pip` géré à la main (bien qu'il utilise ces deux outils).
Son paradigme de gestion des paquets s'approche de celui de `npm` :

- Les dépendances du projet ainsi que leurs versions minimales sont ensuite listées dans le fichier `Pipenv` (que l'on éditera pas à la main sauf raison spécifique).
- Les versions exactes des paquets utilisés sont spécifiées dans `Pipfile.lock`. Ceci permet de s'assurer que tous les environements de développement et de production disposent des mêmes versions des paquets. On pourra ensuite les mettre à jour avec `pipenv`.

#### Installation de l'environement

Pour installer les dépendances, il suffit de taper la commande suivante :

```
$ pipenv install
```

`pipenv` crée alors tout seul le `virtualenv` et installe les paquets en suivant les fichiers `Pipfile` et `Pipfile.lock`.
Contrairement à la gestion « habituelle », le `virtualenv` n'est pas créé dans le répertoire courant, mais dans `~/.local/share/virtualenvs`.
Pour le charger, on utilisera la commande suivante :

```
$ pipenv shell
```

Une fois dans l'environement, le nom de celui-ci `(flairsou)` sera ajouté au prompt.
On peut sortir de l'environement en utilisant la commande `exit` (ou `Ctrl+d`).

#### Ajout de paquet

Comme `npm`, `pipenv` fait la différence entre les paquets de développement et les dépendances du projet :

- Les dépendances sont les paquets requis pour un fonctionnement normal de l'application. Par exemple, `Django` est une dépendance : flairsou ne fonctionnera pas sans.
- Les paquets de développement sont les différents outils utilisés pour le développement, mais qui ne sont pas requis pour utiliser l'application. Ainsi, s'il est obligatoire de disposer de `pyflakes` ou de `yapf` lors du développement, ces paquets sont inutiles en production.

Pour installer un paquet, il faut d'abord se demander s'il s'agit d'une dépendance ou d'un paquet utile uniquement pour le développement. La commande d'installation est ensuite :

```
$ pipenv install [--dev] <nom-paquet>
```

Où `--dev` est l'option à ajouter si l'on veut spécifier que le paquet est un paquet de développement. Le virtualenv n'a pas nécéssairement besoin d'être chargé pour que cela fonctionne si l'on se trouve dans le dossier contenant le `Pipfile`.

#### Mise en place du projet

Si c'est la première installation du dépôt, il faut créer un fichier de configuration `flairsou/config.py` qui contiendra les éléments sensibles ou spécifique à la plateforme cible (clé secrète, configuration des bases de données etc...).
Le fichier `flairsou/config_template.py` est pré-rempli pour une configuration de développement.
Il faut donc le copier (`cp flairsou/config_template.py flairsou/config.py`) et apporter les modifications nécessaires.
La modification de la clé secrète est impérative.
On peut créer la clé secrète avec la commande suivante, exécutée depuis la racine du projet :

```
(flairsou) $ python manage.py shell -c 'from django.core.management import utils; print(utils.get_random_secret_key())'
```
Le résultat doit être collé au niveau de la ligne `SECRET_KEY = "<coller ici>"` du fichier de configuration.
Attention à bien conserver les double-quotes !

Pour vérifier si l'installation est correcte, il faut appliquer les migrations pour créer la base de données et lancer le serveur.
Pour le moment, la base de données est configurée en local dans le fichier `db.sqlite3` (répertorié dans le `.gitignore` donc en dehors de git).
Ceci permet à chaque développeur d'avoir sa base locale et de pouvoir facilement reprendre les choses.

```
(flairsou) $ python manage.py makemigrations flairsou_api
(flairsou) $ python manage.py migrate
(flairsou) $ python manage.py runserver
```

Si tout fonctionne, le serveur est lancé sur `localhost:8000`, il faut donc aller sur ce lien en navigateur pour voir le résultat.
A ce stade, on devrait avoir la page par défaut de Django qui nous dit que l'installation a fonctionné.

### React

Pour installer React et les autres dépendances JavaScript, il faut disposer de nodejs/npm.

Ensuite, dans le dossier `flairsou_frontend` :

Installer les dépendances :

```
$ npm install
```

Ensuite, il faut compliler le React en JavaScript pouvant être servi par Django à un navigateur.
Pour un environement de développement :

```
$ npm run dev
```

Pour un environement de production :

```
$ npm run prod
```

Le frontend react est alors prêt à être servi par Django.

### Git Hooks

Les Hooks sont mis en place pour tester les modifications avant de valider les commits.
L'idée est d'exécuter des petits tests avant de valider les commits avant de les push, comme la vérification de syntaxe ou de format.
Les hooks sont synchronisés avec le dépôt dans le dossier `hooks` mais ils doivent être installés dans le répertoire `.git`.
Pour cela, un script d'installation est fourni, qu'il faut exécuter depuis l'intérieur du dépôt (`git status` doit fonctionner) :

```
$ hooks/install.sh
```

Après ça, chaque commit sera testé automatiquement.
Si les tests ne sont pas validés, le commit sera refusé.
Les erreurs sont affichées dans la console.

En cas d'absolue nécessité, il est possible de réaliser un commit sans passer par les tests avec l'option `--no-verify` :

```
git commit --no-verify -m "<message>"
```

Dans ce cas, les tests ne seront pas effectués.

## Règles de style

### Mise en forme des fichiers Python

Pour une meilleure lisibilité du code et une homogénéité entre les développeurs, des outils de vérification et de mise en forme des fichiers Python sont listés dans le fichier `requirements.txt`.
On dipose de `pyflakes` pour la vérification syntaxique et de `yapf` pour la mise en forme.

Avant de faire la mise en forme d'un fichier Python, il faut s'assurer qu'il est syntaxiquement correct.
Pour cela, on utilise `pyflakes` :

```
pyflakes fichier.py
```

Les éventuelles erreurs sont listées par `pyflakes`.
Si des erreurs sont détectées par `pyflakes`, le commit sera refusé.

Une fois que le fichier ne présente pas d'erreurs de syntaxe, on peut faire la mise en forme.
Le dépôt est configuré pour installer l'utilitaire `yapf` qui permet de faire la mise en forme des fichiers Python.
Si le fichier n'est pas correctement formaté, le commit sera refusé.
Pour formater un fichier Python, on utilise `yapf` comme suit :

```
yapf -i fichier.py
```

L'option `-i` permet de faire la correction du format directement dans le fichier.
Le fichier résultant est donc correctement formaté et peut être commit.

### Mise en forme des fichier JavaScript

Les fichiers `.js` et `.jsx` sont analysés dans les hooks par le linter `eslint`.
La configuration utilisées est Airbnb/React qui est une configuration très stricte.

Pour lancer à la main le linter, se rendre dans `flairsou_frontend` et lancer `npm run lint`.
Il est également possible de demander au linter de régler une partie des problèmes avec la commande `npm run lint-fix`.
