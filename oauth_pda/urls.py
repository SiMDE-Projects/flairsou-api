from django.urls import path
from django.conf import settings

from .views import GetAuthorizationLink
from .views import request_oauth_token
from .views import user_logout

app_name = 'oauth_pda'
urlpatterns = [
    # route pour récupérer le lien d'autorisation OAuth
    path(
        settings.OAUTH_SETTINGS.get('authorization_route', 'authlink'),
        GetAuthorizationLink.as_view(),
        name="request-auth-link",
    ),
    # route pour récupérer les tokens OAuth sur le callback
    # de l'autorisation
    path(
        settings.OAUTH_SETTINGS.get('callback_route', 'callback'),
        request_oauth_token,
        name="request-oauth-token",
    ),
    # route pour déconnecter l'utilisateur
    path(
        settings.OAUTH_SETTINGS.get('logout_route', 'logout'),
        user_logout,
        name="user-logout",
    ),
]
