from django.urls import path

from .views import GetAuthorizationLink
from .views import request_oauth_token
from .views import user_logout
from .views import GetUserInfo

app_name = 'proxy_portail'
urlpatterns = [
    # route pour récupérer le lien d'autorisation OAuth
    path(
        'authlink',
        GetAuthorizationLink.as_view(),
        name="request-auth-link",
    ),
    # route pour récupérer les tokens OAuth sur le callback
    # de l'autorisation
    path(
        'callback',
        request_oauth_token,
        name="request-oauth-token",
    ),
    # route pour déconnecter l'utilisateur
    path(
        'logout',
        user_logout,
        name="user-logout",
    ),
    # route pour récupérer les infos utilisateur
    path(
        'user_infos',
        GetUserInfo.as_view(),
        name="get-user-infos",
    ),
]
