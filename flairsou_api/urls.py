from django.urls import path

from . import views

app_name = 'flairsou_api'
urlpatterns = [
    path('accounts/', views.AccountList.as_view(), name="account-list"),
    path('accounts/byBook/<int:book>/',
         views.AccountList.as_view(),
         name="account-list-filter"),
    path('accounts/<int:pk>/',
         views.AccountDetail.as_view(),
         name="account-detail"),
    path('books/', views.BookList.as_view(), name="book-list"),
    path('books/byEntity/<uuid:uuid>/',
         views.BookList.as_view(),
         name="book-list-filter"),
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
]
