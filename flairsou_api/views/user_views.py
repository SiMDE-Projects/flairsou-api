from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import serializers
from django.shortcuts import redirect
from drf_spectacular.utils import extend_schema, inline_serializer

from oauthlib.oauth2 import WebApplicationClient
import requests

from flairsou.config import OAUTH_SETTINGS


# TODO faire un petit serializer rapide pour automatiser la doc ?
@extend_schema(
    responses={
        200:
        inline_serializer(
            name='Authorization Link',
            fields={
                'link': serializers.CharField(),
            },
        )
    }, )
@api_view(['GET'])
def get_authorization_link(request):
    """
    Construction du lien d'autorisation oauth
    """
    # création du client oauth avec l'ID du client
    client = WebApplicationClient(OAUTH_SETTINGS['client_id'])

    # construction de la requête d'autorisation oauth
    url = client.prepare_request_uri(
        OAUTH_SETTINGS['authorization_url'],
        redirect_uri=OAUTH_SETTINGS['redirect_uri'],
        scope=OAUTH_SETTINGS['scopes'])

    return Response({'link': url})


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
    request.session['user'] = response.json()

    # redirige sur l'accueil de Flairsou
    return redirect('/')
