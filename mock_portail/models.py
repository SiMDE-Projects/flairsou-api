# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models
from rest_framework import serializers


class CustomUser(AbstractUser):
    entity1 = models.UUIDField("Entity 1", blank=True, null=True)
    entity2 = models.UUIDField("Entity 2", blank=True, null=True)
    entity3 = models.UUIDField("Entity 3", blank=True, null=True)
    entity4 = models.UUIDField("Entity 4", blank=True, null=True)
    entity5 = models.UUIDField("Entity 5", blank=True, null=True)

    def __str__(self):
        return self.username


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['entity1', 'entity2', 'entity3', 'entity4', 'entity5']
