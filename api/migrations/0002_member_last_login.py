from django.db import migrations, models
import django.utils.timezone

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='last_login',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]