from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET'])
def get_user_infos(request):
    """
    Vue qui renvoie les informations de l'utilisateur connecté
    """

    try:
        return Response(request.session['user'])
    except KeyError:
        return Response({'message': 'Non authentifié'},
                        status=status.HTTP_401_UNAUTHORIZED)
