from django.db import models

from flairsou import config
from .timestamped import TimeStampedModel


def attachment_storage_path(instance, filename) -> str:
    """
    Définit le dossier de stockage de la PJ. Le chemin final du fichier est défini comme suit :

    UPLOAD_PATH/{UUID asso}/{année}/{mois}/{jour}/{ID transaction}/{filename}

    Toute l'arborescence est prévue pour faciliter l'exploitation des fichiers en cas
    de récupération des données par l'utilisateur.
    """
    # récupération de l'entité à partir de la transaction associée au modèle
    entity = instance.transaction.get_entity()

    # récupération de la date de la transaction
    date_str = instance.transaction.date.isoformat().split("-")

    return r"{}/{}/{}/{}/{}/{}/{}".format(
        config.UPLOAD_PATH,
        entity,
        date_str[0],
        date_str[1],
        date_str[2],
        instance.transaction.pk,
        filename,
    )


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
        upload_to=attachment_storage_path,
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
