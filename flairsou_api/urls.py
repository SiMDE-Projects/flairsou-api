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
    # sur books/ on a uniquement la création des livres
    path('books/', views.BookCreation.as_view(), name="book-create"),
    # on a ensuite les routes de listing par filtre
    path('books/byEntity/<uuid:entity>/',
         views.BookListFilter.as_view(),
         name="book-filter-by-entity"),
    # et la route de détails sur un livre particulier
    path('books/<int:pk>/', views.BookDetail.as_view(), name="book-detail"),
]
