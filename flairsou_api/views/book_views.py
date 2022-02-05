from rest_framework import mixins
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied

import flairsou_api.models as fm
import flairsou_api.serializers as fs

from flairsou_api.utils import UserAllowed


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

        if not UserAllowed.check_entity_allowed(str(entity), self.request):
            raise PermissionDenied()

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
    permission_classes = [UserAllowed]

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


class BookAccountList(mixins.RetrieveModelMixin, generics.GenericAPIView):
    """
    Vue qui renvoie l'ensemble des comptes associés au livre passé dans
    la requête
    """
    queryset = fm.Book.objects.all()
    serializer_class = fs.BookWithAccountsSerializer
    permission_classes = [UserAllowed]

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)
