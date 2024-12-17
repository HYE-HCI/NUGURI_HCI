# Generated by Django 5.1.2 on 2024-11-01 06:23

from django.db import migrations, models

### Dohoon
class Migration(migrations.Migration):

    dependencies = [
        ('app_NUGURI', '0002_remove_product_description_url_product_description'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='image_url',
        ),
        migrations.AddField(
            model_name='product',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='products/'),
        ),
        migrations.AlterField(
            model_name='product',
            name='description',
            field=models.TextField(),
        ),
    ]
