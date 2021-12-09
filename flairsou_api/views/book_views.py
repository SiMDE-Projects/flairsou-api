from rest_framework import mixins
from rest_framework import generics
from rest_framework import views
from rest_framework.response import Response
from rest_framework.utils.serializer_helpers import ReturnList

from django.http import Http404

import flairsou_api.models as fm
import flairsou_api.serializers as fs


class BookCreation(mixins.CreateModelMixin, generics.GenericAPIView):
    """
    Vue permettant la création d'un nouveau livre de comptes
    """
    serializer_class = fs.BookSerializer

    def post(self, request, *args, **kwargs):
        """
        Crée un nouveau livre avec les paramètres suivants :
        - "name" : nom du livre à créer
        - "entity" : UUID correspondant à l'entité possédant le livre
        """
        return self.create(request, *args, **kwargs)


class BookListFilter(mixins.ListModelMixin, generics.GenericAPIView):
    """
    Vue qui fournit une liste de livres à partir d'un certain filtre
    """
    serializer_class = fs.BookSerializer

    def get_queryset(self):
        """
        Adapte la queryset en fonction de la requête qui a été passée.
        Les filtres possibles sont :
        - entity : UUID de l'entité associée aux livres à retourner
        """
        queryset = fm.Book.objects.all()

        entity = self.kwargs.get('entity')
        if entity is not None:
            queryset = queryset.filter(entity=entity)

        return queryset

    def get(self, request, *args, **kwargs):
        """
        Renvoie la liste des livres en fonction du filtre utilisé.
        Filtrages possibles :
        - par entité : {entity} => UUID de l'entité utilisée pour le filtre
        """
        return self.list(request, *args, **kwargs)


class BookDetail(mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                 mixins.DestroyModelMixin, generics.GenericAPIView):
    """
    Vue qui fournit le détail d'un livre et qui permet de mettre à jour
    un livre existant
    """
    queryset = fm.Book.objects.all()
    serializer_class = fs.BookSerializer

    def get(self, request, *args, **kwargs):
        """
        Renvoie le détail du livre passé en paramètre
        - id : clé primaire du livre à récupérer
        """
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        """
        Met à jour le livre passé en paramètre
        - id : clé primaire du livre à modifier
        """
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        """
        Supprime le livre passé en paramètre
        - id : clé primaire du livre à supprimer

        Attention : cette opération supprime tous les comptes associés à
        ce livre, et toutes les transactions associées à ces comptes !
        """
        return self.destroy(request, *args, **kwargs)


class BookAccountList(views.APIView):
    """
    Vue qui renvoie l'ensemble des comptes associés au livre passé dans
    la requête
    """
    def get(self, request, pk):
        try:
            # récupère le livre passé en paramètre
            obj = fm.Book.objects.get(id=pk)
        except fm.Book.DoesNotExist:
            raise Http404

        # récupérer la liste des comptes sous forme sérialisée
        # (une seule requête BDD)
        accounts = fs.AccountSerializer(obj.account_set.all(), many=True)

        # construction des données avec les comptes
        data = {
            'pk': obj.pk,
            'subaccounts': buildAccountTree(accounts.data, None),
        }

        return Response(data)


def buildAccountTree(accounts: ReturnList, parent: int) -> dict:
    """
    Fonction qui reconstruit un dictionnaire imbriqué de comptes
    à partir de la liste des comptes associés au livre
    """
    acc_dict = []

    for acc in accounts:
        if acc['parent'] == parent:
            da = dict(acc)
            da['subaccounts'] = buildAccountTree(accounts, acc['pk'])
            acc_dict.append(da)

    return acc_dict
