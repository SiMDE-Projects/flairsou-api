from rest_framework.decorators import api_view
from rest_framework import views
from rest_framework.response import Response
from django.shortcuts import redirect

from oauthlib.oauth2 import WebApplicationClient
import requests

from flairsou.config import OAUTH_SETTINGS

import proxy_portail.serializers as pps


class GetAuthorizationLink(views.APIView):
    """
    Vue qui renvoie le lien d'autorisation pour demander à l'utilisateur
    son accord pour le partage des données avec l'application
    """
    serializer_class = pps.AuthorizationLinkSerializer

    def get(self, request, *args, **kwargs):
        serializer = pps.AuthorizationLinkSerializer(pps.AuthorizationLink())
        return Response(serializer.data)


@api_view(['GET'])
def request_oauth_token(request, code: str):
    """
    Vue qui récupère le token OAuth depuis le portail des assos
    à partir du code fourni par le callback de l'autorisation, et qui
    stocke le token et les infos de l'utilisateur dans la session Django.
    L'API ne renvoie rien.
    """
    # création du client OAuth
    client = WebApplicationClient(OAUTH_SETTINGS['client_id'])

    # construction du contenu de la requête pour récupérer le token
    data = client.prepare_request_body(
        code=code,
        redirect_uri=OAUTH_SETTINGS['redirect_uri'],
        client_id=OAUTH_SETTINGS['client_id'],
        client_secret=OAUTH_SETTINGS['client_secret'],
    )

    # exécution de la requête POST sur l'URL de demande de token
    response = requests.post(
        OAUTH_SETTINGS['token_url'],
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
    request.session['user'] = pps.UserInfoSerializer(
        pps.UserInfo(response.json())).data

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
