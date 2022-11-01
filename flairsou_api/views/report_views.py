from rest_framework import mixins
from rest_framework import generics

import flairsou_api.models as fm
import flairsou_api.serializers as fs

from flairsou_api.utils import UserAllowed


class BalanceSheetView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    queryset = fm.Book.objects.all()
    serializer_class = fs.BalanceSheetSerializer
    permission_classes = [UserAllowed]

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)
