from django.urls import path

from .views import GetUserInfo
from .views import GetListAssos
from .views import GetListAssociatedAssos

app_name = 'proxy_pda'

urlpatterns = [
    path(
        'get_user_infos',
        GetUserInfo.as_view(),
        name='get-user-infos',
    ),
    path(
        'get_list_assos',
        GetListAssos.as_view(),
        name='get_list_assos',
    ),
    path(
        'get_associated_assos',
        GetListAssociatedAssos.as_view(),
        name='get_associated_assos',
    ),
]
