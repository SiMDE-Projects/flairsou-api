from django.db import models

# Create your models here.


class Entity(models.Model):
    name = models.CharField("Entity name", max_length=64, primary_key=True)
    use_equity = models.BooleanField("Use Equity Accounts", default=False)
    parent = models.ForeignKey('self',
                               on_delete=models.PROTECT,
                               blank=True,
                               null=True)
