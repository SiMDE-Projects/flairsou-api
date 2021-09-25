from rest_framework import mixins
from rest_framework import generics

import flairsou_api.models as fm
import flairsou_api.serializers as fs


class AccountCreation(mixins.CreateModelMixin, generics.GenericAPIView):
    """
    Vue qui qui permet de créer un nouveau compte dans la base.
    """
    serializer_class = fs.AccountSerializer

    def post(self, request, *args, **kwargs):
        """
        Crée un nouveau compte
        """
        return self.create(request, *args, **kwargs)


class AccountListFilter(mixins.ListModelMixin, generics.GenericAPIView):
    """
    Vue qui permet de récupérer une liste de comptes par rapport à un filtrage
    """
    serializer_class = fs.AccountSerializer

    def get_queryset(self):
        """
        Adapte la queryset en fonction de la requête qui a été passée.
        Les filtres possibles sont :
        - book : clé primaire sur le livre associé aux comptes à retourner
        """
        queryset = fm.Account.objects.all()

        book_pk = self.kwargs.get('book')
        if book_pk is not None:
            queryset = queryset.filter(book__pk=book_pk)

        return queryset

    def get(self, request, *args, **kwargs):
        """
        Renvoie la liste des comptes en fonction du filtre utilisé
        """
        return self.list(request, *args, **kwargs)


class AccountDetail(mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                    mixins.DestroyModelMixin, generics.GenericAPIView):
    """
    Vue qui fournit le détail d'un compte et qui permet de mettre à jour
    un compte existant
    """
    queryset = fm.Account.objects.all()
    serializer_class = fs.AccountSerializer

    def get(self, request, *args, **kwargs):
        """
        Sur une requête GET, renvoie la liste des comptes
        """
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        """
        Sur une requee PUT, met à jour le compte
        """
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        """
        Sur une requête DELETE, supprime le compte
        """
        return self.destroy(request, *args, **kwargs)
