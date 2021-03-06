﻿from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import TemplateView
from django.conf.urls import url

from . import views

urlpatterns = [
    path('ajax/getjson', views.getjson, name='getjson'),
    path('ajax/getimage', views.getimage, name='getimage'),
    url('', views.index, name='index'),
    # url('', TemplateView.as_view(template_name="model_viewer/index.html"), name='index'),
]
