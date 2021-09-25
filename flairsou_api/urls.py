from django.urls import path

from . import views

app_name = 'flairsou_api'
urlpatterns = [
    # sur accounts/ on a uniquement la création des comptes
    path('accounts/', views.AccountCreation.as_view(), name="account-create"),
    # on a ensuite les routes de listing par filtre
    path('accounts/byBook/<int:book>/',
         views.AccountListFilter.as_view(),
         name="account-filter-by-book"),
    # et la route de détails d'un compte particulier
    path('accounts/<int:pk>/',
         views.AccountDetail.as_view(),
         name="account-detail"),
    path('books/', views.BookList.as_view(), name="book-list"),
    path('books/byEntity/<uuid:uuid>/',
         views.BookList.as_view(),
         name="book-list-filter"),
    path('books/<int:pk>/', views.BookDetail.as_view(), name="book-detail"),
]
