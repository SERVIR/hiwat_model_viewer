from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
import json
import requests
import xmltodict


@csrf_exempt
def getjson(request):
    baseLocation = "/home/bashmall/fake_mnt/hiwat/hkh/image_files"
    latestdir = str(sorted(os.listdir(baseLocation), reverse=True)[0])
    file = open(os.path.join(baseLocation ,
                        latestdir,
                        'ens',
                        'hkhEnsemble_' + latestdir[:-2] + '-1800.xml'))


    return JsonResponse(json.dumps(xmltodict.parse(file.read())), safe=False)