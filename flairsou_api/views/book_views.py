from rest_framework import mixins
from rest_framework import generics

import flairsou_api.models as fm
import flairsou_api.serializers as fs


class BookList(mixins.ListModelMixin, mixins.CreateModelMixin,
               generics.GenericAPIView):
    """
    Vue qui fournit la liste des livres créés et qui permet de créer un
    nouveau livre dans la base.
    """
    serializer_class = fs.BookSerializer

    def get_queryset(self):
        """
        Adapte la queryset en fonction de la requête qui a été passée.
        Les filtres possibles sont :
        - entity : uuid de l'entité associée aux livres à retourner
        """
        queryset = fm.Book.objects.all()

        entity = self.request.query_params.get('entity')
        if entity is not None:
            queryset = queryset.filter(entity=entity)

        return queryset

    def get(self, request, *args, **kwargs):
        """
        Sur une requête GET, renvoie la liste de tous les livres
        """
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        """
        Sur une requête POST, crée un nouveau livre
        """
        return self.create(request, *args, **kwargs)


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
        Sur une requête GET, renvoie le détail du livre
        """
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        """
        Sur une requete PUT, met à jour le livre
        """
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        """
        Sur une requête DELETE, supprime le livre
        """
        return self.destroy(request, *args, **kwargs)
