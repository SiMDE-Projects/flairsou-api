from django.db import models

from flairsou import config
from .timestamped import TimeStampedModel
from .operation import Operation


class Transaction(TimeStampedModel):
    """
    Modèle de transaction.

    Attributes
    ----------

    date : DateField
        Date de la transaction.

    checked : BooleanField
        Champ qui indique si la transaction est pointée ou non.

    invoice : FileField
        Champ permettant de stocker un fichier associé à la transaction.
    """
    date = models.DateField("Date")
    checked = models.BooleanField("Checked", default=False)
    invoice = models.FileField(
        "Invoice",
        upload_to=config.UPLOAD_PATH,  # TODO régler le chemin d'envoi
        blank=False,
        null=True)

    def __str__(self):
        return "{} on {}".format(self.pk, self.date)

    def operations(self):
        """
        Renvoie la liste des opérations associées à la transaction courante
        """
        return self.operation_set.all()

    def filter_by_entity(entity: str):
        """
        Filtre les transactions associées à une entité particulière

        entity est un str représentant un UUID valide
        """
        # récupération de toutes les opérations associées à cette entité
        operations = Operation.objects.filter(account__book__entity=entity)

        # récupération des transactions liées aux opérations
        transactions = operations.values('transaction').distinct()

        # construction du queryset correspondant aux transactions concernées
        queryset = Transaction.objects.filter(id__in=transactions)

        return queryset

    def is_reconciliated(self) -> bool:
        """
        Indique si la transaction actuelle est rapprochée ou non, c'est à dire
        si elle est associée à un compte qui a été rapproché après la date de
        la transaction
        """
        for op in self.operations():
            # vérifie la date de rapprochement de chaque compte
            # de la transaction
            if op.account.reconciliation_set.count() > 0:
                last_reconc_date = op.account.reconciliation_set.order_by(
                    'date').last().date
                if self.date < last_reconc_date:
                    return True

        return False
