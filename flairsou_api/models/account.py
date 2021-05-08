from django.db import models

from .timestamped import TimeStampedModel


class Account(TimeStampedModel):
    """
    Modèle de compte.

    Attributes
    ----------

    name : CharField
        Champ de texte qui enregistre le nom du compte.

    accountType : IntegerField
        Valeur entière correspondant au type de compte, comme défini dans la
        sous-classe AccountType.

    virtual : BooleanField
        Valeur booléenne indiquant si le compte est virtuel ou non. Un compte virtuel
        ne peut pas enregistrer de transactions. Un compte non-virtuel ne peut pas
        avoir de sous-comptes.

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
    accountType = models.IntegerField(choices=AccountType.choices,
                                      blank=False,
                                      null=True)
    virtual = models.BooleanField('virtual', default=False)
    parent = models.ForeignKey('self',
                               on_delete=models.CASCADE,
                               blank=False,
                               null=True)
    book = models.ForeignKey('Book',
                             on_delete=models.CASCADE,
                             blank=False,
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

        # un compte doit avoir un type seulement s'il n'a pas de parent
        constraints.append(
            models.CheckConstraint(
                name="%(app_label)s_%(class)s_type_if_book_only",
                check=(
                    # on a un parent => pas de type
                    models.Q(parent__isnull=False, accountType__isnull=True)
                    |  # pas de parent => on a un type
                    models.Q(parent__isnull=True, accountType__isnull=False))))

        constraints.append(
            models.CheckConstraint(
                check=~models.Q(name=''),
                name="%(app_label)s_%(class)s_name_not_null"))
