# Flairsou

## Organisation du projet

Flairsou est un projet Django qui fournit une API Django le backend, et qui utilise React comme librairie front.

Le projet s'organise à haut niveau comme suit :

```
.
├── Documentation    => toute la documentation
├── flairsou         => projet Django de base
├── flairsou_api     => application Django pour l'API
└── requirements.txt => paquets python requis (voir la section d'installation)
```

## Installation

### Partie Python/Django

Pour installer Django et les autres dépendances Python, il est recommandé de créer un environnement virtuel à la racine du projet :

```
$ virtualenv venv
```

Ici, `venv` correspond au nom de l'environnement virtuel.
Il peut être renommé mais `venv` est déjà répertorié dans le `.gitignore` pour ne pas être commit.

L'environnement virtuel est ensuite activé par la commande :

```
$ source venv/bin/activate
(venv) $ => prêt pour les prochaines commandes
```

Cette commande doit être exécutée à chaque fois qu'on veut utiliser les paquets python (appliquer les migrations, lancer le serveur...).

Il reste alors à installer les paquets requis :

```
(venv) $ pip install -r requirements.txt
```

Pour vérifier si l'installation est correcte, il faut appliquer les migrations pour créer la base de données et lancer le serveur.
Pour le moment, la base de données est configurée en local dans le fichier `db.sqlite3` (répertorié dans le `.gitignore` donc en dehors de git).
Ceci permet à chaque développeur d'avoir sa base locale et de pouvoir facilement reprendre les choses.

```
(venv) $ python manage.py migrate
(venv) $ python manage.py runserver
```

Si tout fonctionne, le serveur est lancé sur `localhost:8000`, il faut donc aller sur ce lien en navigateur pour voir le résultat.
A ce stade, on devrait avoir la page par défaut de Django qui nous dit que l'installation a fonctionné.

## Rèles de style

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
