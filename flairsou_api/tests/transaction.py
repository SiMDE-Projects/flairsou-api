from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

import datetime
import uuid

from flairsou_api.models import Book, Account
from flairsou_api.serializers import OperationSerializer


class TransactionAPITestCase(APITestCase):

    def setUp(self):
        self.book = Book.objects.create(name="Comptes",
                                        entity=uuid.UUID(int=1))

        self.assets = Account.objects.create(
            name="Actifs",
            account_type=Account.AccountType.ASSET,
            virtual=True,
            parent=None,
            book=self.book)
        self.bank = Account.objects.create(
            name="Bank",
            account_type=Account.AccountType.ASSET,
            virtual=False,
            parent=self.assets,
            book=self.book)
        self.liabilities = Account.objects.create(
            name="Passifs",
            account_type=Account.AccountType.LIABILITY,
            virtual=False,
            parent=None,
            book=self.book)
        self.expenses = Account.objects.create(
            name="Dépenses",
            account_type=Account.AccountType.EXPENSE,
            virtual=False,
            parent=None,
            book=self.book)

    def test_create_transaction(self):
        url = reverse('flairsou_api:transaction-create')

        # création d'une transaction entre deux comptes non virtuels
        op1 = {
            'credit': 100,
            'debit': 0,
            'label': 'Expense 1',
            'account': self.expenses.pk
        }

        op2 = {
            'credit': 0,
            'debit': 100,
            'label': 'Expense 1',
            'account': self.bank.pk
        }

        data = {
            'date': datetime.date.today(),
            'checked': False,
            'invoice': None,
            'operations': [op1, op2],
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # création d'une transaction avec un compte virtuel
        op2['account'] = self.assets.pk
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['operations'][1]['account'][0],
                         OperationSerializer.error_messages['account_virtual'])

        # création d'une transaction avec un débit et un crédit nul
        op1['credit'] = 0
        op2['account'] = self.bank.pk
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['operations'][0]['non_field_errors'][0],
            OperationSerializer.error_messages['two_amounts_zero'])

    def test_transation_balanced(self):
        # tentative de création d'une transaction non équilibrée
        url = reverse('flairsou_api:transaction-create')

        op1 = {
            'credit': 200,
            'debit': 0,
            'label': 'Expense 1',
            'account': self.expenses.pk
        }

        op2 = {
            'credit': 0,
            'debit': 100,
            'label': 'Expense 1',
            'account': self.bank.pk
        }

        data = {
            'date': datetime.date.today(),
            'checked': False,
            'invoice': None,
            'operations': [op1, op2],
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_transaction_correct_values(self):
        # vérification de la correction des valeurs de la transaction
        url = reverse('flairsou_api:transaction-create')

        # création d'une transaction entre deux comptes non virtuels
        op1 = {
            'credit': 200,
            'debit': 50,
            'label': 'Expense 1',
            'account': self.expenses.pk
        }

        op2 = {
            'credit': -200,
            'debit': -50,
            'label': 'Expense 1',
            'account': self.bank.pk
        }

        data = {
            'date': datetime.date.today(),
            'checked': False,
            'invoice': None,
            'operations': [op1, op2],
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['operations'][0]['credit'], 150)
        self.assertEqual(response.data['operations'][0]['debit'], 0)
        self.assertEqual(response.data['operations'][1]['credit'], 0)
        self.assertEqual(response.data['operations'][1]['debit'], 150)

    def test_transaction_same_account(self):
        url = reverse('flairsou_api:transaction-create')

        # création d'une transaction entre deux comptes non virtuels
        op1 = {
            'credit': 100,
            'debit': 0,
            'label': 'Expense 1',
            'account': self.expenses.pk
        }

        op2 = {
            'credit': 0,
            'debit': 50,
            'label': 'Expense 1',
            'account': self.bank.pk
        }

        op3 = {
            'credit': 0,
            'debit': 50,
            'label': 'Expense 1',
            'account': self.bank.pk
        }

        data = {
            'date': datetime.date.today(),
            'checked': False,
            'invoice': None,
            'operations': [op1, op2, op3],
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_transaction_same_book(self):
        url = reverse('flairsou_api:transaction-create')

        # création d'une transaction entre deux comptes de deux livres
        # différents
        book2 = Book.objects.create(name="Comptes 2", entity=uuid.UUID(int=2))
        account2 = Account.objects.create(
            name="Actifs",
            account_type=Account.AccountType.ASSET,
            virtual=False,
            parent=None,
            book=book2,
        )

        op1 = {
            'credit': 100,
            'debit': 0,
            'label': 'Expense 1',
            'account': self.expenses.pk
        }

        op2 = {
            'credit': 0,
            'debit': 100,
            'label': 'Expense 1',
            'account': account2.pk
        }

        data = {
            'date': datetime.date.today(),
            'checked': False,
            'invoice': None,
            'operations': [op1, op2],
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
