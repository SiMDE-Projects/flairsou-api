from django.db import models

from .timestamped import TimeStampedModel


class Account(TimeStampedModel):
    """
    Modèle de compte.

    Attributes
    ----------

    name : CharField
        Champ de texte qui enregistre le nom du compte.

    account_type : IntegerField
        Valeur entière correspondant au type de compte, comme défini dans la
        sous-classe AccountType.

    virtual : BooleanField
        Valeur booléenne indiquant si le compte est virtuel ou non. Un compte
        virtuel ne peut pas enregistrer de transactions. Un compte non-virtuel
        ne peut pas avoir de sous-comptes.

    parent : ForeignKey
        Clé étrangère vers l'instance Account parente.

    book : ForeignKey
        Clé étrangère vers l'instance Book référente.

    Contraintes :
    * Deux comptes avec le même parent ne peuvent pas avoir le même nom
    * Deux comptes avec le même livre ne peuvent pas avoir le même nom
    * Un compte doit obligatoirement être rattaché à un livre. Si le compte a
    un père, il doit être rattaché au même livre que son père.
    * Un compte doit obligatoirement avoir un type. Si le compte a un père,
    il doit avoir le même type que son père.
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
    account_type = models.IntegerField(choices=AccountType.choices,
                                       blank=False,
                                       null=False)
    virtual = models.BooleanField('virtual', default=False)
    parent = models.ForeignKey('self',
                               on_delete=models.CASCADE,
                               blank=False,
                               null=True)
    book = models.ForeignKey('Book',
                             on_delete=models.CASCADE,
                             blank=False,
                             null=False)

    def __str__(self) -> str:
        if self.parent_id is not None:
            return "{}-{}".format(self.parent, self.name)
        return "{}-{}".format(self.book, self.name)

    class Meta:
        constraints = []

        # (name, parent) : pas deux comptes du même nom sous le même parent
        constraints.append(
            models.UniqueConstraint(
                fields=['name', 'parent', 'book'],
                name="%(app_label)s_%(class)s_unique_name_in_parent_and_book"))

        constraints.append(
            models.CheckConstraint(
                check=~models.Q(name=''),
                name="%(app_label)s_%(class)s_name_not_null"))

    @property
    def balance(self) -> float:
        """
        Calcule le solde du compte
        """

        if self.virtual:
            balance = 0
            for acc in self.account_set.all():
                balance += acc.balance
        else:
            # comptabilise les crédits et les débits associés au compte
            # (en centimes)
            credits: int = 0
            debits: int = 0
            for op in self.operation_set.all():
                credits += op.credit
                debits += op.debit

            # calcule le balance selon le type de compte
            if self.account_type == Account.AccountType.ASSET \
                    or self.account_type == Account.AccountType.EXPENSE:
                balance = debits - credits
            else:
                balance = credits - debits

            # passage en euros
            balance = balance / 100

        return balance
