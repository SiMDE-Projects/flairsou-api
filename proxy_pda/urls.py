from django.urls import path

from .views import GetUserInfo

app_name = 'proxy_pda'

urlpatterns = [
    path(
        'get_user_infos',
        GetUserInfo.as_view(),
        name='get-user-infos',
    ),
]
