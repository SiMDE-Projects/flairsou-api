from .flairsou_serializers import FlairsouModelSerializer
from flairsou_api.models import Account, Book


class AccountSerializer(FlairsouModelSerializer):
    class Meta:
        model = Account
        fields = ['pk', 'name', 'account_type', 'virtual', 'parent', 'book']

    def check_same_book_parent(self, parent: Account, book: Book):
        """
        Vérifie que le compte est rattaché au même livre que son père.
        Si le compte n'a pas de père, le livre est validé par défaut.
        """
        if parent is not None:
            if book != parent.book:
                raise self.ValidationError(
                    'Un compte doit être rattaché au même livre que son père')

    def check_same_type_parent(self, parent: Account,
                               account_type: Account.AccountType):
        """
        Vérifie que le compte est du même type que son père. Si le compte
        n'a pas de père, le type est validé par défaut.
        """
        if parent is not None:
            if account_type != parent.account_type:
                raise self.ValidationError(
                    'Un compte doit avoir le même type que son père')

    def check_name_unique_in_parent(self, parent: Account, name: str):
        """
        Vérifie que le nom proposé pour le compte n'existe pas déjà sous le
        compte parent. Ce test n'est effectué que sur une requête de création
        de compte.
        """
        if self.is_create_request():
            if parent is not None:
                if parent.account_set.filter(name=name).count() > 0:
                    raise self.ValidationError(
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
                    raise self.ValidationError(
                        'Un compte avec ce nom existe déjà dans le livre '
                        'parent')

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

        self.check_same_book_parent(parent, book)

        self.check_same_type_parent(parent, account_type)

        self.check_name_unique_in_parent(parent, name)

        self.check_name_unique_in_book(book, name)

        return data

    def validate_book(self, book: Book):
        """
        Validation de l'attribut Book au moment de la sérialisation, le livre
        ne peut pas être modifié.
        """
        if self.is_update_request():
            if book != self.instance.book:
                raise self.ValidationError('Le livre ne peut pas être modifié')

        return book

    def validate_account_type(self, account_type: Account.AccountType):
        """
        Validation de l'attribut account_type au moment de la sérialisation,
        le type ne peut pas être modifié
        """
        if self.is_update_request():
            if account_type != self.instance.account_type:
                raise self.ValidationError('Le type ne peut pas être modifié')

        return account_type

    def validate_virtual(self, virtual: bool):
        """
        Validation du flag virtuel sur le compte.
        On vérifie à la mise à jour que :
        - si le compte devient virtuel, il ne doit pas avoir de transactions
        - si le compte devient non-virtuel, il ne doit pas avoir de
        sous-comptes
        """

        if self.is_update_request() and virtual != self.instance.virtual:
            if virtual is True and self.instance.operation_set.count() > 0:
                # si le compte devient virtuel, il ne doit pas avoir
                # d'opérations associées
                raise self.ValidationError('Un compte avec des transactions '
                                           'ne peut pas devenir virtuel')

            if virtual is False and self.instance.account_set.count() > 0:
                # si le compte devient réel, il ne doit pas avoir
                # de sous-comptes
                raise self.ValidationError('Un compte avec des sous-comptes '
                                           'ne peut pas devenir non-virtuel')

        return virtual

    def validate_parent(self, parent: Account):
        if parent is not None:
            if not parent.virtual:
                raise self.ValidationError(
                    'Le compte parent doit être virtuel')

        return parent


class AccountBalanceSerializer(FlairsouModelSerializer):
    class Meta:
        model = Account
        fields = ['pk', 'balance']
