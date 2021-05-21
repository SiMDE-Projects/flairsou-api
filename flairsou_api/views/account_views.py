from rest_framework import mixins
from rest_framework import generics

import flairsou_api.models as fm
import flairsou_api.serializers as fs


class AccountList(mixins.ListModelMixin, mixins.CreateModelMixin,
                  generics.GenericAPIView):
    """
    Vue qui fournit la liste des comptes créés et qui permet de créer un
    nouveau compte dans la base.
    """
    serializer_class = fs.AccountSerializer

    def get_queryset(self):
        """
        Adapte la queryset en fonction de la requête qui a été passée.
        Les filtres possibles sont :
        - book : clé primaire sur le livre associé aux comptes à retourner
        """
        queryset = fm.Account.objects.all()

        book_pk = self.request.query_params.get('book')
        if book_pk is not None:
            queryset = queryset.filter(book__pk=book_pk)

        return queryset

    def get(self, request, *args, **kwargs):
        """
        Sur une requête GET, renvoie la liste de tous les comptes
        """
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        """
        Sur une requête POST, crée un nouveau compte
        """
        return self.create(request, *args, **kwargs)


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
