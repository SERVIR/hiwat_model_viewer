from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests
import xmltodict


@csrf_exempt
def getjson(request):

    file = requests.get('https://location.servirglobal.net/hkhEnsemble_20190902-1800.xml', verify=False)
    return JsonResponse(json.dumps(xmltodict.parse(file.content)), safe=False)
