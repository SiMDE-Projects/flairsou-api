from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

import uuid
from flairsou_api.models import Account, Book, Transaction
from flairsou_api.serializers import TransactionSerializer


class CheckAPIAccessLimited(APITestCase):
    """
    Classe de test pour vérifier la limitation de l'accès aux APIs aux
    utilisateurs connectés et avec les droits sur les bons objets
    Cette classe teste les routes pour un utilisateur non connecté et pour
    un utilisateur n'ayant pas les droits sur le livre. Les cas où
    l'utilisateur a les droits sur le livre sont gérés dans les tests
    classiques.
    """

    # base de données de test à charger
    fixtures = [
        "reduced_test_db.json",
    ]

    def setUp(self):
        # récupération du livre chargé par la fixture
        self.book = Book.objects.all()[0]

    def execute_request(self, method, url, data):
        if method == "get":
            response = self.client.get(url, format="json")
        elif method == "post":
            response = self.client.post(url, data, format="json")
        elif method == "put":
            response = self.client.put(url, data, format="json")
        elif method == "delete":
            response = self.client.delete(url, format="json")

        return response

    def run_test(self, method, url, data=None):
        # utilisateur non enregistré
        response = self.execute_request(method, url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # utilisateur enregistré sur mauvais compte
        session = self.client.session
        session["assos"] = [str(uuid.UUID(int=1))]
        session.save()

        response = self.execute_request(method, url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_account(self):
        """
        Vérification de la route de création d'un compte
        """
        url = reverse("flairsou_api:account-create")

        data = {
            "name": "TmpActifs",
            "account_type": Account.AccountType.ASSET,
            "virtual": False,
            "parent": None,
            "book": self.book.id,
            "associated_entity": None,
        }

        self.run_test("post", url, data)

    def test_account_detail(self):
        """
        Vérification de la route d'accès à un compte
        """
        url = reverse("flairsou_api:account-detail", kwargs={"pk": 1})

        self.run_test("get", url)

    def test_update_account(self):
        """
        Vérification de la route de mise à jour d'un compte
        """
        account = Account.objects.get(id=1)
        data = {
            "pk": account.pk,
            "name": "Renommage",
            "account_type": account.account_type,
            "virtual": account.virtual,
            "parent": account.parent.id if account.parent else None,
            "book": account.book.id,
            "associated_entity": account.associated_entity,
        }

        url = reverse("flairsou_api:account-detail", kwargs={"pk": account.id})

        self.run_test("put", url, data)

    def test_delete_account(self):
        """
        Vérification de la route de suppression d'un compte
        """
        url = reverse("flairsou_api:account-detail", kwargs={"pk": 1})
        self.run_test("delete", url)

    def test_account_balance(self):
        """
        Vérification de la route d'obtention du solde d'un compte
        """
        url = reverse("flairsou_api:account-balance", kwargs={"pk": 1})
        self.run_test("get", url)

    def test_account_transactions(self):
        """
        Vérification de la route d'obtention des transactions du compte
        """
        url = reverse("flairsou_api:account-transaction-list", kwargs={"pk": 1})
        self.run_test("get", url)

    def test_account_get_reconciliation(self):
        """
        Vérification de la route d'obtention du dernier rapprochements du
        compte
        """
        url = reverse("flairsou_api:account-reconciliation", kwargs={"pk": 1})
        self.run_test("get", url)

    def test_account_post_reconciliation(self):
        """
        Vérification de la route de création d'un rapprochement
        """
        account = Account.objects.filter(virtual=False)[0]
        url = reverse("flairsou_api:account-reconciliation", kwargs={"pk": account.pk})
        data = {
            "account": account.pk,
            "date": "2022-02-05",
            "balance": 0,
        }
        self.run_test("post", url, data)

    def test_get_book(self):
        """
        Vérification de la route de détail d'un livre
        """
        url = reverse("flairsou_api:book-detail", kwargs={"pk": 1})
        self.run_test("get", url)

    def test_update_book(self):
        """
        Vérification de la route de mise à jour du livre
        """
        url = reverse("flairsou_api:book-detail", kwargs={"pk": 1})
        data = {
            "name": "Renommage",
            "entity": str(self.book.entity),
        }
        self.run_test("put", url, data)

    def test_book_list_accounts(self):
        """
        Vérification de la route qui récupère les comptes d'un livre
        """
        url = reverse("flairsou_api:book-get-all-accounts", kwargs={"pk": 1})
        self.run_test("get", url)

    def test_book_get_by_entity(self):
        """
        Vérification de la route de récupération du livre par l'UUID de
        l'association
        """
        url = reverse(
            "flairsou_api:book-filter-by-entity", kwargs={"entity": self.book.entity}
        )
        self.run_test("get", url)

    def test_transaction_create(self):
        """
        Vérification de la route de création d'une transaction
        """
        url = reverse("flairsou_api:transaction-create")
        acc1 = Account.objects.filter(
            virtual=False, account_type=Account.AccountType.ASSET
        )[0]
        acc2 = Account.objects.filter(
            virtual=False, account_type=Account.AccountType.INCOME
        )[0]
        data = {
            "date": "2022-02-05",
            "checked": True,
            "invoice": None,
            "operations": [
                {
                    "credit": 100,
                    "debit": 0,
                    "label": "test",
                    "account": acc1.pk,
                },
                {"credit": 0, "debit": 100, "label": "test", "account": acc2.pk},
            ],
        }

        self.run_test("post", url, data)

    def test_transaction_get(self):
        """
        Vérification de la route de récupération d'une transaction
        """
        url = reverse("flairsou_api:transaction-detail", kwargs={"pk": 1})
        self.run_test("get", url)

    def test_transaction_update(self):
        """
        Vérification de la route de mise à jour d'une transaction
        """
        url = reverse("flairsou_api:transaction-detail", kwargs={"pk": 1})

        transaction = Transaction.objects.get(id=1)
        serializer = TransactionSerializer(instance=transaction)
        data = serializer.data
        data["operations"][0]["label"] = "changement"
        self.run_test("put", url, data)

    def test_transaction_delete(self):
        url = reverse("flairsou_api:transaction-detail", kwargs={"pk": 1})
        self.run_test("delete", url)
