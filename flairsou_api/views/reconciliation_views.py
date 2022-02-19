from rest_framework import mixins
from rest_framework import generics

import flairsou_api.models as fm
import flairsou_api.serializers as fs

from flairsou_api.utils import UserAllowed


class ReconciliationView(
    mixins.RetrieveModelMixin, mixins.CreateModelMixin, generics.GenericAPIView
):
    """
    Vue qui gère le rapprochement du compte
    """

    serializer_class = fs.ReconciliationSerializer
    permission_classes = [UserAllowed]

    def get(self, request, *args, **kwargs):
        """
        Renvoie le dernier rapprochement du compte s'il y en a un
        """
        return self.retrieve(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        """
        Crée un nouveau rapprochement pour le compte
        """
        return self.create(request, *args, **kwargs)

    def get_object(self) -> fm.Reconciliation:
        """
        Indique comment récupérer l'objet à partir de la requête qui
        contient la clé primaire du compte associé
        """
        # clé primaire du compte
        account_pk = self.kwargs[self.lookup_field]

        # on récupère le compte avec la gestion du 404 par drf
        account = generics.get_object_or_404(fm.Account.objects.all(), id=account_pk)

        # on renvoie l'objet rapprochement
        obj = account.last_reconciliation

        # vérification de l'autorisation sur le compte demandé
        self.check_object_permissions(self.request, account)

        return obj
