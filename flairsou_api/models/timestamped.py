from django.db import models
from softdelete.models import SoftDeleteObject


class TimeStampedModel(SoftDeleteObject, models.Model):
    """
    An abstract base class model that provides self-updating
    ``created_at`` and ``updated_at`` fields.
    """

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def hard_delete(self, *args, **kwargs):
        super(SoftDeleteObject, self).delete(*args, **kwargs)
