from django.db import models
from django.conf import settings
import datetime

from .timestamped import TimeStampedModel


class Operation(TimeStampedModel):
    """
    Modèle d'opération.

    Attributes
    ----------

    credit : PositiveIntegerField
        Champ d'entier positif représentant le crédit de l'opération

    debit : PositiveIntegerField
        Champ d'entier positif représentant le débit de l'opération

    label : CharField
        Champ de texte pour enregistrer le label de l'opération.

    account : ForeignKey
        Clé étrangère vers le compte affecté par l'opération

    transaction : ForeignKey
        Clé étrangère vers la transaction associée à l'opération
    """
    credit = models.PositiveIntegerField("Credit")
    debit = models.PositiveIntegerField("Debit")
    label = models.CharField("Operation label",
                             max_length=128,
                             blank=False,
                             null=True)
    account = models.ForeignKey('Account', on_delete=models.PROTECT)
    transaction = models.ForeignKey('Transaction', on_delete=models.CASCADE)

    def __str__(self):
        return "Account: {}, label: {}, transaction: {}".format(
            self.account, self.label, self.transaction)

    @property
    def date(self) -> datetime.date:
        return self.transaction.date

    @property
    def reconciliated(self) -> bool:
        return self.transaction.is_reconciliated()

    @property
    def accountFullName(self) -> str:
        return self.account.fullName

    class Meta:
        constraints = []

        # un compte ne peut pas être dans deux opérations de la même
        # transaction
        constraints.append(
            models.UniqueConstraint(
                name="%(app_label)s_%(class)s_unique_account_transaction",
                fields=['account', 'transaction']))

        # on doit remplir crédit ou débit mais pas les deux
        constraints.append(
            models.CheckConstraint(
                name="%(app_label)s_%(class)s_debit_xor_credit",
                check=(models.Q(credit=0, debit__gt=0))
                | models.Q(credit__gt=0, debit=0)))

    def check_user_allowed(self, request) -> bool:
        """
        Vérifie si l'utilisateur passé dans la requête est autorisé à accéder
        à l'objet
        """
        if settings.DEBUG:
            # si l'app est en debug, on ne vérifie pas les autorisations
            return True

        # l'utilisateur peut accéder à l'opération s'il peut accéder au compte
        # associé à l'opération
        return self.account.check_user_allowed(request)
