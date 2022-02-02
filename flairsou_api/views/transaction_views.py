from rest_framework import mixins
from rest_framework import generics

import flairsou_api.models as fm
import flairsou_api.serializers as fs


# les deux classes Operation sont là pour le dev, mais il ne sera probablement
# pas nécessaire d'avoir une route uniquement pour les opérations, donc on
# pourra enlever ça plus tard
class OperationList(mixins.ListModelMixin, generics.GenericAPIView):
    """
    Vue qui fournit la liste des comptes créés et qui permet de créer un
    nouveau compte dans la base.
    """
    queryset = fm.Operation.objects.all()
    serializer_class = fs.OperationSerializer

    def get(self, request, *args, **kwargs):
        """
        Sur une requête GET, renvoie la liste de toutes les opérations
        """
        return self.list(request, *args, **kwargs)


class OperationDetail(mixins.RetrieveModelMixin, generics.GenericAPIView):
    """
    """
    queryset = fm.Operation.objects.all()
    serializer_class = fs.OperationSerializer

    def get(self, request, *args, **kwargs):
        """
        Sur une requête GET, renvoie la liste de l'opération demandée
        """
        return self.retrieve(request, *args, **kwargs)


##############################


class TransactionList(mixins.ListModelMixin, mixins.CreateModelMixin,
                      generics.GenericAPIView):
    """
    Vue qui fournit la liste des transactions créés et qui permet de créer
    une nouvelle transaction.
    """
    serializer_class = fs.TransactionSerializer

    def get_queryset(self):
        queryset = fm.Transaction.objects.all()

        # filtrage par entité
        # entity est un str représentant un UUID valide
        entity = self.request.query_params.get('entity')
        if entity is not None:
            queryset = fm.Transaction.filter_by_entity(entity)

        return queryset

    def get(self, request, *args, **kwargs):
        """
        Sur une requête GET, renvoie la liste de toutes les transactions
        """
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class TransactionDetail(mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                        mixins.DestroyModelMixin, generics.GenericAPIView):
    """
    Vue qui fournit le détail d'une transaction par son identifiant
    """
    queryset = fm.Transaction.objects.all()
    serializer_class = fs.TransactionSerializer

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
