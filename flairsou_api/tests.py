from django.test import TestCase
from django.db.utils import IntegrityError
from flairsou_api.models import Entity, Book


class EntityTestCase(TestCase):
    def setUp(self):
        BDE = Entity.objects.create(name="BDE-UTC")
        Entity.objects.create(name="PAE-UTC", parent=BDE)

    def test_parent(self):
        # Vérification de la bonne prise en compte du parent
        BDE = Entity.objects.get(name="BDE-UTC")
        PAE = Entity.objects.get(name="PAE-UTC")
        self.assertEqual(PAE.parent, BDE)

    def test_unique_constraint(self):
        # Vérification de la contrainte d'unicité
        self.assertRaises(IntegrityError,
                          Entity.objects.create,
                          name="BDE-UTC")


class BookTestCase(TestCase):
    def setUp(self):
        self.BDE = Entity.objects.create(name="BDE-UTC")
        Book.objects.create(name="Comptes", entity=self.BDE)

    def test_unique_constraint(self):
        # Vérification de la contrainte d'unicité
        self.assertRaises(IntegrityError,
                          Book.objects.create,
                          name="Comptes",
                          entity=self.BDE)
