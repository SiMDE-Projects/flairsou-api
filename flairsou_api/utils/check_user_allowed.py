from rest_framework.permissions import BasePermission


class UserAllowed(BasePermission):

    def has_object_permission(self, request, view, obj):
        if 'assos' not in request.session.keys():
            return False

        return obj.check_user_allowed(request)

    def check_entity_allowed(entity: str, request):
        if 'assos' not in request.session.keys():
            return False

        if entity not in request.session['assos']:
            return False

        return True
