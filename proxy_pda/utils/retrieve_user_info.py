from rest_framework import status
from rest_framework.exceptions import NotAuthenticated

import requests

from proxy_pda.serializers import UserInfoSerializer
from proxy_pda.utils.pda_request import pda_request

treso_role = {
    "president": "5e03dae0-3af5-11e9-a43d-b3a93bca68c7",
    "vice-president": "5e055850-3af5-11e9-8179-b960d37afa08",
    "tresorier": "5e0c2200-3af5-11e9-8230-e56a8ddde0e6",
    "vice-treso": "5e0e4050-3af5-11e9-ad2e-ef2b3dd03999",
}


def retrieve_user_info(request):
    """
    Fonction qui récupère les informations de l'utilisateur connecté
    """
    if "token" not in request.session.keys():
        # si il n'y a pas de token, on supprime les éventuelles
        # informations utilisateur mises en cache
        if "user" in request.session.keys():
            request.session.pop("user")

        raise NotAuthenticated()
    else:
        if "user" not in request.session.keys():
            # si l'utilisateur n'est pas en cache dans la session, on le
            # récupère depuis le PDA
            token = request.session["token"]
            response = requests.get(
                "https://assos.utc.fr/api/v1/user",
                headers={"Authorization": "Bearer {}".format(token["access_token"])},
            )
            user = UserInfoSerializer(response.json())
            request.session["user"] = user.data

        user = UserInfoSerializer(request.session["user"])
        resp_status = status.HTTP_200_OK

    return (user, resp_status)


def request_user_assos(request):
    """
    Récupère la liste des associations auxquelles l'utilisateur est
    inscrit depuis le portail des assos

    request: requête django
    """
    if "user" not in request.session.keys():
        # vérifie que l'utilisateur est connecté
        raise NotAuthenticated()

    # récupération de l'ID utilisateur
    user_id = request.session["user"]["id"]

    # récupération de l'ID utilisateur
    url = "https://assos.utc.fr/api/v1/users/{}/assos".format(user_id)

    # récupération des associations auxquelles l'utilisateur est
    # actuellement inscrit et pour lesquelles il a les droits de trésorerie
    response = pda_request(url, request.session["token"]["access_token"])

    request.session["assos"] = []

    for asso in response.json():
        if asso["pivot"]["validated_by_id"] is None:
            # on ignore si le rôle n'est pas validé
            continue

        userRole = asso["pivot"]["role_id"]

        # on considère uniquement les associations pour lesquelles
        # l'utilisateur a un rôle de trésorerie ou de présidence
        if userRole not in treso_role.values():
            continue

        request.session["assos"].append(asso["id"])

    request.session["assos"].append("6dff8940-3af5-11e9-a76b-d5944de919ff")

    return request.session["assos"]
