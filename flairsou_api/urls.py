from django.urls import path

from . import views

app_name = "flairsou_api"
urlpatterns = [
    # sur accounts/ on a uniquement la création des comptes
    path("accounts/", views.AccountCreation.as_view(), name="account-create"),
    # et la route de détails d'un compte particulier
    path("accounts/<int:pk>/", views.AccountDetail.as_view(), name="account-detail"),
    # solde du compte
    path(
        "accounts/<int:pk>/balance/",
        views.AccountBalance.as_view(),
        name="account-balance",
    ),
    # rapprochement du compte
    path(
        "accounts/<int:pk>/reconciliation/",
        views.ReconciliationView.as_view(),
        name="account-reconciliation",
    ),
    path(
        "accounts/<int:pk>/transactions/",
        views.AccountTransactionList.as_view(),
        name="account-transaction-list",
    ),
    # récupération du livre par l'entité associée
    path(
        "books/byEntity/<uuid:entity>/",
        views.BookListFilter.as_view(),
        name="book-filter-by-entity",
    ),
    # renvoie une représentation imbriquée des comptes d'un livre
    path(
        "books/<int:pk>/accounts/",
        views.BookAccountList.as_view(),
        name="book-get-all-accounts",
    ),
    # et la route de détails sur un livre particulier
    path("books/<int:pk>/", views.BookDetail.as_view(), name="book-detail"),
    # routes transactions
    path("transactions/", views.TransactionCreate.as_view(), name="transaction-create"),
    path(
        "transactions/<int:pk>/",
        views.TransactionDetail.as_view(),
        name="transaction-detail",
    ),
]
