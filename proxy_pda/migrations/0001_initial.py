# Generated by Django 3.2 on 2022-03-02 21:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Asso",
            fields=[
                (
                    "asso_id",
                    models.UUIDField(
                        primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                (
                    "shortname",
                    models.CharField(max_length=100, verbose_name="shortname"),
                ),
                ("name", models.CharField(max_length=100, verbose_name="name")),
                (
                    "asso_type",
                    models.IntegerField(
                        choices=[
                            (0, "Commission"),
                            (1, "Club"),
                            (2, "Project"),
                            (3, "Ass1901"),
                        ]
                    ),
                ),
                (
                    "parent_view_granted",
                    models.BooleanField(
                        default=False, verbose_name="Parent view granted"
                    ),
                ),
                (
                    "in_cemetery",
                    models.BooleanField(default=False, verbose_name="in_cemetery"),
                ),
                ("last_updated", models.DateTimeField()),
                (
                    "parent",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        to="proxy_pda.asso",
                    ),
                ),
            ],
        ),
    ]