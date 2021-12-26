from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import serializers
from drf_spectacular.utils import extend_schema, inline_serializer

from oauthlib.oauth2 import WebApplicationClient

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
