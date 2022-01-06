from rest_framework import serializers
import uuid


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
