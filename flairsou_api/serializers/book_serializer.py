from rest_framework import serializers

from flairsou_api.models import Book


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['pk', 'name', 'entity']
