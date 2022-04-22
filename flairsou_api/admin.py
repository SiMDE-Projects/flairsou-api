from django.contrib import admin

from . import models


class BookAdmin(admin.ModelAdmin):
    search_fields = ["name"]


admin.site.register(models.Book, BookAdmin)


class AccountAdmin(admin.ModelAdmin):
    search_fields = ["name"]
    raw_id_fields = ["parent"]

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields["parent"].required = False
        form.base_fields["associated_entity"].required = False
        return form


admin.site.register(models.Account, AccountAdmin)


class OperationAdmin(admin.ModelAdmin):
    search_fields = ["label", "transaction__pk"]


admin.site.register(models.Operation, OperationAdmin)


class OperationInline(admin.TabularInline):
    model = models.Operation
    raw_id_fields = ("account",)


class TransactionAdmin(admin.ModelAdmin):
    search_fields = ["date"]
    inlines = [OperationInline]

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields["invoice"].required = False
        return form


admin.site.register(models.Transaction, TransactionAdmin)

admin.site.register(models.Reconciliation)
