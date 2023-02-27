"""
WSGI config for hiwat project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/howto/deployment/wsgi/
"""

import os
import sys

sys.path.append('/home/bashmall/servir/webapps/mkg/hiwat_model_viewer/hiwat')

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hiwat.settings')

application = get_wsgi_application()
