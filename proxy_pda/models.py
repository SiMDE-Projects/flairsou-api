from django.db import models

import uuid

from . import utils

role_id_to_enum = {
    '5de178b0-3af5-11e9-ba7f-73313b44d9ac': 0,
    '5de1ff90-3af5-11e9-97a6-fb1b9b5a404e': 1,
    '5de27990-3af5-11e9-b0eb-1f2ccc6dfc47': 2,
    '5de112e0-3af5-11e9-b659-27adbaca4008': 3,
}


class Asso(models.Model):
    """
    Mise en cache de la structure des association de la fédération
    """

    class AssoType(models.IntegerChoices):
        """
        Type de l'association
        """
        COMMISSION = 0
        CLUB = 1
        PROJECT = 2
        ASS1901 = 3

    # ID de l'association selon le portail des assos
    asso_id = models.UUIDField('ID', null=False, blank=False, primary_key=True)

    # nom court de l'association
    shortname = models.CharField('shortname',
                                 max_length=100,
                                 blank=False,
                                 null=False)

    # nom complet de l'association
    name = models.CharField('name', max_length=100, blank=False, null=False)

    # type de l'association
    asso_type = models.IntegerField(choices=AssoType.choices,
                                    blank=False,
                                    null=False)

    # association parente (pôle, BDE ou rien)
    parent = models.ForeignKey('self',
                               on_delete=models.DO_NOTHING,
                               blank=False,
                               null=True)

    # autorisation donnée à l'association parente pour consulter la comptabilité
    parent_view_granted = models.BooleanField('Parent view granted',
                                              blank=False,
                                              null=False,
                                              default=False)

    # indique si l'association est dans le cimetière ou non (potentiellement pour passer en
    # lecture seule les comptes)
    in_cemetery = models.BooleanField('in_cemetery',
                                      blank=False,
                                      null=False,
                                      default=False)

    # date de dernière mise à jour de l'association, pour savoir si il faut la mettre à jour
    last_updated = models.DateTimeField(name='last_updated',
                                        blank=False,
                                        null=False)

    def __str__(self) -> str:
        return "{} ({})".format(self.shortname, self.asso_id)

    @property
    def parent_can_view(self) -> bool:
        """
        Le parent (pôle / BDE) peut voir les comptes de ses sous-associations si c'est une
        commission, un club ou un projet (tout sauf 1901) ou si l'accès a été explicitement
        autorisé par l'association 1901
        """
        return self.asso_type != self.AssoType.ASS1901 or self.parent_view_granted

    @classmethod
    def create_asso(cls, PDA_resp):
        """
        Crée une association à partir de la réponse du PDA
        """

        # récupération de l'identifiant
        asso_id = uuid.UUID(PDA_resp['id'])

        # récupération du nom court
        shortname = PDA_resp['shortname']

        # récupération du nom complet
        name = PDA_resp['name']

        # récupération du type
        if PDA_resp['type']['id'] not in role_id_to_enum.keys():
            # on vérifie que le type est dans le dictionnaire
            raise ValueError("Le type d'association {} n'est pas connu".format(
                PDA_resp['type']['name']))

        asso_type = Asso.AssoType(role_id_to_enum[PDA_resp['type']['id']])

        # si l'association a été supprimée ou est dans le cimetière, on le marque
        if PDA_resp['deleted_at'] or PDA_resp['in_cemetery_at']:
            in_cemetery = True
        else:
            in_cemetery = False

        # date de la dernière mise à jour de l'association
        last_updated = utils.date_to_timezone(PDA_resp['updated_at'])

        # création de l'objet
        return cls(asso_id=asso_id,
                   shortname=shortname,
                   name=name,
                   asso_type=asso_type,
                   in_cemetery=in_cemetery,
                   last_updated=last_updated)
