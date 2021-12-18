from rest_framework.response import Response
from rest_framework.decorators import api_view

from flairsou_api.models import Book

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

    try:
        bookObj = Book.objets.get(id=1)
    except Book.DoesNotExist:
        return Response({'error': 'Aucun livre dans la base'})

    data = {'assos': []}

    if pk <= 1:
        data['assos'].append({'uuid': bookObj.entity, 'nom': bookObj.name})
    if pk <= 2:
        data['assos'].append({'uuid': uuid.UUID(int=2), 'nom': 'PAE-UTC'})
    if pk <= 3:
        data['assos'].append({'uuid': uuid.UUID(int=3), 'nom': 'Stravaganza'})

    return Response(data)
