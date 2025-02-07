from django.urls import path

from . import views

urlpatterns = [
    path('ajax/getjson', views.getjson, name='getjson'),
    path('ajax/getimage', views.getimage, name='getimage'),
    path('', views.index, name='index'),
]
