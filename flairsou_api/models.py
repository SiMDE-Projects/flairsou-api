from django.db import models


class Entity(models.Model):
    """
    Modèle d'entité.

    Attributes
    ----------
    name : CharField
        Champ de texte qui enregistre le nom de l'entité. Clé primaire de la relation.

    use_equity : BooleanField
        Champ booléen qui indique si l'entité est autorisée à utiliser les comptes de capitaux
        propres directement ou non.

    parent : ForeignKey
        Clé étrangère vers une autre instance de Entity, qui représente l'entité parente
        de l'entité courante
    """
    name = models.CharField("Entity name", max_length=64, primary_key=True)
    use_equity = models.BooleanField("Use Equity Accounts", default=False)
    parent = models.ForeignKey('self',
                               on_delete=models.PROTECT,
                               blank=True,
                               null=True)


class Book(models.Model):
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
        # définition de la clé privée comme une contrainte d'unicité sur deux champs
        # (Django ne peut pas gérer des clés privées sur plusieurs colonnes)
        unique_together = (("name", "entity"), )
