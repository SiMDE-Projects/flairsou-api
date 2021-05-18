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

    Le couple (name, entity) est unique dans la table : une entité ne peut pas
    avoir plusieurs livres du même nom.
    """
    name = models.CharField("Book name",
                            max_length=64,
                            blank=False,
                            null=False)
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
                fields=['name', 'entity'],
                name="%(app_label)s_%(class)s_unique_name_in_entity"))
