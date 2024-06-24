# Generated by Django 5.0.6 on 2024-06-24 12:03

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('markets', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='circular',
            name='store',
        ),
        migrations.AddField(
            model_name='circular',
            name='market',
            field=models.ForeignKey(default='01J14SMM1HNDHHAKG640ZRQ2PN', on_delete=django.db.models.deletion.CASCADE, to='markets.market'),
            preserve_default=False,
        ),
    ]
