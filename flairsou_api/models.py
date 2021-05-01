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


class Account(models.Model):
    """
    Modèle de compte
    """
    class AccountType(models.IntegerChoices):
        ASSET = 0  # Actifs
        LIABILITY = 1  # Passifs
        INCOME = 2  # Revenus
        EXPENSE = 3  # Dépenses
        EQUITY = 4  # Capitaux Propres

    name = models.CharField("Account name",
                            max_length=64,
                            blank=False,
                            null=False)
    accountType = models.IntegerField(choices=AccountType.choices)
    parent = models.ForeignKey('self',
                               on_delete=models.CASCADE,
                               blank=True,
                               null=True)
    book = models.ForeignKey(Book,
                             on_delete=models.CASCADE,
                             blank=True,
                             null=True)

    class Meta:
        # la contrainte d'unicité (name, parent, book) est séparée en deux contraintes
        # car SQL considère que NULL != NULL, on a donc deux contraintes :
        # 1 - (name, parent) : pas deux comptes du même nom sous le même parent
        # 2 - (name, book) : pas deux comptes du même nom dans le même livre
        unique_together = (
            ('name', 'parent'),
            ('name', 'book'),
        )

        # contrainte pour vérifier qu'un seul des deux champs 'parent' ou 'book' est rempli
        constraints = [
            models.CheckConstraint(
                name="%(app_label)s_%(class)s_book_or_parent",
                check=(models.Q(parent__isnull=False, book__isnull=True)
                       | models.Q(parent__isnull=True, book__isnull=False))),
        ]
