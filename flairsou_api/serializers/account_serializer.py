from rest_framework import serializers

from flairsou_api.models import Account


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['pk', 'name', 'accountType', 'virtual', 'parent', 'book']

    def is_update_request(self):
        return self.context['request'].method == 'PUT'

    def is_create_request(self):
        return self.context['request'].method == 'POST'

    def validate(self, data):
        """
        Validation de l'objet compte au moment de la sérialisation
        Permet de renvoyer les erreurs au front avant de passer à la
        base de données
        """
        name = data['name']
        accountType = data['accountType']
        parent = data['parent']
        book = data['book']

        # un livre ou un parent mais pas les deux
        if parent is not None and book is not None:
            raise serializers.ValidationError(
                'Un compte ne peut pas être rattaché à un parent et à un '
                'livre en même temps')

        # le parent et le livre ne peuvent pas être null en même temps
        if parent is None and book is None:
            raise serializers.ValidationError(
                'Un compte doit être rattaché à un parent ou un livre')

        # si parent alors pas de type
        if parent is not None and accountType is not None:
            raise serializers.ValidationError(
                'Un compte rattaché à un parent doit avoir un type null')

        if self.is_create_request():
            # ces points doivent être vérifiés uniquement à la création
            # et pas à la mise à jour

            # vérification d'un autre compte de même nom sous le parent
            if parent is not None:
                if parent.account_set.filter(name=name).count() > 0:
                    raise serializers.ValidationError(
                        'Un compte avec ce nom existe déjà dans le compte '
                        'parent')

            # vérification d'un autre compte de même nom sous le livre
            if book is not None:
                if book.account_set.filter(name=name).count() > 0:
                    raise serializers.ValidationError(
                        'Un compte avec ce nom existe déjà dans le livre '
                        'parent')

        return data

    def validate_book(self, value):
        """
        Validation de l'attriut Book au moment de la sérialisation
        Ici, on valide qu'à la mise à jour, on n'autorise pas le
        changement du book vers une autre valeur non null.
        """
        if self.is_update_request():
            if value is not None and value != self.instance.book:
                raise serializers.ValidationError(
                    'Le livre ne peut pas être modifié')

        # si le book passe à None, c'est peut-être qu'on rattache le
        # compte à un compte plutôt qu'au livre, auquel cas c'est la
        # validation globale au niveau objet qui va vérifier qu'il
        # y a bien exactement un des deux champs remplis
        return value

    def validate_accountType(self, value):
        """
        Validation du type d'un compte.
        La modification du type d'un compte n'est pas autorisée.
        """
        if self.is_update_request() and value != self.instance.accountType:
            raise serializers.ValidationError(
                'Le type du compte ne peut pas être modifié')

        return value