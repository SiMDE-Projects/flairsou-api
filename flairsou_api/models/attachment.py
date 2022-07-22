from django.db import models

from flairsou import config
from .timestamped import TimeStampedModel


class Attachment(TimeStampedModel):
    """
    Modèle de pièce-jointe justificative attachée à une transaction.

    Attributes
    ----------

    document: FileField
        Fichier joint à la transaction

    notes: TextField
        Notes que l'utilisateur peut ajouter à la pièce-jointe pour
        conserver des informations

    transaction: ForeignKey
        Clé étrangère vers la transaction associée à la pièce-jointe. Une PJ est
        associée à une seule transaction, mais une transaction peut avoir plusieurs
        justificatifs.
    """

    document = models.FileField(
        "Document",
        upload_to=config.UPLOAD_PATH,
        blank=False,
        null=True,
    )
    notes = models.TextField("Notes", blank=False, null=True)
    transaction = models.ForeignKey("Transaction", on_delete=models.CASCADE)

    def __str__(self):
        return "Attachment of transaction {}".format(self.transaction)

    def check_user_allowed(self, request) -> bool:
        """
        Vérifie si l'utilisateur a le droit d'accéder à la pièce-jointe
        """

        # l'utilisateur peut accéder à la PJ si il peut acéder à la transaction
        return self.transaction.check_user_allowed(request)
