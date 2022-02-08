from .flairsou_serializers import FlairsouModelSerializer
from rest_framework import serializers
from flairsou_api.models import Account, Operation

from drf_spectacular.utils import extend_schema_field


class OperationDateSerializer(FlairsouModelSerializer):
    """
    Serializer réduit pour passer la liste des opérations associées
    à un compte, faisant uniquement intervenir la date, le crédit,
    le débit et le label de l'opération.
    """
    other_account = serializers.SerializerMethodField()

    class Meta:
        model = Operation
        fields = [
            'pk',
            'date',
            'credit',
            'debit',
            'label',
            'other_account',
            'reconciliated',
        ]

        read_only_fields = [
            'reconciliated',
        ]

    def validate(self, data):
        raise self.ValidationError('Ce serializer ne doit pas être utilisé'
                                   'pour enregistrer des données')

    def get_other_account(self, operation):
        other_accounts = operation.transaction.operation_set.exclude(
            pk=operation.pk)

        if len(other_accounts) == 1:
            return other_accounts[0].account.fullName
        else:
            return "Transaction répartie"


class AccountOpsListSerializer(FlairsouModelSerializer):
    """
    Serializer qui renvoie la liste des opérations liées
    à un compte
    """
    operation_set = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['pk', 'operation_set']

    @extend_schema_field(OperationDateSerializer(many=True))
    def get_operation_set(self, instance: Account):
        """
        Récupère la liste des opérations associées au compte triées
        par la date associée
        """
        ops = instance.operation_set.all().order_by('transaction__date')
        return OperationDateSerializer(ops, many=True).data
