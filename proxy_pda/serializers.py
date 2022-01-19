from rest_framework import serializers
import uuid

from proxy_pda.models import Asso


class UserInfoSerializer(serializers.Serializer):
    """
    Serializer pour renvoyer au front les informations sur l'utilisateur
    connecté. Permet de filtrer la réponse du portail en récupérant les
    champs qui nous intéressent
    """
    firstname = serializers.CharField()
    lastname = serializers.CharField()
    id = serializers.UUIDField()


# objet standard pour un utilisateur non connecté
AnonymousUserInfo = UserInfoSerializer({
    'firstname': 'Anonyme',
    'lastname': '',
    'id': str(uuid.UUID(int=0))
})


class AssoSerializer(serializers.ModelSerializer):
    """
    Serializer permettant de renvoyer les détails d'une associtation
    """

    class Meta:
        model = Asso
        fields = [
            'asso_id',
            'shortname',
            'name',
            'asso_type',
        ]


class NestedAssoSerializer(serializers.ModelSerializer):
    """
    Serializer permettant de renvoyer une association avec la liste
    de ses sous-associations
    """
    asso_set = serializers.SerializerMethodField()

    class Meta:
        model = Asso
        fields = [
            'asso_id',
            'shortname',
            'name',
            'asso_type',
            'asso_set',
        ]

    def get_asso_set(self, instance):
        sub_assos_granted = instance.get_sub_assos_granted()
        return AssoSerializer(sub_assos_granted, many=True).data
