from django.test import TestCase

from flairsou_api.models import Entity


class EntityTestCase(TestCase):
    def setUp(self):
        BDE = Entity.objects.create(name="BDE-UTC", uuid=1)
        Entity.objects.create(name="PAE-UTC", parent=BDE, uuid=2)

    def test_parent(self):
        # Vérification de la bonne prise en compte du parent
        BDE = Entity.objects.get(name="BDE-UTC")
        PAE = Entity.objects.get(name="PAE-UTC")
        self.assertEqual(PAE.parent, BDE)
