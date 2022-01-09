from .flairsou_serializers import FlairsouModelSerializer
from flairsou_api.models import Transaction, Operation, Account

from django.db import transaction


class OperationSerializer(FlairsouModelSerializer):
    """
    Serializer basique pour la classe Operation
    """
    error_messages = {
        'account_virtual':
        "Les opérations doivent être associées à des comptes non virtuels",
        'two_amounts_zero':
        "L'opération doit avoir un débit ou un crédit non nul",
    }

    class Meta:
        model = Operation
        fields = ['pk', 'credit', 'debit', 'label', 'account']

    def validate_account(self, account):
        # vérifie que l'opération est liée à un compte non virtuel
        if account.virtual:
            raise self.ValidationError(
                OperationSerializer.error_messages['account_virtual'])

        return account

    def validate(self, data):
        """
        Validation de l'opération au niveau global.
        """

        # vérifie que credit et debit sont correctement définis (un seul
        # des deux montants >= 0)
        if data['credit'] == 0 and data['debit'] == 0:
            raise self.ValidationError(
                OperationSerializer.error_messages['two_amounts_zero'])

        if data['credit'] != 0 and data['debit'] != 0:
            data['credit'] -= data['debit']
            data['debit'] = 0

        if data['credit'] < 0 or data['debit'] < 0:
            tmp = data['debit']
            data['debit'] = -data['credit']
            data['credit'] = -tmp

        return data


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
        Validation de la transaction au niveau global. Chaque fonction de
        validation lève une ValidationError si les données ne sont pas
        correctes.
        data = {'date': Date, 'checked': boolean, 'invoice': file,
        'operations' : list({'credit': int, 'debit': int, 'label': str,
            'account': Account})}
        """

        # vérification de l'équilibre des opérations
        self.check_transaction_balanced(data)

        # vérification d'une seule opération par compte
        self.check_one_op_per_account(data)

        # vérification que toutes les opérations appartiennent au même livre
        self.check_all_ops_same_book(data)

        return data

    def validate_date(self, date):
        """
        Vérifie que la date saisie pour la transaction est postérieure au
        dernier rapprochement des comptes associés
        """
        for op in self.initial_data['operations']:
            try:
                # récupérer le compte associé
                account = Account.objects.get(id=int(op['account']))
            except Account.DoesNotExist:
                # si le compte n'est pas valide, alors on passe à
                # l'opération suivante, le compte invalide est relevé
                # lors de la validation des opérations
                continue

            if account.reconciliation_set.count() > 0:
                # si des rapprochements ont été effectués, on vérifie que
                # la date de la transaction est bien après la date du dernier
                # rapprochement, sinon on lève une exception
                last_reconc_date = account.reconciliation_set.order_by(
                    'date').last().date
                if date < last_reconc_date:
                    if self.instance is None:
                        # l'erreur ne concerne que la création
                        raise self.ValidationError(
                            'Les transactions ne peuvent pas être antiérieures'
                            ' au dernier rapprochement')

        return date

    def check_transaction_balanced(self, data):
        """
        Vérifie que la transaction en cours de validation (data) est
        correctement équilibrée
        """
        debits = 0
        credits = 0

        for op in data['operations']:
            debits += op['debit']
            credits += op['credit']

        if debits != credits:
            raise self.ValidationError('La transaction n\'est pas équilibrée.')

    def check_one_op_per_account(self, data):
        """
        Vérifie qu'un compte n'apparaît pas plusieurs fois dans
        la même transaction
        """
        accounts = []

        for op in data['operations']:
            if op['account'] in accounts:
                raise self.ValidationError(
                    'Le compte {} apparaît plusieurs fois dans la transaction'.
                    format(op['account']))
            else:
                accounts.append(op['account'])

    def check_all_ops_same_book(self, data):
        """
        Vérifie que les comptes liés à toutes les opérations sont associés
        au même livre
        """
        book = None
        for op in data['operations']:
            if book is None:
                book = op['account'].book
                continue

            if book != op['account'].book:
                raise self.ValidationError('Les opérations doivent être '
                                           'liées au même livre')

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

    def update(self, instance: Transaction, validated_data):
        """
        Fonction de mise à jour d'un objet Transaction et des objets Operation
        associés. On met à jour les éléments propres de la transaction, et on
        vérifie si chaque opération initiale est toujours présente. Si c'est
        le cas, on les met à jour, et sinon on supprime.
        """

        # on refuse la modification d'une transaction rapprochée
        if instance.is_reconciliated():
            raise self.ValidationError('Une transaction rapprochée '
                                       'ne peut pas être modifiée')

        # extrait les opérations du dict
        new_ops = validated_data.pop('operations')

        with transaction.atomic():
            # mise à jour des données propres à la transaction
            Transaction.objects.filter(id=instance.id).update(**validated_data)

            # récupération de la nouvelle instance
            instance = Transaction.objects.get(id=instance.id)

            # vérification des opérations

            # opérations pré-existantes
            previous_ops = list(instance.operation_set.all())

            # listes pour garder trace des opérations mises à jour
            updated_previous = list(False for x in previous_ops)
            updated_new = list(False for x in new_ops)

            for inew, new_op in enumerate(new_ops):
                for iprev, prev_op in enumerate(previous_ops):
                    if new_op['account'] == prev_op.account:
                        # l'opération new_op correspond à une opération
                        # précédente
                        Operation.objects.filter(id=prev_op.id).update(
                            **new_op)

                        # l'opération est mise à jour
                        updated_previous[iprev] = True
                        updated_new[inew] = True

            # on crée les opérations restantes s'il en reste
            for inew, new_op in enumerate(new_ops):
                if not updated_new[inew]:
                    new_op['transaction'] = instance
                    Operation.objects.create(**new_op)

            # on supprime les opérations précédentes s'il en reste
            for iprev, prev_op in enumerate(previous_ops):
                if not updated_previous[iprev]:
                    Operation.objects.filter(id=prev_op.id).delete()

        return instance
