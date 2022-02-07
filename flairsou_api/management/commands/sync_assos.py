from django.core.management.base import BaseCommand

from proxy_pda.utils.sync_assos import sync_assos


class Command(BaseCommand):
    """
    Classe Command appelée par manage.py
    """
    help = 'Charge la liste des associations depuis le portail des assos'

    def handle(self, *args, **options):
        """
        Fonction principale appelée par la commande
        """
        sync_assos()
