from rest_framework.response import Response
from rest_framework import views

from drf_multiple_model.views import ObjectMultipleModelAPIView

from proxy_pda.serializers import UserInfoSerializer
from proxy_pda.serializers import AssoSerializer, NestedAssoSerializer
from proxy_pda.serializers import MultiAssoSerializer
from proxy_pda.models import Asso
from proxy_pda.utils.retrieve_user_info import retrieve_user_info
from proxy_pda.utils.retrieve_user_info import request_user_assos

from flairsou_api.models import Account

from drf_spectacular.utils import extend_schema


class GetUserInfo(views.APIView):
    """
    Vue qui renvoie les informations de l'utilisateur connecté
    """
    serializer_class = UserInfoSerializer

    def get(self, request, *args, **kwargs):
        # récupère les infos utilisateur à partir de la requête
        (user, status) = retrieve_user_info(request)
        return Response(user.data, status=status)


@extend_schema(responses={200: MultiAssoSerializer})
class GetListAssos(ObjectMultipleModelAPIView):
    """
    Vue qui renvoie la liste des associations pour lesquelles l'utilisateur
    connecté a les droits de trésorerie. Le retour tient compte de la
    hiérarchie des associations.
    """

    def get_querylist(self):
        """
        Construit la liste de querysets adaptées à l'utilisateur
        """

        querylist = []

        # si les associations ne sont pas en cache dans la session, on les
        # récupère et on les met en cache
        if 'assos' not in self.request.session:
            request_user_assos(self.request)

        ### Associations directes ###
        allowedAssos = self.request.session['assos']

        querylist.append({
            'queryset': Asso.objects.filter(pk__in=allowedAssos),
            'serializer_class': NestedAssoSerializer,
            'label': 'direct_assos'
        })

        ### Associations en droit de lecture ###

        # pour chaque asso de l'utilisateur, on recherche les comptes
        # associés à cette asso
        accounts = Account.objects.filter(
            associated_entity__in=self.request.session['assos'])

        # récupération des associations
        associatedAssos = set([])
        for acc in accounts:
            associatedAssos.add(acc.book.entity)

        querylist.append({
            'queryset':
            Asso.objects.filter(pk__in=associatedAssos),
            'serializer_class':
            AssoSerializer,
            'label':
            'associated_assos'
        })

        return querylist
