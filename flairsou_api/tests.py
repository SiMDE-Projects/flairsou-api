from django.test import TestCase
from django.db.utils import IntegrityError
from django.db import transaction
from flairsou_api.models import Entity, Book, Account


class EntityTestCase(TestCase):
    def setUp(self):
        BDE = Entity.objects.create(name="BDE-UTC")
        Entity.objects.create(name="PAE-UTC", parent=BDE)

    def test_parent(self):
        # Vérification de la bonne prise en compte du parent
        BDE = Entity.objects.get(name="BDE-UTC")
        PAE = Entity.objects.get(name="PAE-UTC")
        self.assertEqual(PAE.parent, BDE)


# fonction de test pour les différentes contraintes de base de données
class UniqueConstraintsTestCase(TestCase):
    def setUp(self):
        self.BDE = Entity.objects.create(name="BDE-UTC")
        self.bdeBook = Book.objects.create(name="Comptes", entity=self.BDE)
        self.assetAccount = Account.objects.create(
            name="Actifs",
            book=self.bdeBook,
            accountType=Account.AccountType.ASSET)

    def test_unique_constraints_entity(self):
        # teste la double création d'une entité BDE
        self.assertRaises(IntegrityError,
                          Entity.objects.create,
                          name="BDE-UTC")

    def test_unique_constraints_book(self):
        # teste la double création d'un livre pour le BDE avec le même nom
        self.assertRaises(IntegrityError,
                          Book.objects.create,
                          name="Comptes",
                          entity=self.BDE)

    def test_unique_constraints_account(self):
        # teste la création d'un compte avec un livre ET un parent
        with transaction.atomic():
            self.assertRaises(IntegrityError,
                              Account.objects.create,
                              name="SoGé",
                              accountType=Account.AccountType.ASSET,
                              parent=self.assetAccount,
                              book=self.bdeBook)

        with transaction.atomic():
            self.assertRaises(IntegrityError,
                              Account.objects.create,
                              name="Actifs",
                              accountType=Account.AccountType.ASSET,
                              book=self.bdeBook)
