from django.db import models

from .timestamped import TimeStampedModel


class Book(TimeStampedModel):
    """
    Modèle de livre de comptes.

    Attributes
    ----------

    name : CharField
        Champ de texte qui enregistre le nom du livre.

    entity : UUID
        Dans la configuration BDE-UTC, entity correspond à l'UUID de
        l'entité qui possède le livre

    use_equity : BooleanField
        Champ booléen qui indique si le livre est autorisé à utiliser les
        comptes de capitaux propres directement ou non (pour la configuration
        BDE-UTC).

    L'entité est unique dans la base, une entité ne possède qu'un seul livre
    de comptes.
    """

    name = models.CharField("Book name", max_length=64, blank=False, null=False)
    entity = models.UUIDField("Entity", blank=False, null=False)
    use_equity = models.BooleanField("Use Equity Accounts", default=False)

    def __str__(self):
        return "{}-{}".format(self.entity, self.name)

    class Meta:
        constraints = []
        # définition de la clé privée comme une contrainte d'unicité sur deux
        # champs (Django ne peut pas gérer des clés privées sur plusieurs
        # colonnes)
        constraints.append(
            models.UniqueConstraint(
                fields=["entity"], name="%(app_label)s_%(class)s_one_book_per_entity"
            )
        )

    def check_user_allowed(self, request) -> bool:
        """
        Vérifie si l'utilisateur passé dans la requête est autorisé à accéder
        à l'objet
        """
        if (
            "assos" not in request.session
            or str(self.entity) not in request.session["assos"]
        ):
            return False

        return True
