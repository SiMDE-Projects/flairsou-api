from rest_framework.response import Response
from rest_framework import views
from rest_framework import generics
from rest_framework import mixins
from rest_framework.exceptions import NotAuthenticated

from proxy_pda.serializers import UserInfoSerializer
from proxy_pda.serializers import AssoSerializer
from proxy_pda.models import Asso
from proxy_pda.utils.retrieve_user_info import retrieve_user_info
from proxy_pda.utils.pda_request import pda_request

treso_role = {
    'president': '5e03dae0-3af5-11e9-a43d-b3a93bca68c7',
    'vice-president': '5e055850-3af5-11e9-8179-b960d37afa08',
    'tresorier': '5e0c2200-3af5-11e9-8230-e56a8ddde0e6',
    'vice-treso': '5e0e4050-3af5-11e9-ad2e-ef2b3dd03999',
}


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
        self.check_user_logged_in(request)
        return self.list(request, *args, **kwargs)

    def check_user_logged_in(self, request):
        """
        Vérifie si l'utilisateur est connecté dans la requête
        TODO : voir si on ne peut pas mettre en place un modèle
        d'utilisateur quelque part
        """
        if 'user' not in request.session:
            raise NotAuthenticated()

    def get_queryset(self):
        """
        Construit la queryset adaptée à l'utilisateur
        """

        # récupération de l'ID utilisateur
        user_id = self.request.session['user']['id']
        url = 'https://assos.utc.fr/api/v1/users/{}/assos'.format(user_id)

        auth_token = self.request.session['token']['access_token']

        # récupération des associations auxquelles l'utilisateur est
        # actuellement inscrit
        response = pda_request(url, auth_token)

        respJson = response.json()

        # liste des associations autorisées pour l'utilisateur
        allowedAssos = []

        for asso in respJson:
            userRole = asso['pivot']['role_id']

            # on considère uniquement les associations pour lesquelles
            # l'utilisateur a un rôle de trésorerie ou de présidence
            if userRole not in treso_role.values():
                continue

            allowedAssos.append(asso['id'])

        return Asso.objects.filter(pk__in=allowedAssos)
