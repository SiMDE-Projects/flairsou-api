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
]
