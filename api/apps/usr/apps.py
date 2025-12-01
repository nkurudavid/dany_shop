from django.apps import AppConfig


class UsrConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.usr'

    def ready(self):
        import apps.usr.controller.signals