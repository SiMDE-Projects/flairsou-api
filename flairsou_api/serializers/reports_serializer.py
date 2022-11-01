from .flairsou_serializers import FlairsouModelSerializer
from flairsou_api.models import Book
from flairsou_api.models import Account

from rest_framework import serializers
from datetime import datetime


class BalanceSheetEntrySerializer(FlairsouModelSerializer):
    """
    Serializer pour une entrée du bilan. L'entrée du bilan est composée
    du compte, du solde du compte à cette date, et de la liste des entrées
    des sous-comptes.
    """

    entries = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ["pk", "name", "account_type", "value", "entries"]

    def get_value(self, instance: Account) -> int:
        request = self.context["request"]
        date = request.query_params.get("date")
        if date is not None:
            try:
                date = datetime.strptime(date, "%Y-%m-%d").date()
                return instance.balance_at_date(date)
            except ValueError:
                pass
        return instance.balance

    def get_entries(self, instance: Account):
        return BalanceSheetEntrySerializer(
            instance.account_set.all(), many=True, context=self.context
        ).data


class BalanceSheetSerializer(FlairsouModelSerializer):
    """
    Serializer chargé de créer un Bilan comptable. Le bilan recense l'état
    des comptes d'actif, de passif et de capitaux propres à une date donnée.
    Par défaut, le bilan considère tous les comptes du livre. L'utilisateur
    peut spécifier des comptes particuliers à utiliser.
    """

    entries = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ["pk", "entity", "entries"]

    def get_entries(self, instance: Book):
        accounts = instance.account_set.filter(
            parent=None,
            account_type__in=[
                Account.AccountType.ASSET,
                Account.AccountType.LIABILITY,
                Account.AccountType.EQUITY,
            ],
        )
        return BalanceSheetEntrySerializer(
            accounts, many=True, context=self.context
        ).data
