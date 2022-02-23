from rest_framework import serializers


class FlairsouModelSerializer(serializers.ModelSerializer):
    def is_update_request(self):
        return self.context["request"].method == "PUT"

    def is_create_request(self):
        return self.context["request"].method == "POST"

    def ValidationError(self, msg):
        return serializers.ValidationError(msg)
