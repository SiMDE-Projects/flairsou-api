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
