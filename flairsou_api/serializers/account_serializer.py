from rest_framework import serializers

from flairsou_api.models import Account, Book


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['pk', 'name', 'account_type', 'virtual', 'parent', 'book']

    def is_update_request(self):
        return self.context['request'].method == 'PUT'

    def is_create_request(self):
        return self.context['request'].method == 'POST'

    def check_one_parent_xor_one_book(self, parent: Account, book: Book):
        # un livre ou un parent mais pas les deux
        if parent is not None and book is not None:
            raise serializers.ValidationError(
                'Un compte ne peut pas être rattaché à un parent et à un '
                'livre en même temps')

        # le parent et le livre ne peuvent pas être null en même temps
        if parent is None and book is None:
            raise serializers.ValidationError(
                'Un compte doit être rattaché à un parent ou un livre')

    def check_if_parent_no_type(self, parent: Account,
                                account_type: Account.AccountType):
        # si parent alors pas de type
        if parent is not None and account_type is not None:
            raise serializers.ValidationError(
                'Un compte rattaché à un parent doit avoir un type null')

    def check_name_unique_in_parent(self, parent: Account, name: str):
        """
        Vérifie que le nom proposé pour le compte n'existe pas déjà sous le
        compte parent. Ce test n'est effectué que sur une requête de création
        de compte.
        """
        if self.is_create_request():
            if parent is not None:
                if parent.account_set.filter(name=name).count() > 0:
                    raise serializers.ValidationError(
                        'Un compte avec ce nom existe déjà dans le compte '
                        'parent')

    def check_name_unique_in_book(self, book: Book, name: str):
        """
        Vérifie que le nom proposé pour le compte n'existe pas déjà sous
        le livre associé. Ce test n'est effectué que sur une requête de
        création de compte.
        """
        if self.is_create_request():
            if book is not None:
                if book.account_set.filter(name=name).count() > 0:
                    raise serializers.ValidationError(
                        'Un compte avec ce nom existe déjà dans le livre '
                        'parent')

    def check_type_change_parent(self, account_type: Account.AccountType,
                                 parent: Account):
        """
        Vérification du type lors de la mise à jour avec éventuellement un
        changement du compte parent : on s'assure que le type global reste le
        même lors de la mise à jour
        """
        if self.is_update_request():
            # récupération du type avant la mise à jour
            current_type = self.instance.get_type()

            # détermination du nouveau type
            if account_type is not None:
                new_type = account_type
            else:
                # si le nouveau type est None, on a un parent associé, on
                # récupère le type hérité
                new_type = parent.get_type()

            if current_type != new_type:
                raise serializers.ValidationError(
                    'Un compte ne peut pas changer de type')

    def validate(self, data):
        """
        Validation de l'objet compte au moment de la sérialisation.
        Permet de renvoyer les erreurs au front avant de passer à la
        base de données. La méthode exécute les différentes vérifications
        à effectuer.
        """
        name = data['name']
        account_type = data['account_type']
        parent = data['parent']
        book = data['book']

        self.check_one_parent_xor_one_book(parent, book)

        self.check_if_parent_no_type(parent, account_type)

        self.check_name_unique_in_parent(parent, name)

        self.check_name_unique_in_book(book, name)

        self.check_type_change_parent(account_type, parent)

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

    def validate_virtual(self, value):
        """
        Validation du flag virtuel sur le compte.
        On vérifie à la mise à jour que :
        - si le compte devient virtuel, il ne doit pas avoir de
        transactions
        - si le compte devient non-virtuel, il ne doit pas avoir de
        sous-comptes
        """

        if self.is_update_request() and value != self.instance.virtual:
            if value is True and self.instance.operation_set.count() > 0:
                # si le compte devient virtuel, il ne doit pas avoir
                # d'opérations associées
                raise serializers.ValidationError(
                    'Un compte avec des transactions '
                    'ne peut pas devenir virtuel')

            if value is False and self.instance.account_set.count() > 0:
                # si le compte devient réel, il ne doit pas avoir
                # de sous-comptes
                raise serializers.ValidationError(
                    'Un compte avec des sous-comptes '
                    'ne peut pas devenir non-virtuel')

        return value

    def validate_parent(self, parent: Account):
        if parent is not None:
            if not parent.virtual:
                raise serializers.ValidationError(
                    'Le compte parent doit être virtuel')

        return parent
