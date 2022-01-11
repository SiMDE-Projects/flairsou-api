from django.db import transaction

import requests
import uuid
import copy

from proxy_pda.models import Asso, AssoType
from flairsou_api.models import Book, Account

from .date_to_timezone import date_to_timezone
from .base_account_struct import base_account_struct


def sync_assos():
    """
    Synchronise la base de données locale avec la liste des associations
    renvoyée par le portail des assos
    """

    # récupère la liste des associations depuis le portail des assos
    r = requests.get("https://assos.utc.fr/api/v1/assos")
    assos_pda = r.json()

    # récupération des associations stockées localement
    existing_assos = list(Asso.objects.all())

    # tableaux à remplir pour faire les enregistrements à la main
    bulk_create = []
    bulk_update = []

    print('{} assos à traiter...'.format(len(assos_pda)))

    # pour chaque association renvoyée par le portail
    for i, asso_pda in enumerate(assos_pda):
        print("Traitement de l'asso {} ({}/{})".format(asso_pda['shortname'],
                                                       i + 1, len(assos_pda)))

        # récupération des informations détaillées sur l'asso
        r = requests.get('https://assos.utc.fr/api/v1/assos/{}'.format(
            asso_pda['id']))
        detailed_asso_pda = r.json()

        # recherche d'une association existante dans la liste des assos
        existing_asso = None
        for i, tmp_asso in enumerate(existing_assos):
            if tmp_asso.asso_id == uuid.UUID(detailed_asso_pda['id']):
                existing_asso = tmp_asso
                existing_assos.pop(i)
                break

        # on crée l'asso concernée selon le modèle local
        new_asso = Asso.create_asso(detailed_asso_pda)

        if existing_asso is None:
            # pas d'association existante correspondante, il faut créer la
            # nouvelle asso en base locale
            bulk_create.append(new_asso)

            if asso_pda["parent"]:
                # si l'association a un parent, on la met à jour après la
                # création avec l'ID de son parent (il faut que toutes les
                # assos soient créées pour que le parent puisse être ajouté)
                new_asso = copy.deepcopy(new_asso)  # copie profonde de l'asso
                new_asso.parent = Asso(
                    asso_id=detailed_asso_pda['parent']['id'])
                bulk_update.append(new_asso)
        else:
            # on a trouvé une association correspondante en local
            # si l'asso est supprimée, on la conserve dans la base locale sinon
            # on perd l'historique de la comptabilité (à voir plus tard si on
            # peut rattacher ailleurs...)
            # on fait donc une mise à jour de l'association si nécessaire
            last_updated = date_to_timezone(detailed_asso_pda['updated_at'])
            if last_updated > existing_asso.last_updated:
                bulk_update.append(new_asso)

    print("Application des modifications en base...")

    # application des opérations bdd en une fois
    with transaction.atomic():
        Asso.objects.bulk_create(bulk_create)
        Asso.objects.bulk_update(bulk_update,
                                 fields=[
                                     'shortname',
                                     'name',
                                     'parent',
                                     'asso_type',
                                     'in_cemetery',
                                     'last_updated',
                                 ])

    print("Création des livres de compte de base")

    # création automatique des livres pour les associations
    create_books()


def create_books():
    """
    Fonction de création automatique d'un livre pour chaque asso
    de la base de données
    """

    # récupération de toutes les données
    assos = Asso.objects.all()

    # pour chaque asso
    for asso in assos:
        if asso.asso_type == AssoType.CLUB:
            # les clubs n'ont pas de compte dédié, on ne leur crée pas un
            # compte automatiquement
            continue

        # ID de l'asso
        asso_id = asso.asso_id

        if Book.objects.filter(entity=asso_id).count() == 0:
            # pas de livre avec cet ID, on en crée un nouveau
            print("Création d'un livre pour l'asso {}".format(asso.shortname))
            book = Book.objects.create(name='Comptes {}'.format(
                asso.shortname),
                                       entity=asso_id)

            # on crée une structure basique de comptes à associer à ce
            # nouveau livre
            create_accounts(copy.deepcopy(base_account_struct), book)


def create_accounts(account_list, book, parent=None):
    """
    Création récursive des comptes dans un livre
    """
    for account in account_list:
        # on sort les sous-comptes de l'élément
        account_set = account.pop('account_set')

        # ajout du livre
        account['book'] = book

        # création du compte
        account_obj = Account(**account)

        # ajout éventuel du paren éventuel
        account_obj.parent = parent

        # enregistrement de l'objet
        account_obj.save()

        # création récursive
        create_accounts(account_set, book, account_obj)
