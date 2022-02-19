from django.db import models
from django.conf import settings

from .timestamped import TimeStampedModel


class Reconciliation(TimeStampedModel):
    """
    Modèle de rapprochement.

    Attributes
    ----------

    account : ForeignKey
        Clé étrangère vers le compte à rapprocher

    date : DateField
        Date à laquelle le rapprochement est effectif (i.e. la date de fin de
        période indiquée sur le relevé de banque,
        pas la date de saisie du rapprochement)

    balance : PositiveIntegerField
        Solde rapproché du compte à la date de fin de période, qui doit
        correspondre à celui indiqué sur le relevé de banque.
    """
    account = models.ForeignKey('Account', on_delete=models.CASCADE)
    date = models.DateField("Date")
    balance = models.IntegerField("solde")

    def __str__(self):
        return "Reconciliation of account {} on {}".format(
            self.account, self.date)

    class Meta:
        constraints = []

        # on ne peut avoir qu'un rapprochement par date pour un compte
        constraints.append(
            models.UniqueConstraint(
                fields=['account', 'date'],
                name="%(app_label)s_%(class)s_one_reconc_per_date"))

    def check_user_allowed(self, request) -> bool:
        """
        Vérifie si l'utilisateur passé dans la requête est autorisé à accéder
        à l'objet
        """
        if settings.DEBUG:
            # si l'app est en debug, on ne vérifie pas les autorisations
            return True

        if 'assos' not in request.session.keys():
            # utilisateur non connecté
            return False

        return self.account.check_user_allowed(request)
