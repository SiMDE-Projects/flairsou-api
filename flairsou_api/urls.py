from django.urls import path, re_path

from . import views

app_name = 'flairsou_api'
urlpatterns = [
    re_path(r'accounts/(?P<book>\d+)?$',
            views.AccountList.as_view(),
            name="account-list"),
    path('accounts/<int:pk>/',
         views.AccountDetail.as_view(),
         name="account-detail"),
    re_path(r'books/(?P<entity>.+)?$',
            views.BookList.as_view(),
            name="book-list"),
    path('books/<int:pk>/', views.BookDetail.as_view(), name="book-detail"),
]
