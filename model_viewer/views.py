import datetime
import json
import logging
import os
from datetime import timedelta

import xmltodict
from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import DataPath

logger = logging.getLogger(__name__)


def format_date_string(date_time_obj):
    return date_time_obj.strftime('%Y%m%d')


def format_directory_to_date(directory_string):
    return datetime.datetime.strptime(directory_string[:-2], '%Y%m%d')


def get_directory_listing(base_location):
    excluded_directories = ['LOGS', '2019050218_test', '2019050618_test', '2019050218_orig',
                            'orig_2019050218', 'test_2019050618', 'tarballs']

    dir_list = [name for name in os.listdir(base_location) if os.path.isdir(os.path.join(base_location, name))]

    # Remove excluded directories
    dir_list = [dir_name for dir_name in dir_list if dir_name not in excluded_directories]

    return dir_list
    # dir_list = [name for name in os.listdir(
    #     base_location) if os.path.isdir(os.path.join(base_location, name))]
    #
    # # This is used to remove known bad directories
    # if 'LOGS' in dir_list:
    #     dir_list.remove('LOGS')
    # if '2019050218_test' in dir_list:
    #     dir_list.remove('2019050218_test')
    # if '2019050618_test' in dir_list:
    #     dir_list.remove('2019050618_test')
    # if '2019050218_orig' in dir_list:
    #     dir_list.remove('2019050218_orig')
    # if 'orig_2019050218' in dir_list:
    #     dir_list.remove('orig_2019050218')
    # if 'test_2019050618' in dir_list:
    #     dir_list.remove('test_2019050618')
    # if 'tarballs' in dir_list:
    #     dir_list.remove('tarballs')
    # return dir_list


def index(request, template_name="model_viewer/index.html"):
    # Config variables needed in javascript
    config = DataPath.objects.first()
    ens_forecast_prefix = config.ensforecastprefix
    det_forecast_prefix = config.detforecastprefix

    base_location = config.directory
    dir_list = sorted(get_directory_listing(base_location))

    # here get directory list identify any missing days between first and last
    # so we can send to the client in order to remove those date options

    d = list(map(format_directory_to_date, dir_list))
    date_set = set(d[0] + timedelta(x) for x in range((d[-1] - d[0]).days))
    missing = sorted(date_set - set(d))

    disabled_dates = list(map(format_date_string, missing))
    print(disabled_dates)

    return render(request, template_name, context={
        'ensforecastprefix': ens_forecast_prefix,
        'detforecastprefix': det_forecast_prefix,
        'disableddates': ','.join(disabled_dates)
    })


@csrf_exempt
def getjson(request):
    init_date = request.GET.get('initdate')
    forecast_type = request.GET.get('forecasttype')
    forecast_prefix = None
    config = DataPath.objects.first()
    if forecast_type == "ens":
        forecast_prefix = config.ensforecastprefix  # "mkgEnsemble_"
    elif forecast_type == "det":
        forecast_prefix = config.detforecastprefix  # "mkgControl_"

    base_location = config.directory  # "/mnt/hiwat/mkg/image_files"
    print("baseLocation: " + os.path.join(base_location, ''))
    print(init_date)
    dir_list = get_directory_listing(base_location)
    rev_sorted_list = sorted(dir_list, reverse=True)
    rev_index = 0
    latest_dir = str(rev_sorted_list[rev_index])
    earliest_dir = str(sorted(dir_list)[0])
    if init_date is None:
        init_dir = latest_dir
    else:
        init_dir = init_date
    print("first: " + init_dir)
    file = None
    try:
        while file is None:
            print("looking for: " + os.path.join(base_location,
                                                 init_dir[:-2] + "18",
                                                 forecast_type,
                                                 forecast_prefix + init_dir[:-2] + '-1800.xml'))
            file = get_xml_file(os.path.join(base_location,
                                             init_dir[:-2] + "18",
                                             forecast_type,
                                             forecast_prefix + init_dir[:-2] + '-1800.xml'))
            init_dir = init_dir[:-2] + "18"
            if file is None:
                print("Looking for: " + os.path.join(base_location,
                                                     init_dir[:-2] + "12",
                                                     forecast_type,
                                                     forecast_prefix + init_dir[:-2] + '-1200.xml'))
                file = get_xml_file(os.path.join(base_location,
                                                 init_dir[:-2] + "12",
                                                 forecast_type,
                                                 forecast_prefix + init_dir[:-2] + '-1200.xml'))
                init_dir = init_dir[:-2] + "12"
            if file is None:
                print("Looking for: " + os.path.join(base_location,
                                                     init_dir[:-2] + "06",
                                                     forecast_type,
                                                     forecast_prefix + init_dir[:-2] + '-0600.xml'))
                file = get_xml_file(os.path.join(base_location,
                                                 init_dir[:-2] + "06",
                                                 forecast_type,
                                                 forecast_prefix + init_dir[:-2] + '-0600.xml'))
                init_dir = init_dir[:-2] + "06"
            if file is None:
                rev_index = rev_index - 1
                latest_dir = str(rev_sorted_list[rev_index])
                init_dir = latest_dir

    except Exception:
        print("this should never happen")
    print("fourth: " + init_dir)
    tempjson = json.loads(json.dumps(xmltodict.parse(file.read())))
    tempjson['config']['init'] = init_dir
    tempjson['config']['earliest'] = earliest_dir
    tempjson['config']['latest'] = latest_dir
    return JsonResponse(json.dumps(tempjson), safe=False)


def get_xml_file(path):
    if os.path.isfile(path):
        return open(path)
    else:
        return None


@csrf_exempt
def getimage(request):
    image_name = request.GET.get("imagename")
    config = DataPath.objects.first()
    base_location = config.directory + "/"  # "/mnt/hiwat/mkg/image_files/"  #
    try:
        image_data = open(base_location + image_name, "rb").read()
    except:
        # image missing (shouldn't happen due to the disabled_dates search above, but just in case)
        return HttpResponse(status=204)
    response = HttpResponse(image_data, content_type="image/gif")
    current_time = datetime.datetime.utcnow()
    last_modified = current_time - datetime.timedelta(days=1)
    response['Last-Modified'] = last_modified.strftime(
        '%a, %d %b %Y %H:%M:%S GMT')
    response['Expires'] = current_time + datetime.timedelta(days=30)
    response['Cache-Control'] = 'public, max-age=315360000'
    response['Date'] = current_time
    return response
