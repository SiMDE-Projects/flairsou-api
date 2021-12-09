from django.urls import path, include

from .views import get_association_list

app_name = 'mock_portail'
urlpatterns = [
    path('', include('django.contrib.auth.urls')),
    path('list_assos/<int:pk>',
         get_association_list,
         name='get-association-list'),
]
