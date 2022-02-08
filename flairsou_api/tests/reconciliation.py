from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

from datetime import datetime

from flairsou_api.models import Account, Book
from flairsou_api.serializers import ReconciliationSerializer


class ReconciliationTestCase(APITestCase):
    # base de données de test à charger
    fixtures = [
        'reduced_test_db.json',
    ]

    def setUp(self):
        book = Book.objects.get(id=1)
        # on autorise le client sur l'entité créée
        session = self.client.session
        session['assos'] = [str(book.entity)]
        session.save()

    def test_reconciliate(self):
        acc = Account.objects.get(name="Compte Courant")

        # on fait un get sur le rapprochement de ce compte
        # initialement il n'y a rien, ça doit renvoyer None
        url = reverse('flairsou_api:account-reconciliation',
                      kwargs={'pk': acc.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['account'])

        # on veut faire un rapprochement du mauvais montant, on doit renvoyer
        # une erreur 400 et le bon message d'erreur
        date = datetime.strptime('01/02/2014', '%d/%m/%Y').date()
        data = {
            'account': acc.pk,
            'date': date,
            'balance': 100,
        }
        response = self.client.post(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('balance', response.data)
        self.assertEqual(response.data['balance'][0],
                         ReconciliationSerializer.error_messages['balance'])

        # on veut maintenant faire un rapprochement du bon montant
        balance = acc.balance_at_date(date)
        data['balance'] = balance
        response = self.client.post(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # on vérifie qu'on ne peut pas faire un rapprochement avant le dernier
        # rapprochement
        date = datetime.strptime('15/01/2014', '%d/%m/%Y').date()
        data['date'] = date
        # on met le bon solde pour bien isoler l'erreur
        data['balance'] = acc.balance_at_date(date)
        response = self.client.post(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date', response.data)
        self.assertEqual(response.data['date'][0],
                         ReconciliationSerializer.error_messages['date'])

    def test_reconciliate_on_virtual(self):
        acc = Account.objects.get(name="Actif")

        url = reverse('flairsou_api:account-reconciliation',
                      kwargs={'pk': acc.pk})

        date = datetime.strptime('01/02/2014', '%d/%m/%Y').date()
        data = {
            'account': acc.pk,
            'date': date,
            'balance': acc.balance_at_date(date),
        }

        response = self.client.post(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('account', response.data)
        self.assertEqual(response.data['account'][0],
                         ReconciliationSerializer.error_messages['account'])
