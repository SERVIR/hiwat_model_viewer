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
    initdate = request.GET.get('initdate')
    baseLocation = "/mnt/hiwat/hkh/image_files"
    if initdate is None:
        dirlist = [ name for name in os.listdir(baseLocation) if os.path.isdir(os.path.join(baseLocation, name)) ]
        if 'LOGS' in dirlist: 
            dirlist.remove('LOGS')
        latestdir = str(sorted(dirlist, reverse=True)[0])
    else:
        latestdir = initdate
    file = open(os.path.join(baseLocation ,
                        latestdir,
                        'ens',
                        'hkhEnsemble_' + latestdir[:-2] + '-1800.xml'))

    tempjson = json.loads(json.dumps(xmltodict.parse(file.read())))
    tempjson['config']['init'] = latestdir
    return JsonResponse(json.dumps(tempjson), safe=False) 

@csrf_exempt
def getimage(request):
    image_name = request.GET.get("imagename")
    baseLocation = "/mnt/hiwat/hkh/image_files/"
    try:
        image_data = open(baseLocation + image_name, "rb").read()
    except:
        return HttpResponse(status=204)
    return HttpResponse(image_data, content_type="image/gif")
