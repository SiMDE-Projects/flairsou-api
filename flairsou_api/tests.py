from django.test import TestCase
from django.db.utils import IntegrityError
from django.db import transaction
from flairsou_api.models import Entity, Book, Account, Transaction, Operation, Reconciliation
import datetime


class EntityTestCase(TestCase):
    def setUp(self):
        BDE = Entity.objects.create(name="BDE-UTC", uuid=1)
        Entity.objects.create(name="PAE-UTC", parent=BDE, uuid=2)

    def test_parent(self):
        # Vérification de la bonne prise en compte du parent
        BDE = Entity.objects.get(name="BDE-UTC")
        PAE = Entity.objects.get(name="PAE-UTC")
        self.assertEqual(PAE.parent, BDE)


class AccountTestCase(TestCase):
    def setUp(self):
        BDE = Entity.objects.create(name="BDE-UTC", uuid=1)
        bookBDE = Book.objects.create(name="Comptes", entity=BDE)
        self.assets = Account.objects.create(
            name="Actifs", accountType=Account.AccountType.ASSET, book=bookBDE)

    def test_type_constraint(self):
        # on crée un sous-compte au compte actif
        # ceci doit fonctionner
        accountSG = Account.objects.create(name="SG", parent=self.assets)

        # on vérifie qu'on ne peut pas créer de compte de dépenses sous le compte accountSG
        with self.assertRaises(IntegrityError):
            Account.objects.create(name="Pizzas",
                                   parent=accountSG,
                                   accountType=Account.AccountType.EXPENSE)


# fonction de test pour les différentes contraintes de base de données
class UniqueConstraintsTestCase(TestCase):
    def setUp(self):
        self.BDE = Entity.objects.create(name="BDE-UTC", uuid=1)
        self.bdeBook = Book.objects.create(name="Comptes", entity=self.BDE)
        self.assetAccount = Account.objects.create(
            name="Actifs",
            book=self.bdeBook,
            accountType=Account.AccountType.ASSET)

    def test_unique_constraints_entity(self):
        # teste la double création d'une entité BDE
        with self.assertRaises(IntegrityError):
            Entity.objects.create(name="BDE-UTC")

    def test_unique_constraints_book(self):
        # teste la double création d'un livre pour le BDE avec le même nom
        with self.assertRaises(IntegrityError):
            Book.objects.create(name="Comptes", entity=self.BDE)

    def test_unique_constraints_account(self):
        # teste la création d'un compte avec un livre ET un parent
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Account.objects.create(name="SoGé",
                                       accountType=Account.AccountType.ASSET,
                                       parent=self.assetAccount,
                                       book=self.bdeBook)

        # teste la double création d'un compte dans un livre
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Account.objects.create(name="Actifs",
                                       accountType=Account.AccountType.ASSET,
                                       book=self.bdeBook)

    def test_constraints_operation(self):
        transactionObj = Transaction.objects.create(
            date=datetime.date(2021, 5, 1))

        # on crée une opération avec deux montants non nuls, ça ne doit pas marcher
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Operation.objects.create(credit=10,
                                         debit=10,
                                         account=self.assetAccount,
                                         transaction=transactionObj)

        # on crée une opération avec deux montants nuls, ça ne doit pas marcher
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Operation.objects.create(credit=0,
                                         debit=0,
                                         account=self.assetAccount,
                                         transaction=transactionObj)

        # on crée deux opérations avec le même compte, ça ne doit pas marcher
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Operation.objects.create(credit=10,
                                         debit=0,
                                         account=self.assetAccount,
                                         transaction=transactionObj)
                Operation.objects.create(credit=0,
                                         debit=10,
                                         account=self.assetAccount,
                                         transaction=transactionObj)

    def test_constraints_reconciliation(self):
        # on tente de rapprocher deux fois le même compte à la même date
        Reconciliation.objects.create(account=self.assetAccount,
                                      date=datetime.date(2021, 4, 30),
                                      solde=42)

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Reconciliation.objects.create(account=self.assetAccount,
                                              date=datetime.date(2021, 4, 30),
                                              solde=256)
