from rest_framework.permissions import BasePermission

from django.conf import settings


class UserAllowed(BasePermission):
    """
    Classe de permission permettant de vérifier que l'utilisateur
    à l'origine de la requête est bien autorisé à accéder à une
    vue et aux objets retournés. La classe est définie dans les
    vues génériques de django-rest-framework.
    """

    def has_object_permission(self, request, view, obj):
        """
        Fonction qui indique si la requête est autorisée à
        accéder à l'objet passé en paramètre
        """
        if settings.DEBUG:
            # si l'app est en debug, on ne vérifie pas les autorisations
            return True  # temporaire pour faciliter les tests

        if "assos" not in request.session.keys():
            # l'utilisateur n'est pas connecté, accès refusé
            return False

        # utilisation de la méthode de l'objet pour définir si
        # l'accès est autorisé. Tous les objets renvoyés par
        # l'API doivent donc exposer cette méthode.
        return obj.check_user_allowed(request)

    def check_entity_allowed(entity: str, request):
        """
        Fonction qui vérifie si la requête est autorisée à
        accéder à l'entité passée en paramètre.
        """
        if settings.DEBUG:
            # si l'app est en debug, on ne vérifie pas les autorisations
            return True  # temporaire pour faciliter les tests

        if "assos" not in request.session.keys():
            # l'utilisateur n'est pas connecté, accès refusé
            return False

        if entity not in request.session["assos"]:
            # l'entité ne fait pas partie de la liste des associations
            # de l'utilisateur, accès refusé
            return False

        return True
