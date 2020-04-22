import datetime
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
    forecasttype = request.GET.get('forecasttype')
    forecastprefix = None
    if forecasttype == "ens":
        forecastprefix = "hkhEnsemble_"
    elif forecasttype == "det":
        forecastprefix = "hkhControl_"
    baseLocation = "/mnt/hiwat/hkh/image_files"
    print(initdate)
    dirlist = [ name for name in os.listdir(baseLocation) if os.path.isdir(os.path.join(baseLocation, name)) ]
    if 'LOGS' in dirlist: 
        dirlist.remove('LOGS')
    if '2019050218_test' in dirlist: 
        dirlist.remove('2019050218_test')
    if '2019050618_test' in dirlist: 
        dirlist.remove('2019050618_test')
    if '2019050218_orig' in dirlist: 
        dirlist.remove('2019050218_orig')
    if 'orig_2019050218' in dirlist: 
        dirlist.remove('orig_2019050218')
    if 'test_2019050618' in dirlist: 
        dirlist.remove('test_2019050618')
    if 'tarballs' in dirlist: 
        dirlist.remove('tarballs')
    revSortedList = sorted(dirlist, reverse=True)
    revindex = 0
    latestdir = str(revSortedList[revindex])
    earliestdir = str(sorted(dirlist)[0])
    if initdate is None:
        initdir = latestdir
    else:
        initdir = initdate
    print("first: " + initdir)
    try:
        file = None
        while file is None:
            file = get_xml_file(os.path.join(baseLocation ,
                        initdir[:-2] + "18",
                        forecasttype,
                        forecastprefix + initdir[:-2] + '-1800.xml'))
            initdir = initdir[:-2] + "18"
            if file is None:
                os.path.join(baseLocation ,
                        initdir[:-2] + "12",
                        forecasttype,
                        forecastprefix + initdir[:-2] + '-1200.xml')
                initdir = initdir[:-2] + "12"
            if file is None:
                revindex = revindex - 1
                latestdir = str(revSortedList[revindex])
                initdir = latestdir

    except Exception:
        print("this should never happen")
    print("fourth: " + initdir)
    tempjson = json.loads(json.dumps(xmltodict.parse(file.read())))
    tempjson['config']['init'] = initdir
    tempjson['config']['earliest'] = earliestdir
    tempjson['config']['latest'] = latestdir
    return JsonResponse(json.dumps(tempjson), safe=False) 
def get_xml_file(path):
    if os.path.isfile(path):
        return open(path)
    else:
        return None
@csrf_exempt
def getimage(request):
    image_name = request.GET.get("imagename")
    baseLocation = "/mnt/hiwat/hkh/image_files/"
    try:
        image_data = open(baseLocation + image_name, "rb").read()
    except:
        return HttpResponse(status=204)
    response = HttpResponse(image_data, content_type="image/gif")
    current_time = datetime.datetime.utcnow()
    last_modified = current_time - datetime.timedelta(days=1)
    response['Last-Modified'] = last_modified.strftime('%a, %d %b %Y %H:%M:%S GMT')
    response['Expires'] = current_time + datetime.timedelta(days=30)
    response['Cache-Control'] = 'public, max-age=315360000'
    response['Date'] = current_time
    return response
