"""
Django settings for flairsou project.

Generated by 'django-admin startproject' using Django 3.2.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""
import os
from pathlib import Path
import sys
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

# import custom config file
from . import config
import environ


class bcolors:
    HEADER = "\033[95m"
    OKBLUE = "\033[94m"
    OKCYAN = "\033[96m"
    OKGREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"


env = environ.Env(
    BASE_URL=(str, "/"),
    FLAIRSOU_ENV=(str, "developpement"),
    FLAIRSOU_SENTRY_BACKEND_DSN=(
        str,
        "https://223d19c3afc242349e5932c1863a067d@o1296214.ingest.sentry.io/6522968",
    ),
    FLAIRSOU_SENTRY_FRONT_DSN=(
        str,
        "https://8187426c2af7419d95a640b957cbeb9d@o1296214.ingest.sentry.io/6522978",
    ),
)
environ.Env.read_env()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# load the secret key from the config file
SECRET_KEY = config.SECRET_KEY

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config.DEBUG

if DEBUG:
    print(
        bcolors.WARNING
        + bcolors.BOLD
        + "ATTENTION : le paramètre DEBUG est à True, ne pas laisser ce paramètre "
        + "en production !!",
        file=sys.stderr,
    )

# flag pour ouvrir l'API pour les tests (doit être à False en prod)
DEBUG_NO_PERMISSION_CHECKS = config.DEBUG_NO_PERMISSION_CHECKS

if DEBUG_NO_PERMISSION_CHECKS:
    print(
        bcolors.WARNING
        + bcolors.BOLD
        + "ATTENTION : le paramètre DEBUG_NO_PERMISSION_CHEKS est à True, les vérifications "
        + "d'autorisations dans l'API ne sont pas effectuées !!"
        + bcolors.ENDC,
        file=sys.stderr,
    )

ALLOWED_HOSTS = config.ALLOWED_HOSTS

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "flairsou_api.apps.FlairsouApiConfig",  # API app
    "flairsou_frontend",
    "softdelete",
    "django_extensions",
    "rest_framework",
    "drf_spectacular",
    "oauth_pda_app",
    "proxy_pda",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "flairsou.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [str(BASE_DIR.joinpath("mock_portail/templates"))],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "flairsou.wsgi.application"

# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = config.DATABASES

# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = config.TIME_ZONE

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = env("BASE_URL") + "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static/")

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

if not DEBUG:
    # Si la config n'est pas en debug (= en prod), on désactive l'interface web de l'API
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = (
        "rest_framework.renderers.JSONRenderer",
    )

SPECTACULAR_SETTINGS = {
    "TITLE": "Flairsou API",
    "DESCRIPTION": "Documentation de l'API "
    "de Flairsou, outil de gestion de trésorerie pour les associations",
    "VERSION": "0.0.1",
}

OAUTH_SETTINGS = config.OAUTH_SETTINGS
AUTH_USER_MODEL = "oauth_pda_app.User"

sentry_sdk.init(
    dsn=env("FLAIRSOU_SENTRY_BACKEND_DSN"),
    environment=env("FLAIRSOU_ENV"),
    integrations=[
        DjangoIntegration(),
    ],
    traces_sample_rate=1.0,
    send_default_pii=True,
)
