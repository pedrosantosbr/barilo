# Generated by Django 5.0.7 on 2024-07-13 10:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('circulars', '0002_alter_circularproduct_product'),
        ('markets', '0004_remove_product_market'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Product',
        ),
    ]
