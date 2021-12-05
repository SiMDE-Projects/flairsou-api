# Shell Plus Model Imports
from flairsou_api.models.account import Account
from flairsou_api.models.book import Book

from django.db import transaction

import uuid

accounts = {
    'Actifs': {
        'SG': {
            'Courant': {},
            'Livret A': {},
        },
        'Caisse': {},
        'Chèques': {},
    },
    'Passifs': {
        'CB': {},
    },
    'Dépenses': {
        'Assurance': {},
        'Fournisseurs': {},
    },
    'Recettes': {
        'Cotisation': {},
        'Subventions': {},
    },
}


def create_accounts(dic, parent, book):
    """
    Parcours du dictionnaire pour créer récursivement les comptes
    """
    for account, subaccount in dic.items():
        if parent is None:
            if account == 'Actifs':
                acc_type = Account.AccountType.ASSET
            if account == 'Passifs':
                acc_type = Account.AccountType.LIABILITY
            if account == 'Dépenses':
                acc_type = Account.AccountType.EXPENSE
            if account == 'Recettes':
                acc_type = Account.AccountType.INCOME
        else:
            acc_type = parent.account_type

        if len(subaccount) == 0:
            virtual = False
        else:
            virtual = True

        acc = Account.objects.create(name=account,
                                     account_type=acc_type,
                                     virtual=virtual,
                                     parent=parent,
                                     book=book)

        create_accounts(subaccount, acc, book)


book = Book.objects.create(name='BDE-UTC', entity=uuid.UUID(int=1))

with transaction.atomic():
    create_accounts(accounts, None, book)
