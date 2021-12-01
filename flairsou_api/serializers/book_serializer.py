import uuid

from .flairsou_serializers import FlairsouModelSerializer
from flairsou_api.models import Book


class BookSerializer(FlairsouModelSerializer):
    class Meta:
        model = Book
        fields = ['pk', 'name', 'entity']

    def validate_entity(self, entity: uuid.UUID):
        """
        Vérifie que l'entité n'est pas déjà associée à un livre
        Lors de la mise à jour du champ, vérifie que l'entité associée au
        livre n'est pas modifiée, car les comptes sont attachés aux livres
        """
        books = Book.objects.all()
        for book in books:
            if book.entity == entity:
                raise self.ValidationError('Un livre est déjà associé '
                                           'à cette entité')

        if self.is_update_request():
            if entity != self.instance.entity:
                raise self.ValidationError('L\'entité associée au livre '
                                           'ne peut pas être modifiée')

        return entity
