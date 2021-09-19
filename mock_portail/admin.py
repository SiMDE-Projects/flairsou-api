from django.contrib import admin
from .models import CustomUser

# Register your models here.


class UserAdmin(admin.ModelAdmin):
    model = CustomUser
    filter_horizontal = (
        'user_permissions',
        'groups',
    )


admin.site.register(CustomUser, UserAdmin)
