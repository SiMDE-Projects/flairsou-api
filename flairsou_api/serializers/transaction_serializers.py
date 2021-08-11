from .flairsou_serializers import FlairsouModelSerializer
from flairsou_api.models import Transaction, Operation


class OperationSerializer(FlairsouModelSerializer):
    """
    Serializer basique pour la classe Operation
    """
    class Meta:
        model = Operation
        fields = ['credit', 'debit', 'label', 'account']


class TransactionSerializer(FlairsouModelSerializer):
    """
    Serializer pour la classe Transaction. Ce Serializer inclut dans chaque
    transaction le détail des opérations associées, ce qui permet d'avoir
    toutes les informations de la transaction directement. Il permet également
    de créer des nouvelles transactions en passant directement les opérations.
    """

    # ajout d'un champ operations pour représenter les opérations comme des
    # sous-attributs de la transaction, de sorte qu'on a directement toutes
    # les opérations dans la transaction. L'option many=True permet de
    # préciser qu'on va avoir une liste d'opérations dans la transaction
    operations = OperationSerializer(many=True)

    class Meta:
        model = Transaction
        fields = ['pk', 'date', 'checked', 'invoice', 'operations']

    # TODO
    # voir ici :
    # https://www.django-rest-framework.org/api-guide/serializers/#writable-nested-representations
    # mettre le tout dans une transaction db pour éviter les incohérences
    def create(self, validated_data):
        """
        Fonction de création d'un objet Transaction et des objets Operation
        associés
        """
        pass

    def update(self, instance, validated_data):
        """
        Fonction de mise à jour d'un objet Transaction
        """
        pass
