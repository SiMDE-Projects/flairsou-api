rm db.sqlite3
rm -rf flairsou_api/migrations
rm -rf flairsou_api/__pycache__
rm -rf proxy_pda/migrations
rm -rf proxy_pda/__pycache__
python manage.py makemigrations
python manage.py makemigrations flairsou_api
python manage.py makemigrations proxy_pda
python manage.py migrate
