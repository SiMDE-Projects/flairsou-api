# Mock Portail

Cette petite app Django a pour but de simuler l'interface du portail des assos, en fournissant un système d'authentification et une route pour lister les associations auxquelles l'utilisateur est inscrit.

## Routes

`mock_portail/login/` -> renvoie vers une page d'authentification avec un formulaire de base pour connecter l'utilisateur.
Cette route permet de créer une session qui periste pour les autres requêtes.

`mock_portail/list_assos/` -> renvoie un fichier JSON avec la liste des associations auxquelles l'utilisateur connecté est inscrit :

```json
{
	'assos': [uuid1, uuid2...]
}
```

Si l'utilisateur n'est pas connecté, la route renvoie une erreur :
```json
{
    "error": "user not authenticated"
}
```

## Authentification

Pour créer un utilisateur, il faut utiliser l'interface admin (`/admin/`).
Il faut saisir un nom d'utilisateur, un mot de passe, et il est possible de lui ajouter jusqu'à 5 associations sous la forme d'un [UUID](https://docs.python.org/3/library/uuid.html).
