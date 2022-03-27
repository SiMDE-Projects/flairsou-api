from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

import datetime
import uuid
from flairsou_api.models import Account, Book, Transaction, Operation
from flairsou_api.views import AccountDetail


class AccountBalanceTestCase(APITestCase):
    def setUp(self):
        # on autorise le client sur l'entité créée
        session = self.client.session
        session["assos"] = [str(uuid.UUID(int=1))]
        session.save()

        self.book = Book.objects.create(name="Comptes", entity=uuid.UUID(int=1))
        self.assets = Account.objects.create(
            name="Actifs",
            account_type=Account.AccountType.ASSET,
            virtual=False,
            parent=None,
            book=self.book,
        )
        self.expenses = Account.objects.create(
            name="Dépenses",
            account_type=Account.AccountType.EXPENSE,
            virtual=False,
            parent=None,
            book=self.book,
        )
        self.income = Account.objects.create(
            name="Recettes",
            account_type=Account.AccountType.INCOME,
            virtual=False,
            parent=None,
            book=self.book,
        )

    def test_calcul_solde(self):
        tr = Transaction.objects.create(date=datetime.date(2020, 3, 20), checked=False)
        Operation.objects.create(
            debit=10000,
            credit=0,
            label="Recette 1",
            account=self.assets,
            transaction=tr,
        )
        Operation.objects.create(
            debit=0,
            credit=10000,
            label="Recette 1",
            account=self.income,
            transaction=tr,
        )

        tr2 = Transaction.objects.create(date=datetime.date(2020, 4, 5), checked=False)
        Operation.objects.create(
            debit=0,
            credit=5000,
            label="Dépense 1",
            account=self.assets,
            transaction=tr2,
        )
        Operation.objects.create(
            debit=5000,
            credit=0,
            label="Dépense 1",
            account=self.expenses,
            transaction=tr2,
        )

        # vérification de la fonction de calcul du solde
        self.assertEqual(self.assets.balance, 5000)
        self.assertEqual(self.assets.balance_at_date(datetime.date(2020, 3, 25)), 10000)
        self.assertEqual(self.assets.balance_at_date(datetime.date(2020, 4, 25)), 5000)
        self.assertEqual(self.income.balance, 10000)
        self.assertEqual(self.expenses.balance, 5000)

        # vérification de la réponse de l'API
        url = reverse("flairsou_api:account-balance", kwargs={"pk": 1})
        response = self.client.get(url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["balance"], 5000)

    def test_calcul_solde_virtual_account(self):
        """
        Vérification du bon calcul du solde pour les comptes virtuels
        """
        meta_expenses = Account.objects.create(
            name="Meta Dépenses",
            account_type=Account.AccountType.EXPENSE,
            virtual=True,
            parent=None,
            book=self.book,
        )
        sub_expenses_1 = Account.objects.create(
            name="Dépenses 1",
            account_type=Account.AccountType.EXPENSE,
            virtual=False,
            parent=meta_expenses,
            book=self.book,
        )
        sub_expenses_2 = Account.objects.create(
            name="Dépenses 2",
            account_type=Account.AccountType.EXPENSE,
            virtual=False,
            parent=meta_expenses,
            book=self.book,
        )

        # création de transactions à des dates différentes
        tr = Transaction.objects.create(date=datetime.date(2020, 3, 20), checked=False)
        Operation.objects.create(
            debit=0,
            credit=10000,
            label="Dépense 1",
            account=self.assets,
            transaction=tr,
        )
        Operation.objects.create(
            debit=10000,
            credit=0,
            label="Dépense 1",
            account=sub_expenses_1,
            transaction=tr,
        )

        tr2 = Transaction.objects.create(date=datetime.date(2020, 4, 5), checked=False)
        Operation.objects.create(
            debit=0,
            credit=5000,
            label="Dépense 2",
            account=self.assets,
            transaction=tr2,
        )
        Operation.objects.create(
            debit=5000,
            credit=0,
            label="Dépense 2",
            account=sub_expenses_2,
            transaction=tr2,
        )

        # solde total
        self.assertEqual(meta_expenses.balance, 15000)
        # solde partiel
        self.assertEqual(
            meta_expenses.balance_at_date(datetime.date(2020, 3, 25)), 10000
        )
        # solde total avec une date
        self.assertEqual(
            meta_expenses.balance_at_date(datetime.date(2020, 4, 25)), 15000
        )


