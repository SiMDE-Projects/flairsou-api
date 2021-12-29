from rest_framework.decorators import api_view
from rest_framework import views
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import redirect
from django.conf import settings

from drf_spectacular.utils import extend_schema, OpenApiParameter
from oauthlib.oauth2 import WebApplicationClient
import requests

from .serializers import AuthorizationLink
from .serializers import AuthorizationLinkSerializer
from .serializers import UserInfo
from .serializers import UserInfoSerializer
from .serializers import AnonymousUserInfo


class GetUserInfo(views.APIView):
    """
    Vue qui renvoie les informations de l'utilisateur connecté
    """
    serializer_class = UserInfoSerializer

    def get(self, request, *args, **kwargs):
        try:
            user: UserInfo = request.session['user']
            resp_status = status.HTTP_200_OK
        except KeyError:
            user = AnonymousUserInfo
            resp_status = status.HTTP_401_UNAUTHORIZED

        return Response(UserInfoSerializer(user).data, status=resp_status)


class GetAuthorizationLink(views.APIView):
    """
    Vue qui renvoie le lien d'autorisation pour demander à l'utilisateur
    son accord pour le partage des données avec l'application
    """
    serializer_class = AuthorizationLinkSerializer

    def get(self, request, *args, **kwargs):
        serializer = AuthorizationLinkSerializer(AuthorizationLink())
        return Response(serializer.data)


@extend_schema(
    # extra parameters added to the schema
    parameters=[
        OpenApiParameter(
            name='code',
            description="Code d'autorisation fourni par le portail",
            location=OpenApiParameter.QUERY,
            required=False,
            type=str),
    ])
@api_view(['GET'])
def request_oauth_token(request):
    """
    Vue qui récupère le token OAuth depuis le portail des assos
    à partir du code fourni par le callback de l'autorisation, et qui
    stocke le token et les infos de l'utilisateur dans la session Django.
    L'API ne renvoie rien.
    """
    code: str = request.query_params['code']

    # création du client OAuth
    client = WebApplicationClient(settings.OAUTH_SETTINGS['client_id'])

    # construction du contenu de la requête pour récupérer le token
    data = client.prepare_request_body(
        code=code,
        redirect_uri=settings.OAUTH_SETTINGS['redirect_uri'],
        client_id=settings.OAUTH_SETTINGS['client_id'],
        client_secret=settings.OAUTH_SETTINGS['client_secret'],
    )

    # exécution de la requête POST sur l'URL de demande de token
    response = requests.post(
        settings.OAUTH_SETTINGS['token_url'],
        data=data,
        headers={'Content-Type': 'application/x-www-form-urlencoded'})

    # récupération de la réponse
    res = client.parse_request_body_response(response.text)

    # ajout du token sur la session
    request.session['token'] = res

    # récupération des infos de l'utilisateur connecté
    response = requests.get(
        'https://assos.utc.fr/api/v1/user',
        headers={'Authorization': 'Bearer {}'.format(res['access_token'])})

    # ajout des infos de l'utilisateur à la session
    request.session['user'] = UserInfoSerializer(UserInfo(
        response.json())).data

    # redirige sur l'accueil de Flairsou
    return redirect('/')


@api_view(['GET'])
def user_logout(request):
    """
    Vue qui supprime la session de l'utilisateur
    """
    if 'user' in request.session:
        request.session.pop('user')

    if 'token' in request.session:
        request.session.pop('token')

    # renvoie sur l'accueil
    return redirect('/')
