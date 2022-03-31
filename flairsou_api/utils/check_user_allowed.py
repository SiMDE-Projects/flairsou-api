from rest_framework.permissions import BasePermission

from django.conf import settings

from proxy_pda.models import Asso


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

        if entity in request.session["assos"]:
            # l'entité demandée fait partie des assos de l'utilisateur, l'accès
            # est autorisé
            return True

        currentAsso = Asso.objects.get(asso_id=entity)
        if (
            currentAsso.parent
            and currentAsso.parent_can_view
            and str(currentAsso.parent.asso_id) in request.session["assos"]
        ):
            # l'entité demandée a un parent
            # le parent peut accéder au compte de l'entité
            # l'utilisateur a les droits sur l'entité parente
            return True

        return False
