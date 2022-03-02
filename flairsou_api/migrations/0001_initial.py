# Generated by Django 3.2 on 2022-03-02 21:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, default=None, editable=False, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=64, verbose_name='Account name')),
                ('account_type', models.IntegerField(choices=[(0, 'Asset'), (1, 'Liability'), (2, 'Income'), (3, 'Expense'), (4, 'Equity')])),
                ('virtual', models.BooleanField(default=False, verbose_name='virtual')),
                ('associated_entity', models.UUIDField(default=None, null=True, verbose_name='associated_entity')),
            ],
        ),
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, default=None, editable=False, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=64, verbose_name='Book name')),
                ('entity', models.UUIDField(verbose_name='Entity')),
                ('use_equity', models.BooleanField(default=False, verbose_name='Use Equity Accounts')),
            ],
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, default=None, editable=False, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('date', models.DateField(verbose_name='Date')),
                ('checked', models.BooleanField(default=False, verbose_name='Checked')),
                ('invoice', models.FileField(null=True, upload_to='uploads/', verbose_name='Invoice')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Reconciliation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, default=None, editable=False, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('date', models.DateField(verbose_name='Date')),
                ('balance', models.IntegerField(verbose_name='solde')),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='flairsou_api.account')),
            ],
        ),
        migrations.CreateModel(
            name='Operation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, default=None, editable=False, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('credit', models.PositiveIntegerField(verbose_name='Credit')),
                ('debit', models.PositiveIntegerField(verbose_name='Debit')),
                ('label', models.CharField(max_length=128, null=True, verbose_name='Operation label')),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='flairsou_api.account')),
                ('transaction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='flairsou_api.transaction')),
            ],
        ),
        migrations.CreateModel(
            name='Entity',
            fields=[
                ('deleted_at', models.DateTimeField(blank=True, db_index=True, default=None, editable=False, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('uuid', models.UUIDField(editable=False, primary_key=True, serialize=False, verbose_name='uuid')),
                ('name', models.CharField(max_length=64, verbose_name='Entity name')),
                ('use_equity', models.BooleanField(default=False, verbose_name='Use Equity Accounts')),
                ('parent', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='flairsou_api.entity')),
            ],
        ),
        migrations.AddConstraint(
            model_name='book',
            constraint=models.UniqueConstraint(fields=('entity',), name='flairsou_api_book_one_book_per_entity'),
        ),
        migrations.AddField(
            model_name='account',
            name='book',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='flairsou_api.book'),
        ),
        migrations.AddField(
            model_name='account',
            name='parent',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='flairsou_api.account'),
        ),
        migrations.AddConstraint(
            model_name='reconciliation',
            constraint=models.UniqueConstraint(fields=('account', 'date'), name='flairsou_api_reconciliation_one_reconc_per_date'),
        ),
        migrations.AddConstraint(
            model_name='operation',
            constraint=models.UniqueConstraint(fields=('account', 'transaction'), name='flairsou_api_operation_unique_account_transaction'),
        ),
        migrations.AddConstraint(
            model_name='operation',
            constraint=models.CheckConstraint(check=models.Q(models.Q(('credit', 0), ('debit__gt', 0)), models.Q(('credit__gt', 0), ('debit', 0)), _connector='OR'), name='flairsou_api_operation_debit_xor_credit'),
        ),
        migrations.AddConstraint(
            model_name='entity',
            constraint=models.UniqueConstraint(fields=('name',), name='flairsou_api_entity_unique_name'),
        ),
        migrations.AddConstraint(
            model_name='entity',
            constraint=models.CheckConstraint(check=models.Q(_negated=True, name=''), name='flairsou_api_entity_name_not_null'),
        ),
        migrations.AddConstraint(
            model_name='account',
            constraint=models.UniqueConstraint(fields=('name', 'parent', 'book'), name='flairsou_api_account_unique_name_in_parent_and_book'),
        ),
        migrations.AddConstraint(
            model_name='account',
            constraint=models.CheckConstraint(check=models.Q(_negated=True, name=''), name='flairsou_api_account_name_not_null'),
        ),
    ]
