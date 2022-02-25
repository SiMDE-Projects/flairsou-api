from rest_framework.response import Response
from rest_framework import views
from rest_framework import generics
from rest_framework import mixins

from proxy_pda.serializers import UserInfoSerializer
from proxy_pda.serializers import AssoSerializer
from proxy_pda.models import Asso
from proxy_pda.utils.retrieve_user_info import retrieve_user_info
from proxy_pda.utils.retrieve_user_info import request_user_assos
from proxy_pda.utils.check_user_logged_in import check_user_logged_in


class GetUserInfo(views.APIView):
    """
    Vue qui renvoie les informations de l'utilisateur connecté
    """

    serializer_class = UserInfoSerializer

    def get(self, request, *args, **kwargs):
        # récupère les infos utilisateur à partir de la requête
        (user, status) = retrieve_user_info(request)
        return Response(user.data, status=status)


class GetListAssos(mixins.ListModelMixin, generics.GenericAPIView):
    """
    Vue qui renvoie la liste des associations pour lesquelles l'utilisateur
    connecté a les droits de trésorerie. Le retour tient compte de la
    hiérarchie des associations.
    """

    serializer_class = AssoSerializer

    def get(self, request, *args, **kwargs):
        check_user_logged_in(request)
        return self.list(request, *args, **kwargs)

    def get_queryset(self):
        """
        Construit la queryset adaptée à l'utilisateur
        """

        request_user_assos(self.request)
        allowedAssos = self.request.session["assos"]

        return Asso.objects.filter(pk__in=allowedAssos)
