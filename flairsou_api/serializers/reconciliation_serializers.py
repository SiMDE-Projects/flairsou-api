from .flairsou_serializers import FlairsouModelSerializer
from flairsou_api.models import Reconciliation


class ReconciliationSerializer(FlairsouModelSerializer):
    """
    Serializer pour les rapprochements
    """
    class Meta:
        model = Reconciliation
        fields = ['pk', 'account', 'date', 'balance']

    def validate(self, data):
        # TODO
        pass