class AccountAPITestCase(APITestCase):
    def setUp(self):
        # on autorise le client sur l'entité créée
        session = self.client.session
        session["assos"] = [str(uuid.UUID(int=1))]
        session.save()

        self.book = Book.objects.create(name="Comptes", entity=uuid.UUID(int=1))
        self.assets = Account.objects.create(
            name="Actifs",
            account_type=Account.AccountType.ASSET,
            virtual=True,
            parent=None,
            book=self.book,
        )
        self.liabilities = Account.objects.create(
            name="Passifs",
            account_type=Account.AccountType.LIABILITY,
            virtual=True,
            parent=None,
            book=self.book,
        )
        self.expenses = Account.objects.create(
            name="Dépenses",
            account_type=Account.AccountType.EXPENSE,
            virtual=True,
            parent=None,
            book=self.book,
        )

    def test_create_account_no_book(self):
        nbAccounts = Account.objects.count()

        # on crée un compte sans book : l'API refuse
        url = reverse("flairsou_api:account-create")
        data = {
            "name": "SG",
            "account_type": Account.AccountType.ASSET,
            "virtual": True,
            "parent": None,
            "book": None,
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Account.objects.count(), nbAccounts)

    def test_create_account_bad_type(self):
        nbAccounts = Account.objects.count()

        # on crée un sous-compte avec le mauvais type : l'API refuse
        url = reverse("flairsou_api:account-create")
        data = {
            "name": "SG",
            "account_type": Account.AccountType.ASSET,  # sous-compte ASSET
            "virtual": True,
            "parent": self.expenses.pk,  # parent EXPENSE
            "book": self.book.pk,
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Account.objects.count(), nbAccounts)

    def test_create_account(self):
        nbAccounts = Account.objects.count()

        # on crée un nouveau compte rattaché au book principal
        url = reverse("flairsou_api:account-create")
        data = {
            "name": "Recettes",
            "account_type": Account.AccountType.INCOME,
            "virtual": True,
            "parent": None,
            "book": self.book.pk,
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Account.objects.count(), nbAccounts + 1)

        acc = Account.objects.get(id=nbAccounts + 1)
        self.assertEqual(acc.name, data["name"])

        # on veut créer un autre compte sous le compte actif
        # on donne un parent et un book, l'API accepte
        data = {
            "name": "SG",
            "account_type": Account.AccountType.ASSET,
            "virtual": True,
            "parent": self.assets.pk,
            "book": self.book.pk,
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Account.objects.count(), nbAccounts + 2)

    def test_update_account_name(self):
        pk = self.expenses.pk
        url = reverse("flairsou_api:account-detail", kwargs={"pk": pk})

        data = {
            "name": "Dépenses chères",
            "account_type": Account.AccountType.EXPENSE,
            "virtual": True,
            "parent": None,
            "book": self.book.pk,
        }

        # on teste la modification du nom du compte
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Account.objects.get(pk=pk).name, data["name"])

    def test_update_account_book(self):
        # on teste la modification du livre vers un autre livre :
        # l'API doit refuser
        url = reverse("flairsou_api:account-detail", kwargs={"pk": 1})
        book2 = Book.objects.create(name="Comptes 2", entity=uuid.UUID(int=2))

        data = {
            "name": "Dépenses",
            "account_type": Account.AccountType.EXPENSE,
            "virtual": True,
            "parent": None,
            "book": book2.pk,
        }
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_account_type(self):
        # on teste la modification du type : l'API doit refuser
        url = reverse("flairsou_api:account-detail", kwargs={"pk": self.assets.pk})

        data = {
            "name": "Dépenses",
            "account_type": Account.AccountType.INCOME,
            "virtual": True,
            "parent": None,
            "book": self.book.pk,
        }
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_parent(self):
        # on teste le changement de parent
        # on crée un nouveau sous-compte
        url = reverse("flairsou_api:account-create")
        data = {
            "name": "Pizzas",
            "account_type": Account.AccountType.EXPENSE,
            "virtual": False,
            "parent": self.expenses.pk,
            "book": self.book.pk,
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # on change le compte parent vers un compte qui n'est pas du même type
        # l'API doit refuser
        data = {
            "name": "Pizzas",
            "account_type": Account.AccountType.EXPENSE,
            "virtual": False,
            "parent": self.assets.pk,
            "book": self.book.pk,
        }
        pizz = Account.objects.filter(name=data["name"])[0]
        url = reverse("flairsou_api:account-detail", kwargs={"pk": pizz.pk})
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # si on rattache le compte directement au livre, l'API accepte
        data = {
            "name": "Pizzas",
            "account_type": Account.AccountType.EXPENSE,
            "virtual": False,
            "parent": None,
            "book": self.book.pk,
        }
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_account_virtual(self):
        # on teste la modification du statut virtuel d'un compte
        url = reverse("flairsou_api:account-detail", kwargs={"pk": self.expenses.pk})

        # de base, si rien n'est attaché au compte, ça doit fonctionner
        data = {
            "name": "Dépenses",
            "account_type": Account.AccountType.EXPENSE,
            "virtual": False,
            "parent": None,
            "book": self.book.pk,
        }
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # le compte est maintenant non virtuel, on lui ajoute une transaction
        tr = Transaction.objects.create(date=datetime.date.today(), checked=False)
        Operation.objects.create(
            credit=200, debit=0, transaction=tr, account=self.expenses, label="test"
        )
        Operation.objects.create(
            credit=0, debit=200, transaction=tr, account=self.assets, label="test"
        )

        # si on veut repasser le compte en virtuel, ça ne doit pas marcher
        data["virtual"] = True
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # on supprime la transaction, maintenant la modification doit
        # fonctionner
        tr.delete()
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # on ajoute un sous-compte au compte Dépenses, on ne doit pas pouvoir
        # repasser le compte de dépenses en non-virtuel
        Account.objects.create(
            name="Subventions",
            account_type=Account.AccountType.EXPENSE,
            parent=self.expenses,
            book=self.book,
            virtual=False,
        )
        data["virtual"] = False
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_subaccount(self):
        # l'ajout d'un sous-compte à un compte virtuel doit être acepté
        # par l'API
        data = {
            "name": "Réserves",
            "account_type": Account.AccountType.LIABILITY,
            "virtual": False,
            "parent": self.liabilities.pk,
            "book": self.book.pk,
        }
        url = reverse("flairsou_api:account-create")
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_forbidden_on_create(self):
        url = reverse("flairsou_api:account-create")
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete_account(self):
        # la suppression d'un compte sans opérations fonctionne
        url = reverse("flairsou_api:account-detail", kwargs={"pk": self.expenses.pk})
        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # création d'une transaction
        tr = Transaction.objects.create(date=datetime.date.today(), checked=False)
        Operation.objects.create(
            debit=10000,
            credit=0,
            label="Recette 1",
            account=self.assets,
            transaction=tr,
        )
        Operation.objects.create(
            debit=0,
            credit=10000,
            label="Recette 1",
            account=self.liabilities,
            transaction=tr,
        )

        # la suppression d'un compte avec une opération est refusée
        url = reverse("flairsou_api:account-detail", kwargs={"pk": self.assets.pk})
        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json()["error"], AccountDetail.errors["account_with_ops"]
        )

        # suppression de la transaction
        tr.delete()

        # création d'un sous-compte
        Account.objects.create(
            name="Courant",
            account_type=Account.AccountType.ASSET,
            parent=self.assets,
            virtual=False,
            book=self.book,
        )

        # la suppression d'un compte avec des sous-comptes est refusée
        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json()["error"], AccountDetail.errors["account_with_subaccounts"]
        )
