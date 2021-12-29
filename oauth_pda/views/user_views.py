from rest_framework import views
from rest_framework.response import Response
from rest_framework import status

from oauth_pda.serializers import UserInfo
from oauth_pda.serializers import UserInfoSerializer
from oauth_pda.serializers import AnonymousUserInfo


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
