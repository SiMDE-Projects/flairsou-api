from django.db import transaction
from django.utils import timezone

from rest_framework import status

import requests
import uuid
import copy
import datetime

from . import models as m
from . import serializers as s


def sync_assos():
    """
    Synchronise la base de données locale avec la liste des associations
    renvoyée par le portail des assos
    """

    # récupère la liste des associations depuis le portail des assos
    r = requests.get("https://assos.utc.fr/api/v1/assos")
    assos_pda = r.json()

    # récupération des associations stockées localement
    existing_assos = list(m.Asso.objects.all())

    # tableaux à remplir pour faire les enregistrements à la main
    bulk_create = []
    bulk_update = []

    # pour chaque association renvoyée par le portail
    for asso_pda in assos_pda:
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
        new_asso = m.Asso.create_asso(detailed_asso_pda)

        if existing_asso is None:
            # pas d'association existante correspondante, il faut créer la nouvelle
            # asso en base locale
            bulk_create.append(new_asso)

            if asso_pda["parent"]:
                # si l'association a un parent, on la met à jour après la création
                # avec l'ID de son parent (il faut que toutes les assos soient créées
                # pour que le parent puisse être ajouté)
                new_asso = copy.deepcopy(new_asso)  # copie profonde de l'asso
                new_asso.parent = m.Asso(
                    asso_id=detailed_asso_pda['parent']['id'])
                bulk_update.append(new_asso)
        else:
            # on a trouvé une association correspondante en local
            # si l'asso est supprimée, on la conserve dans la base locale sinon
            # on perd l'historique de la comptabilité (à voir plus tard si on peut
            # rattacher ailleurs...)
            # on fait donc une mise à jour de l'association si nécessaire
            last_updated = date_to_timezone(detailed_asso_pda['updated_at'])
            if last_updated > existing_asso.last_updated:
                bulk_update.append(new_asso)

    # application des opérations bdd en une fois
    with transaction.atomic():
        m.Asso.objects.bulk_create(bulk_create)
        m.Asso.objects.bulk_update(bulk_update,
                                   fields=[
                                       'shortname',
                                       'name',
                                       'parent',
                                       'asso_type',
                                       'in_cemetery',
                                       'last_updated',
                                   ])


def date_to_timezone(date: str):
    return timezone.make_aware(
        datetime.datetime.strptime(date, '%Y-%m-%d %H:%M:%S'))


def retrieve_user_info(request):
    """
    Fonction qui récupère les informations de l'utilisateur connecté
    """
    if 'token' not in request.session.keys():
        # si il n'y a pas de token, on supprime les éventuelles
        # informations utilisateur mises en cache
        if 'user' in request.session.keys():
            request.session.pop('user')

        user: s.UserInfoSerializer = s.AnonymousUserInfo
        resp_status = status.HTTP_401_UNAUTHORIZED
    else:
        if 'user' not in request.session.keys():
            # si l'utilisateur n'est pas en cache dans la session, on le
            # récupère depuis le PDA
            token = request.session['token']
            response = requests.get('https://assos.utc.fr/api/v1/user',
                                    headers={
                                        'Authorization':
                                        'Bearer {}'.format(
                                            token['access_token'])
                                    })
            user = s.UserInfoSerializer(response.json())
            request.session['user'] = user.data

        user = s.UserInfoSerializer(request.session['user'])
        resp_status = status.HTTP_200_OK

    return (user, resp_status)
