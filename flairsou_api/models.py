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
        constraints = []
        # définition de la clé privée comme une contrainte d'unicité sur deux champs
        # (Django ne peut pas gérer des clés privées sur plusieurs colonnes)
        constraints.append(
            models.UniqueConstraint(
                fields=['name', 'entity'],
                name="%(app_label)s_%(class)s_unique_name_in_enity"))


class Account(models.Model):
    """
    Modèle de compte.

    Attributes
    ----------

    name : CharField
        Champ de texte qui enregistre le nom du compte.

    accountType : IntegerField
        Valeur entière correspondant au type de compte, comme défini dans la
        sous-classe AccountType.

    parent : ForeignKey
        Clé étrangère vers l'instance Account parente.

    book : ForeignKey
        Clé étrangère vers l'instance Book référente.

    Contraintes :
    * Un compte doit avoir un parent ou un livre, mais pas les deux.
    * Deux comptes avec le même parent ne peuvent pas avoir le même nom
    * Deux comptes avec le même livre ne peuvent pas avoir le même nom
    * Si un compte a un parent, son type doit être le même que celui du parent
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
        constraints = []

        # (name, parent) : pas deux comptes du même nom sous le même parent
        constraints.append(
            models.UniqueConstraint(
                fields=['name', 'parent'],
                name="%(app_label)s_%(class)s_unique_name_in_parent"))

        # (name, book) : pas deux comptes du même nom dans le même livre
        constraints.append(
            models.UniqueConstraint(
                fields=['name', 'book'],
                name="%(app_label)s_%(class)s_unique_name_in_book"))

        # contrainte pour vérifier qu'un seul des deux champs 'parent' ou 'book' est rempli
        constraints.append(
            models.CheckConstraint(
                name="%(app_label)s_%(class)s_book_or_parent",
                check=(models.Q(parent__isnull=False, book__isnull=True)
                       | models.Q(parent__isnull=True, book__isnull=False))))
