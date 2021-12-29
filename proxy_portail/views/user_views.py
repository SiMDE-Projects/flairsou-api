from rest_framework import views
from rest_framework.response import Response
from rest_framework import status

from proxy_portail.serializers import UserInfo
from proxy_portail.serializers import UserInfoSerializer
from proxy_portail.serializers import AnonymousUserInfo


class GetUserInfo(views.APIView):
    """
    Vue qui renvoie les informations de l'utilisateur connecté
    """
    serializer_class = UserInfoSerializer

    def get(self, request, *args, **kwargs):
        try:
            user: UserInfo = request.session['user']
            resp_status = status.HTTP_200_OK
        except KeyError:
            user = AnonymousUserInfo
            resp_status = status.HTTP_401_UNAUTHORIZED

        return Response(UserInfoSerializer(user).data, status=resp_status)
