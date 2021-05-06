from django.db import models

from .timestamped import TimeStampedModel


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
        upload_to="uploads/",  # TODO régler le chemin d'envoi
        blank=False,
        null=True)
