from django.db import models

from .entity import Entity
from .timestamped import TimeStampedModel


class Book(TimeStampedModel):
    """
    Modèle de livre de comptes.

    Attributes
    ----------

    name : CharField
        Champ de texte qui enregistre le nom du livre.

    entity : ForeignKey
        Clé étrangère vers l'entité qui possède le livre.

    Le couple (name, entity) est unique dans la table : une entité ne peut pas avoir
    plusieurs livres du même nom.
    """
    name = models.CharField("Book name",
                            max_length=64,
                            blank=False,
                            null=False)
    entity = models.ForeignKey(Entity,
                               on_delete=models.CASCADE,
                               blank=False,
                               null=False)

    class Meta:
        constraints = []
        # définition de la clé privée comme une contrainte d'unicité sur deux champs
        # (Django ne peut pas gérer des clés privées sur plusieurs colonnes)
        constraints.append(
            models.UniqueConstraint(
                fields=['name', 'entity'],
                name="%(app_label)s_%(class)s_unique_name_in_enity"))
