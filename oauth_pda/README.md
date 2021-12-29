# Module OAuth pour Django avec le portail des assos

Ce module permet de mettre en place l'authentification OAuth avec le portail des assos pour une application web développée avec Django côté serveur.
Le module fournit uniquement des APIs côté serveur, qui peuvent être appelées depuis n'importe quel frontend.

## Principe de fonctionnement de OAuth sur le portail

OAuth permet à une application tierce d'accéder aux données de l'utilisateur depuis le portail des assos.
Pour cela, l'utilisateur doit autoriser l'application à accéder à ses données en se connectant sur le portail.
Cette autorisation se fait en trois étapes :

1. L'application demande à l'utilisateur l'autorisation de récupérer ses données : l'utilisateur est renvoyé sur une interface d'autorisation, fournie par le portail des assos, et doit valider le partage des informations
2. Si l'utilisateur valide, le navigateur est redirigé sur une route de callback prédéfinie, avec un code d'autorisation présent dans l'URL
3. L'application utilise le code d'autorisation pour demander au portail des assos un jeton d'accès, qui permet ensuite d'accéder aux API du portail pour lesquelles l'autorisation a été donnée

Ce module permet de mettre en place ces trois étapes.

Pour utiliser OAuth sur le portail des assos, il faut impérativement disposer des éléments suivants :
- identifiant de l'application cliente
- secret de l'application cliente
- scopes des permissions à récupérer
- adresse URI de callback suite à l'autorisation

Ces éléments peuvent être obtenus auprès du SiMDE.

## Intégration avec Django

### Autorisation de l'application

Pour autoriser l'application à accéder aux données, l'utilisateur doit être dirigé vers une page de validation, avec les informations de l'application cliente.
Le module fournit donc une route `/authlink` qui renvoie un fichier JSON contenant le lien de connexion correspondant à l'application cliente, par exemple :

```
{
  "link": "https://assos.utc.fr/oauth/authorize?response_type=code&client_id=...&redirect_uri=...&..."

}
```

Un frontend en javascript pourra par exemple faire une requête sur la route `/authlink` pour obtenir ce lien et afficher un lien de connexion.

### Redirection sur une route de callback

La réponse de la page d'authentification doit être redirigée sur la route de callback `/callback`.
L'URI de redirection est configurée lors de la création des identifiants OAuth de l'application.
Le module récupère alors la requête redirigée et le code d'autorisation associé.

### Récupération du token

Sur la route de callback, le module échange le code d'autorisation avec le portail des assos pour récupérer les tokens d'accès et d'actualisation.
Ces tokens sont enregistrés dans la session Django courante, sous la forme d'un dictionnaire de cette forme :

```
{
  'token_type': 'Bearer',
  'expires_in': 1296000,
  'access_token': '...',
  'refresh_token': '...',
  'expires_at': 1641970704.6022804
}
```

Les tokens enregistrés dans la session sont ensuite accessibles dans le backend Django avec d'autres applications, et ne sont pas directement accessibles par le frontend.
Ils peuvent être utilisés pour authentifier les requêtes aux différentes APIs du portail des assos.

L'utilisateur est ensuite redirigé sur l'accueil de l'application.

## Installation

## Configuration
