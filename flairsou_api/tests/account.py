from django.test import TestCase
from django.db.utils import IntegrityError
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.exceptions import ErrorDetail
from django.urls import reverse

import datetime

from flairsou_api.models import Account, Book, Entity, Transaction, Operation


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

        # on vérifie qu'on ne peut pas créer de compte de dépenses sous le
        # compte accountSG
        with self.assertRaises(IntegrityError):
            Account.objects.create(name="Pizzas",
                                   parent=accountSG,
                                   accountType=Account.AccountType.EXPENSE)


class AccountAPITestCase(APITestCase):
    def setUp(self):
        self.BDE = Entity.objects.create(name="BDE-UTC", uuid=1)
        self.book = Book.objects.create(name="Comptes", entity=self.BDE)
        self.accountModif = Account.objects.create(
            name="Dépenses",
            accountType=Account.AccountType.EXPENSE,
            virtual=True,
            parent=None,
            book=self.book)

    def test_create_account(self):
        # on crée un nouveau compte
        url = reverse('flairsou_api:account-list')
        data = {
            "name": "Actifs",
            "accountType": Account.AccountType.ASSET,
            "virtual": True,
            "parent": None,
            "book": self.book.pk
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Account.objects.count(), 2)
        self.assertEqual(Account.objects.get(id=2).name, 'Actifs')

        # on veut créer un autre compte sous le compte actif
        # si on donne un parent et un book, l'API doit refuser
        acc = Account.objects.get(id=1)
        data = {
            "name": "SG",
            "accountType": Account.AccountType.ASSET,
            "virtual": True,
            "parent": acc.pk,
            "book": self.book.pk
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data, {
                'non_field_errors': [
                    ErrorDetail(string=(
                        'Un compte ne peut pas être rattaché à un parent et '
                        'à un livre en même temps'),
                                code='invalid')
                ]
            })
        self.assertEqual(Account.objects.count(), 2)

        # si on donne un parent et un type, l'API doit refuser
        data = {
            "name": "SG",
            "accountType": Account.AccountType.ASSET,
            "virtual": True,
            "parent": acc.pk,
            "book": None
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data, {
                'non_field_errors': [
                    ErrorDetail(
                        string=('Un compte rattaché à un parent doit avoir '
                                'un type null'),
                        code='invalid')
                ]
            })
        self.assertEqual(Account.objects.count(), 2)

        # si on fait une bonne saisie, l'API doit accepter et créer
        # le compte
        data = {
            "name": "SG",
            "accountType": None,
            "virtual": True,
            "parent": acc.pk,
            "book": None
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Account.objects.count(), 3)

    def test_update_account_name(self):
        url = reverse('flairsou_api:account-detail', kwargs={'pk': 1})

        data = {
            "name": "Dépenses chères",
            "accountType": Account.AccountType.EXPENSE,
            "virtual": True,
            "parent": None,
            "book": self.book.pk
        }

        # on teste la modification du nom du compte
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Account.objects.get(id=1).name, data['name'])

    def test_update_account_book(self):
        # on teste la modification du livre vers un autre livre :
        # l'API doit refuser
        url = reverse('flairsou_api:account-detail', kwargs={'pk': 1})
        book2 = Book.objects.create(name="Comptes 2", entity=self.BDE)

        data = {
            "name": "Dépenses",
            "accountType": Account.AccountType.EXPENSE,
            "virtual": True,
            "parent": None,
            "book": book2.pk
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_account_type(self):
        # on teste la modification du type : l'API doit refuser
        url = reverse('flairsou_api:account-detail', kwargs={'pk': 1})

        data = {
            "name": "Dépenses",
            "accountType": Account.AccountType.INCOME,
            "virtual": True,
            "parent": None,
            "book": self.book.pk
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # si on crée un autre compte de dépense virtuel, le changement de type
        # vers None doit fonctionner
        dep2 = Account.objects.create(name="Dépenses 2",
                                      accountType=Account.AccountType.EXPENSE,
                                      virtual=True,
                                      parent=None,
                                      book=self.book)
        data = {
            "name": "Dépenses",
            "accountType": None,
            "virtual": True,
            "parent": dep2.pk,
            "book": None
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_account_virtual(self):
        # on teste la modification du statut virtuel d'un compte
        url = reverse('flairsou_api:account-detail', kwargs={'pk': 1})

        # de base, si rien n'est attaché au compte, ça doit fonctionner
        data = {
            "name": "Dépenses",
            "accountType": Account.AccountType.EXPENSE,
            "virtual": False,
            "parent": None,
            "book": self.book.pk
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # le compte est maintenant non virtuel, on lui ajoute une transaction
        assets = Account.objects.create(name="Actifs",
                                        accountType=Account.AccountType.ASSET,
                                        book=self.book,
                                        parent=None,
                                        virtual=False)
        tr = Transaction.objects.create(date=datetime.date.today(),
                                        checked=False)
        Operation.objects.create(credit=200,
                                 debit=0,
                                 transaction=tr,
                                 account=self.accountModif,
                                 label="test")
        Operation.objects.create(credit=0,
                                 debit=200,
                                 transaction=tr,
                                 account=assets,
                                 label="test")

        # si on veut repasser le compte en virtuel, ça ne doit pas marcher
        data['virtual'] = True
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # on supprime la transaction, maintenant la modification doit
        # fonctionner
        tr.delete()
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # on ajoute un sous-compte au compte Dépenses, on ne doit pas pouvoir
        # repasser le compte de dépenses en non-virtuel
        Account.objects.create(name="Subventions",
                               accountType=None,
                               parent=self.accountModif,
                               book=None,
                               virtual=False)
        data['virtual'] = False
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_subaccount(self):
        # l'ajout d'un sous-compte à un compte non-virtuel doit être
        # refusé par l'API
        acc = Account.objects.create(name="Passifs",
                                     virtual=False,
                                     accountType=Account.AccountType.LIABILITY,
                                     book=self.book,
                                     parent=None)
        data = {
            "name": "Réserves",
            "accountType": None,
            "virtual": False,
            "parent": acc.pk,
            "book": None
        }
        url = reverse('flairsou_api:account-list')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
