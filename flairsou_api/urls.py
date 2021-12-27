from django.urls import path

from . import views

app_name = 'flairsou_api'
urlpatterns = [
    # sur accounts/ on a uniquement la création des comptes
    path('accounts/', views.AccountCreation.as_view(), name="account-create"),
    # et la route de détails d'un compte particulier
    path('accounts/<int:pk>/',
         views.AccountDetail.as_view(),
         name="account-detail"),
    # solde du compte
    path('accounts/<int:pk>/balance/',
         views.AccountBalance.as_view(),
         name="account-balance"),
    # rapprochement du compte
    path('accounts/<int:pk>/reconciliation/',
         views.ReconciliationView.as_view(),
         name="account-reconciliation"),
    path('accounts/<int:pk>/operations/',
         views.AccountOpsList.as_view(),
         name="account-operation-list"),
    # sur books/ on a uniquement la création des livres
    path('books/', views.BookCreation.as_view(), name="book-create"),
    # on a ensuite les routes de listing par filtre
    path('books/byEntity/<uuid:entity>/',
         views.BookListFilter.as_view(),
         name="book-filter-by-entity"),
    # renvoie une représentation imbriquée des comptes d'un livre
    path('books/<int:pk>/accounts/',
         views.BookAccountList.as_view(),
         name="book-get-all-accounts"),
    # et la route de détails sur un livre particulier
    path('books/<int:pk>/', views.BookDetail.as_view(), name="book-detail"),
    # urls operations pour le dev, à retirer ensuite
    path('operations/', views.OperationList.as_view(), name="operation-list"),
    path('operations/<int:pk>/',
         views.OperationDetail.as_view(),
         name="operation-detail"),
    path('transactions/',
         views.TransactionList.as_view(),
         name="transaction-list"),
    path('transactions/<int:pk>/',
         views.TransactionDetail.as_view(),
         name="transaction-detail"),
    path('oauth/authlink',
         views.get_authorization_link,
         name="request-auth-link"),
    path('oauth/request_token/<str:code>',
         views.request_oauth_token,
         name="request-oauth-token"),
    path('user/user_infos', views.get_user_infos, name="get-user-infos"),
]
