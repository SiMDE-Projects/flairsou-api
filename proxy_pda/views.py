from rest_framework.response import Response
from rest_framework import views

from .serializers import UserInfoSerializer
from .utils import retrieve_user_info


class GetUserInfo(views.APIView):
    """
    Vue qui renvoie les informations de l'utilisateur connecté
    """
    serializer_class = UserInfoSerializer

    def get(self, request, *args, **kwargs):
        # récupère les infos utilisateur à partir de la requête
        (user, status) = retrieve_user_info(request)
        return Response(user.data, status=status)
