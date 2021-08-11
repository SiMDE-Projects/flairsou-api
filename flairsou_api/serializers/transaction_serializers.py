from .flairsou_serializers import FlairsouModelSerializer
from flairsou_api.models import Transaction, Operation, Account

from django.db import transaction


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

    def validate(self, data):
        """
        Validation de la transaction au niveau global
        * vérification de l'équilibre des opérations
        * vérification d'une seule opération par compte
        """
        #TODO
        return data

    def validate_date(self, date):
        """
        Vérifie que la date saisie pour la transaction est postérieure au
        dernier rapprochement des comptes associés
        """
        import pdb
        pdb.set_trace()
        for op in self.initial_data['operations']:
            try:
                # récupérer le compte associé
                # TODO : que faire quand le compte n'existe pas ?
                # => validation opérations
                account = Account.objects.get(id=int(op['account']))
            except:
                # si le compte n'est pas valide, alors on passe à
                # l'opération suivante, ça sera géré dans la validation
                # des opérations
                continue

            if account.reconciliation_set.count() > 0:
                # si des rapprochements ont été effectués, on vérifie que
                # la date de la transaction est bien après la date du dernier
                # rapprochement, sinon on lève une exception
                last_reconc_date = account.reconciliation_set.order_by(
                    'date').last().date
                if date < last_reconc_date:
                    raise self.ValidationError(
                        'Les transactions ne peuvent pas être antiérieures'
                        ' au dernier rapprochement')

        return date

    def create(self, validated_data):
        """
        Fonction de création d'un objet Transaction et des objets Operation
        associés. On a validé les données dans l'étape de validation, on peut
        simplement faire la création ici.
        """
        operations = validated_data.pop('operations')
        with transaction.atomic():
            # on crée la transaction pour avoir la référence
            tr = Transaction.objects.create(**validated_data)

            # pour chaque opération, on crée l'objet correspondant
            for op in operations:
                # on ajoute la transaction dans le dictionnaire de l'opération
                op['transaction'] = tr
                Operation.objects.create(**op)

        return tr

    def update(self, instance, validated_data):
        """
        Fonction de mise à jour d'un objet Transaction
        """
        pass
