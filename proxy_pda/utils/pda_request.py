import requests


def pda_request(url, token):
    """
    Envoie une requête au portail des assos en intégrant le token de
    connexion
    """
    return requests.get(
        url,
        headers={
            'Authorization': 'Bearer {}'.format(token),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    )
