from rest_framework.permissions import BasePermission


class UserAllowed(BasePermission):

    def has_object_permission(self, request, view, obj):
        if 'assos' not in request.session.keys():
            return False

        return obj.check_user_allowed(request)
