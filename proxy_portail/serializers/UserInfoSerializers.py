from rest_framework import serializers

import uuid


class UserInfo:

    def __init__(self, portailResponse):
        """
        portailResponse : réponse du portail sur la route des informations
        de l'utilisateur
        """
        # prénom
        self.firstname = portailResponse['firstname']
        # nom
        self.lastname = portailResponse['lastname']
        # ID
        self.id = uuid.UUID(portailResponse['id'])


AnonymousUserInfo = UserInfo({
    'firstname': 'Anonyme',
    'lastname': '',
    'id': str(uuid.UUID(int=0))
})


class UserInfoSerializer(serializers.Serializer):
    """
    Serializer pour renvoyer au front les informations sur l'utilisateur
    connecté
    """
    firstname = serializers.CharField()
    lastname = serializers.CharField()
    id = serializers.UUIDField()
