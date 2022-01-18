from django.utils import timezone
import datetime


def date_to_timezone(date: str):
    return timezone.make_aware(
        datetime.datetime.strptime(date, '%Y-%m-%d %H:%M:%S'))
