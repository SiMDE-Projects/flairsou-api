#!/usr/bin/env bash

python manage.py makemigrations # Migrations générales
python manage.py makemigrations flairsou_api
python manage.py migrate
python manage.py test
