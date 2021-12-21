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
        Crée un nouveau compte avec les attributs suivants :
        - "name" : nom du compte
        - "account_type" : type du compte
            - 0 : Actif
            - 1 : Passif
            - 2 : Revenus
            - 3 : Dépenses
            - 4 : Capitaux Propres
        - "virtual" : booléen indiquant si le compte est virtuel ou non
        - "parent" : clé primaire du compte parent, peut être null
        - "book" : clé primaire du livre associé, obligatoire
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
        Renvoie le détail du compte passé en paramètre
        - id : clé primaire du compte à récupérer
        """
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        """
        Met à jour le compte passé en paramètre
        - id : clé primaire du compte à mettre à jour
        """
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        """
        Supprime le compte passé en paramètre
        - id : clé primaire du compte à supprimer
        """
        return self.destroy(request, *args, **kwargs)


class AccountBalance(mixins.RetrieveModelMixin, generics.GenericAPIView):
    """
    Vue qui fournit le solde d'un compte
    """
    queryset = fm.Account.objects.all()
    serializer_class = fs.AccountBalanceSerializer

    def get(self, request, *args, **kwargs):
        """
        Renvoie le solde du compte passé en paramètre
        """
        return self.retrieve(request, *args, **kwargs)


class AccountOpsList(mixins.RetrieveModelMixin, generics.GenericAPIView):
    """
    Vue qui renvoie la liste des opérations associées à un compte
    """
    queryset = fm.Account.objects.all()
    serializer_class = fs.AccountOpsListSerializer

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)
