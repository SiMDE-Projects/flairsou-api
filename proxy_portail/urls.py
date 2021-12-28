from django.urls import path

from . import views

app_name = 'proxy_portail'
urlpatterns = [
    # route pour récupérer le lien d'autorisation OAuth
    path(
        'oauth/authlink',
        views.GetAuthorizationLink.as_view(),
        name="request-auth-link",
    ),
    # route pour récupérer les tokens OAuth
    path(
        'oauth/request_token/<str:code>',
        views.request_oauth_token,
        name="request-oauth-token",
    ),
    # route pour déconnecter l'utilisateur
    path(
        'oauth/logout',
        views.user_logout,
        name="user-logout",
    ),
    # route pour récupérer les infos utilisateur
    path(
        'proxy/user_infos',
        views.get_user_infos,
        name="get-user-infos",
    ),
]
