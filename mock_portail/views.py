from rest_framework.response import Response
from rest_framework.decorators import api_view

import uuid


@api_view(['GET'])
def get_association_list(request, pk):
    """
    Renvoie la liste des associations auxquelles l'utilisateur authentifié
    est associé. La liste est de taille variable, et le code est pas terrible
    mais c'est pour produire un résultat facilement.
    """
    # version mise de côté pour simplifier et éviter d'utiliser un système
    # d'auth pour le moment
    #if not request.user.is_authenticated:
    #    data = {'error': 'user not authenticated'}
    #else:
    #    user = request.user
    #    data = {'assos': []}
    #    entities = [
    #        user.entity1, user.entity2, user.entity3, user.entity4,
    #        user.entity5
    #    ]
    #    for entity in entities:
    #        if entity is not None:
    #            data['assos'].append(entity)

    data = {'assos': []}

    if pk == 1:
        data['assos'].append(uuid.UUID(int=1))
    elif pk == 2:
        data['assos'].append(uuid.UUID(int=1))
        data['assos'].append(uuid.UUID(int=2))
    elif pk == 3:
        data['assos'].append(uuid.UUID(int=1))
        data['assos'].append(uuid.UUID(int=2))
        data['assos'].append(uuid.UUID(int=3))

    return Response(data)
