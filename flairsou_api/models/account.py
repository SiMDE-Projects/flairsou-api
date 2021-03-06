from django.db import models
from datetime import datetime

from .timestamped import TimeStampedModel
from .reconciliation import Reconciliation

import uuid

from flairsou_api.utils import UserAllowed


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

    associated_entity: UUIDField (optionnel)
        ID de l'entité associée à ce compte, qui obtient un accès en lecture
        sur le compte et ses sous-comptes

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

    name = models.CharField("Account name", max_length=64, blank=False, null=False)
    account_type = models.IntegerField(
        choices=AccountType.choices, blank=False, null=False
    )
    virtual = models.BooleanField("virtual", default=False)
    parent = models.ForeignKey("self", on_delete=models.CASCADE, blank=False, null=True)
    book = models.ForeignKey("Book", on_delete=models.CASCADE, blank=False, null=False)
    associated_entity = models.UUIDField(
        "associated_entity", blank=False, null=True, default=None
    )

    def __str__(self) -> str:
        return "{}-{}".format(self.book, self.fullName)

    class Meta:
        constraints = []

        constraints.append(
            models.CheckConstraint(
                check=~models.Q(name=""), name="%(app_label)s_%(class)s_name_not_null"
            )
        )

    @property
    def fullName(self) -> str:
        """
        Retourne le nom complet du compte (héritage de tous les comptes
        parents)
        """
        if self.parent is not None:
            return self.parent.fullName + ":" + self.name
        else:
            return self.name

    @property
    def balance(self) -> int:
        """
        Calcule le solde du compte
        """
        return self.balance_at_date(None)

    def balance_at_date(self, date: datetime.date) -> int:
        """
        Calcule le solde du compte à une date donnée
        Ce solde est déterminé en calculant la somme de toutes les opérations
        de l'ouverture du compte à la date fixée
        """
        if self.virtual:
            balance = 0
            for acc in self.account_set.all():
                balance += acc.balance_at_date(date)
        else:
            if date is None:
                # s'il n'y a pas de date, on prend toutes les transactions
                ops = self.operation_set.all()
            else:
                ops = self.operation_set.filter(transaction__date__lte=date)

            # comptabilise les crédits et les débits associés au compte
            # (en centimes)
            credits: int = 0
            debits: int = 0
            for op in ops:
                credits += op.credit
                debits += op.debit

            # calcule le solde selon le type de compte
            if (
                self.account_type == Account.AccountType.ASSET
                or self.account_type == Account.AccountType.EXPENSE
            ):
                balance = debits - credits
            else:
                balance = credits - debits

        return balance

    def get_associated_entity(self) -> uuid.UUID:
        """
        Renvoie l'entité associée au compte courant si elle existe,
        None sinon
        """
        if self.associated_entity is not None:
            return self.associated_entity
        elif self.parent:
            return self.parent.get_associated_entity()
        else:
            return None

    @property
    def last_reconciliation(self) -> Reconciliation:
        """
        Renvoie le dernier rapprochement du compte
        """
        if self.reconciliation_set.count() > 0:
            return self.reconciliation_set.order_by("-date")[0]
        else:
            return None

    def check_user_allowed(self, request) -> bool:
        """
        Vérifie si l'utilisateur passé dans la requête est autorisé à accéder
        à l'objet
        """

        if UserAllowed.check_entity_allowed(str(self.book.entity), request):
            # l'utilisateur a le droit d'accès direct au compte
            return True

        if self.associated_entity is not None and UserAllowed.check_entity_allowed(
            str(self.associated_entity), request
        ):
            # l'utilisateur est d'une entité associée au compte, il a donc accès
            return True

        return False
