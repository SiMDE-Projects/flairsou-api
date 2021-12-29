from django.urls import path

from . import views

app_name = 'proxy_portail'
urlpatterns = [
    # route pour récupérer le lien d'autorisation OAuth
    path(
        'authlink',
        views.GetAuthorizationLink.as_view(),
        name="request-auth-link",
    ),
    # route pour récupérer les tokens OAuth
    path(
        'request_token/<str:code>',
        views.request_oauth_token,
        name="request-oauth-token",
    ),
    # route pour déconnecter l'utilisateur
    path(
        'logout',
        views.user_logout,
        name="user-logout",
    ),
    # route pour récupérer les infos utilisateur
    path(
        'user_infos',
        views.GetUserInfo.as_view(),
        name="get-user-infos",
    ),
]
