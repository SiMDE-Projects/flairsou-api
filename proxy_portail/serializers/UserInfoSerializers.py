from rest_framework import serializers


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
        self.id = portailResponse['id']


class UserInfoSerializer(serializers.Serializer):
    """
    Serializer pour renvoyer au front les informations sur l'utilisateur
    connecté
    """
    firstname = serializers.CharField()
    lastname = serializers.CharField()
