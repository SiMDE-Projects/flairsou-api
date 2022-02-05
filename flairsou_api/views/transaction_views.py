from rest_framework import mixins
from rest_framework import generics

import flairsou_api.models as fm
import flairsou_api.serializers as fs

from flairsou_api.utils import UserAllowed


class TransactionCreate(mixins.CreateModelMixin, generics.GenericAPIView):
    """
    Vue qui permet de créer une nouvelle transaction.
    """
    serializer_class = fs.TransactionSerializer

    def post(self, request, *args, **kwargs):
        """
        Création d'une nouvelle transaction
        """
        return self.create(request, *args, **kwargs)


class TransactionDetail(mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                        mixins.DestroyModelMixin, generics.GenericAPIView):
    """
    Vue qui fournit le détail d'une transaction par son identifiant
    """
    queryset = fm.Transaction.objects.all()
    serializer_class = fs.TransactionSerializer
    permission_classes = [UserAllowed]

    def get(self, request, *args, **kwargs):
        """
        Sur une requête GET, renvoie le détail de la transaction demandée
        """
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        """
        Sur une requete PUT, met à jour la transaction
        """
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        """
        Supprime la transaction
        """
        return self.destroy(request, *args, **kwargs)
