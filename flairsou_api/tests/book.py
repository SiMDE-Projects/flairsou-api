from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.db.utils import IntegrityError

from flairsou_api.models import Book, Account
import uuid


class BookAPITestCase(APITestCase):

    def setUp(self):
        self.book = Book.objects.create(name="Comptes BDE",
                                        entity=uuid.UUID(int=1))

    def test_create_book(self):
        """
        Vérifie que la création de livre fonctionne via python, l'API
        de création de compte est désactivée
        """
        # première création doit fonctionner
        Book.objects.create(name="BDE-UTC", entity=uuid.UUID(int=2))

        # le deuxième test ne doit pas fonctionner car on crée deux livres pour
        # la même entité
        with self.assertRaises(IntegrityError):
            Book.objects.create(name="BDE-UTC-2", entity=uuid.UUID(int=2))

    def test_filter_book_by_pk(self):
        """
        Vérifie que le filtrage des livres par clé primaire fonctionne
        """
        url = reverse('flairsou_api:book-detail', kwargs={'pk': self.book.pk})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        url = reverse('flairsou_api:book-detail', kwargs={'pk': 12})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_filter_book_by_entity(self):
        """
        Vérifie que le filtrage des livres par entité fonctionne
        """
        url = reverse('flairsou_api:book-filter-by-entity',
                      kwargs={'entity': self.book.entity})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_change_book_entity(self):
        """
        Vérifie que le changement d'entité associée à un livre est refusée
        """
        url = reverse('flairsou_api:book-detail', kwargs={'pk': self.book.pk})
        response = self.client.get(url, format='json')
        data = response.data
        data['entity'] = str(uuid.UUID(int=2))
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class BookAccountsAPITestCase(APITestCase):
    """
    Classe de test pour le filtrage des comptes par book
    """

    def setUp(self):
        book1 = Book.objects.create(name="Comptes", entity=uuid.UUID(int=1))
        Account.objects.create(name="Actifs",
                               account_type=Account.AccountType.ASSET,
                               virtual=True,
                               parent=None,
                               book=book1)
        Account.objects.create(name="Passifs",
                               account_type=Account.AccountType.LIABILITY,
                               virtual=True,
                               parent=None,
                               book=book1)
        Account.objects.create(name="Dépenses",
                               account_type=Account.AccountType.EXPENSE,
                               virtual=True,
                               parent=None,
                               book=book1)

    def test_filter_by_book(self):
        # on récupère les comptes liés au book 1 (seulement les comptes de
        # niveau 1)
        url = reverse('flairsou_api:book-get-all-accounts', kwargs={'pk': 1})
        response = self.client.get(url, format='json')
        self.assertEqual(len(response.data['account_set']), 3)
