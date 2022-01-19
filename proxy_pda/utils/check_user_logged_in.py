from rest_framework.exceptions import NotAuthenticated


def check_user_logged_in(request):
    """
    Vérifie si l'utilisateur est connecté dans la requête.
    La vérification se fait à partir du token car c'est le token qui
    est supprimé lors de l'appel au bouton (dans la version actuelle
    de oauth_pda_app, à voir si c'est mis à jour)

    TODO : voir si on ne peut pas mettre en place un modèle
    d'utilisateur quelque part
    """
    if 'token' not in request.session:
        raise NotAuthenticated()
