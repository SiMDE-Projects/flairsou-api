# Configurations du serveur - template
# Ce fichier doit être copié sous le nom config.py dans le répertoire flairsou
# LE FICHIER config.py NE DOIT PAS ETRE COMMIT
from pathlib import Path

# répertoire de base, nécessaire pour la database par défaut
BASE_DIR = Path(__file__).resolve().parent.parent

# clé secrète - à remplacer
# on peut générer une clé avec la commande suivante (exécutée depuis la racine du projet)
# python manage.py shell -c 'from django.core.management import utils; print(utils.get_random_secret_key())'
SECRET_KEY = '<SECRET_KEY>'

# activation du debug ou non
DEBUG = True

# timezone
TIME_ZONE = 'UTC'

# database config
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

ALLOWED_HOSTS = []
