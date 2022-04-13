from django.contrib import admin

from . import models


class AssoAdmin(admin.ModelAdmin):
    search_fields = ["shortname", "name"]


admin.site.register(models.Asso, AssoAdmin)
