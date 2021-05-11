from rest_framework import serializers

from flairsou_api.models import Account


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['pk', 'name', 'accountType', 'virtual', 'parent', 'book']

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

        # si la requête est POST, on fait les tests pour la création d'un
        # nouveau compte, on va donc vérifier des contraintes d'existence
        # en bdd qui ne doivent pas être vérifiées pour une mise à jour.
        if self.context['request'].method == 'POST':
            create: bool = True
        else:
            create: bool = False

        # un livre ou un parent mais pas les deux
        if parent is not None and book is not None:
            raise serializers.ValidationError(
                'Un compte ne peut pas être rattaché à un parent et à un '
                'livre en même temps')

        # si parent alors pas de type
        if parent is not None and accountType is not None:
            raise serializers.ValidationError(
                'Un compte rattaché à un parent doit avoir un type null')

        if create:
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
