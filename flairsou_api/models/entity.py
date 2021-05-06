from django.db import models

from .timestamped import TimeStampedModel


class Entity(TimeStampedModel):
    """
    Modèle d'entité.

    Attributes
    ----------
    uuid : PositiveIntegerField
        Champ entier servant à lier l'entité avec une autre base de données (LDAP par exemple).
        Clé primaire de la relation.

    name : CharField
        Champ de texte qui enregistre le nom de l'entité. Unique dans la table

    use_equity : BooleanField
        Champ booléen qui indique si l'entité est autorisée à utiliser les comptes de capitaux
        propres directement ou non.

    parent : ForeignKey
        Clé étrangère vers une autre instance de Entity, qui représente l'entité parente
        de l'entité courante
    """
    uuid = models.UUIDField("uuid", primary_key=True, editable=False)
    name = models.CharField("Entity name", max_length=64)
    use_equity = models.BooleanField("Use Equity Accounts", default=False)
    parent = models.ForeignKey('self',
                               on_delete=models.PROTECT,
                               blank=False,
                               null=True)

    class Meta:
        constraints = []

        # le nom de l'entité est unique dans la base
        constraints.append(
            models.UniqueConstraint(
                fields=['name'], name="%(app_label)s_%(class)s_unique_name"))
