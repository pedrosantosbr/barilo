# Generated by Django 5.0.7 on 2024-07-16 16:12

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comparisons', '0001_initial'),
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductBucket',
            fields=[
                ('id', models.CharField(editable=False, max_length=26, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=500)),
            ],
        ),
        migrations.CreateModel(
            name='ProductBucketItem',
            fields=[
                ('id', models.CharField(editable=False, max_length=26, primary_key=True, serialize=False)),
                ('bucket', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='comparisons.productbucket')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='products.product')),
            ],
        ),
        migrations.DeleteModel(
            name='ProductIndex',
        ),
    ]