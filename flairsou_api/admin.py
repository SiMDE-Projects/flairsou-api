from django.contrib import admin

from . import models


class BookAdmin(admin.ModelAdmin):
    search_fields = ["name"]


admin.site.register(models.Book, BookAdmin)


class AccountAdmin(admin.ModelAdmin):
    search_fields = ["name"]


admin.site.register(models.Account, AccountAdmin)


class OperationAdmin(admin.ModelAdmin):
    search_fields = ["label", "transaction__pk"]


admin.site.register(models.Operation, OperationAdmin)


class TransactionAdmin(admin.ModelAdmin):
    search_fields = ["date"]


admin.site.register(models.Transaction, TransactionAdmin)

admin.site.register(models.Reconciliation)
