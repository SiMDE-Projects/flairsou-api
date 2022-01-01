from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

import requests


@api_view(['GET'])
def get_user_info(request):
    if 'token' not in request.session.keys():
        return Response({'message': 'Utilisateur non identifié'},
                        status=status.HTTP_401_UNAUTHORIZED)

    token = request.session['token']
    response = requests.get(
        'https://assos.utc.fr/api/v1/user',
        headers={'Authorization': 'Bearer {}'.format(token['access_token'])})

    return Response(response.json())
