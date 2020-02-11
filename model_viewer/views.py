from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import urllib.request
import xmltodict


@csrf_exempt
def getjson(request):
    file = urllib.request.urlopen('https://location.servirglobal.net/hkhEnsemble_20190902-1800.xml')
    data = file.read()
    file.close()

    data = xmltodict.parse(data)
    return JsonResponse(json.dumps(data), safe=False)
