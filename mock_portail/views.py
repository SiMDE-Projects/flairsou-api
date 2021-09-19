from rest_framework.response import Response
from rest_framework.decorators import api_view


@api_view(['GET'])
def get_association_list(request):
    """
    Renvoie la liste des associations auxquelles l'utilisateur authentifié
    est associé. La liste est de taille variable, et le code est pas terrible
    mais c'est pour produire un résultat facilement.
    """
    if not request.user.is_authenticated:
        data = {'error': 'user not authenticated'}
    else:
        user = request.user
        data = {'assos': []}
        entities = [
            user.entity1, user.entity2, user.entity3, user.entity4,
            user.entity5
        ]
        for entity in entities:
            if entity is not None:
                data['assos'].append(user.entity1)

    return Response(data)
