# Generated by Django 4.1.7 on 2024-01-19 20:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('model_viewer', '0004_domain'),
    ]

    operations = [
        migrations.AddField(
            model_name='domain',
            name='abbreviation',
            field=models.CharField(default='', max_length=255),
            preserve_default=False,
        ),
    ]