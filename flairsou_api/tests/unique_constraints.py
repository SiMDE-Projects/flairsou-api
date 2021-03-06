from django.test import TestCase
from django.db.utils import IntegrityError
from django.db import transaction
from flairsou_api.models import (
    Entity,
    Book,
    Account,
    Transaction,
    Operation,
    Reconciliation,
)
import datetime


# fonction de test pour les différentes contraintes de base de données
class UniqueConstraintsTestCase(TestCase):
    def setUp(self):
        self.bdeBook = Book.objects.create(name="Comptes", entity=1)
        self.assetAccount = Account.objects.create(
            name="Actifs", book=self.bdeBook, account_type=Account.AccountType.ASSET
        )

    def test_unique_constraints_entity(self):
        # teste la double création d'une entité BDE
        with self.assertRaises(IntegrityError):
            Entity.objects.create(name="BDE-UTC")

    def test_unique_constraints_book(self):
        # teste la double création d'un livre pour le BDE avec le même nom
        with self.assertRaises(IntegrityError):
            Book.objects.create(name="Comptes", entity=1)

    def test_constraints_operation(self):
        transactionObj = Transaction.objects.create(date=datetime.date(2021, 5, 1))

        # on crée une opération avec deux montants non nuls, ça ne doit pas
        # marcher
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Operation.objects.create(
                    credit=10,
                    debit=10,
                    account=self.assetAccount,
                    transaction=transactionObj,
                )

        # on crée une opération avec deux montants nuls, ça ne doit pas marcher
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Operation.objects.create(
                    credit=0,
                    debit=0,
                    account=self.assetAccount,
                    transaction=transactionObj,
                )

        # on crée deux opérations avec le même compte, ça ne doit pas marcher
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Operation.objects.create(
                    credit=10,
                    debit=0,
                    account=self.assetAccount,
                    transaction=transactionObj,
                )
                Operation.objects.create(
                    credit=0,
                    debit=10,
                    account=self.assetAccount,
                    transaction=transactionObj,
                )

    def test_constraints_reconciliation(self):
        # on tente de rapprocher deux fois le même compte à la même date
        Reconciliation.objects.create(
            account=self.assetAccount, date=datetime.date(2021, 4, 30), balance=42
        )

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Reconciliation.objects.create(
                    account=self.assetAccount,
                    date=datetime.date(2021, 4, 30),
                    balance=256,
                )
