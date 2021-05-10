from django.urls import path

from . import views

app_name = 'flairsou_api'
urlpatterns = [
    path('accounts/', views.AccountList.as_view()),
    path('accounts/<int:pk>/', views.AccountDetail.as_view()),
]
