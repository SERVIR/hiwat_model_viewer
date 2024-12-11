import datetime
import json
import logging
import os
import re
from datetime import timedelta

import xmltodict
from django.conf import settings
from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import *

logger = logging.getLogger(__name__)


def format_date_string(date_time_obj):
    return date_time_obj.strftime('%Y%m%d')


def format_directory_to_date(directory_string):
    return datetime.datetime.strptime(directory_string[:-2], '%Y%m%d')


def is_valid_date_directory(directory, base):
    # Check if the directory follows the YYYYMMDD pattern
    date_pattern = re.compile(r'\d{4}\d{2}\d{2}\d{2}$')
    match = date_pattern.match(directory)

    if not match:
        return False

    # Check if the directory contains a subdirectory named 'ens' that is not empty
    ens_directory = os.path.join(base, directory, 'ens')
    return os.path.isdir(ens_directory) and os.listdir(ens_directory)


def get_directory_listing(base_location):
    # excluded_directories = ['LOGS', '2019050218_test', '2019050618_test', '2019050218_orig',
    #                         'orig_2019050218', 'test_2019050618', 'tarballs']

    dir_list = [name for name in os.listdir(base_location) if os.path.isdir(os.path.join(base_location, name))]

    # Remove excluded directories
    # dir_list = [dir_name for dir_name in dir_list if dir_name not in excluded_directories]
    dir_list = [dir_name for dir_name in dir_list if is_valid_date_directory(dir_name, base_location)]

    return dir_list


def get_config_value():
    # Construct the path to the data.json file
    config_file_path = os.path.join(settings.BASE_DIR, 'data.json')

    try:
        # Open and read the JSON file
        with open(config_file_path, 'r') as config_file:
            config_data = json.load(config_file)

        # Check if 'analytics_key' exists
        if 'analytics_key' in config_data:
            return config_data['analytics_key']
        else:
            print("The key 'analytics_key' does not exist in the configuration.")
            return None
    except FileNotFoundError:
        print(f"Configuration file not found at: {config_file_path}")
        return None
    except json.JSONDecodeError:
        print(f"Error decoding JSON in the configuration file: {config_file_path}")
        return None


def index(request, template_name="model_viewer/index.html"):
    # Config variables needed in javascript
    config = DataPath.objects.first()
    ens_forecast_prefix = config.ensforecastprefix
    det_forecast_prefix = config.detforecastprefix

    base_location = config.directory
    dir_list = sorted(get_directory_listing(base_location))

    domains = Domain.objects.all()

    # here get directory list identify any missing days between first and last
    # so we can send to the client in order to remove those date options

    d = list(map(format_directory_to_date, dir_list))
    date_set = set(d[0] + timedelta(x) for x in range((d[-1] - d[0]).days))
    missing = sorted(date_set - set(d))

    disabled_dates = list(map(format_date_string, missing))
    analytics_key = get_config_value()

    if not domains.exists():
       return render(request, template_name, context={
           'ensforecastprefix': ens_forecast_prefix,
           'detforecastprefix': det_forecast_prefix,
           'disableddates': ','.join(disabled_dates),
           'analytics_key': analytics_key,
       })
    else:
       return render(request, template_name, context={
           'domains': json.dumps(list(domains.values())),
           'ensforecastprefix': ens_forecast_prefix,
           'detforecastprefix': det_forecast_prefix,
           'disableddates': ','.join(disabled_dates),
           'analytics_key': analytics_key,
       })


@csrf_exempt
def getjson(request):
    init_date = request.GET.get('initdate')
    forecast_type = request.GET.get('forecasttype')
    forecast_prefix = None
    config = DataPath.objects.first()
    forecast_prefix = config.ensforecastprefix if forecast_type == "ens" else config.detforecastprefix

    base_location = config.directory
    print("baseLocation: " + os.path.join(base_location, ''))
    print(init_date)
    dir_list = get_directory_listing(base_location)
    rev_sorted_list = sorted(dir_list, reverse=True)
    rev_index = 0
    latest_dir = str(rev_sorted_list[rev_index])
    earliest_dir = str(sorted(dir_list)[0])
    init_dir = init_date or latest_dir
    print("first: " + init_dir)
    file = None
    try:

        def get_file_and_init_dir(_init_dir, post_fix_time, postfix):
            return get_xml_file(os.path.join(base_location,
                                             _init_dir[:-2] + post_fix_time,
                                             forecast_type,
                                             forecast_prefix + init_dir[:-2] + postfix)), init_dir[
                                                                                          :-2] + post_fix_time

        file, init_dir = get_file_and_init_dir(init_dir, "18",'-1800.xml')

        if file is None:
            file, init_dir = get_file_and_init_dir(init_dir, "12", '-1200.xml')

        if file is None:
            file, init_dir = get_file_and_init_dir(init_dir, "06", '-0600.xml')

        if file is None:
            file, init_dir = get_file_and_init_dir(init_dir, "00", '-0000.xml')

        if file is None:
            rev_index = rev_index - 1
            latest_dir = str(rev_sorted_list[rev_index])
            init_dir = latest_dir

    except Exception:
        print("this should never happen")
    print("fourth: " + init_dir)
    temp_json = json.loads(json.dumps(xmltodict.parse(file.read()))) if file is not None else {}
    temp_json['config']['init'] = init_dir
    temp_json['config']['earliest'] = earliest_dir
    temp_json['config']['latest'] = latest_dir
    return JsonResponse(json.dumps(temp_json), safe=False)


def get_xml_file(path):
    if os.path.isfile(path):
        return open(path)
    else:
        return None


@csrf_exempt
def getimage(request):
    image_name = request.GET.get("imagename")
    config = DataPath.objects.first()
    base_location = config.directory
    try:
        image_data = open(os.path.join(base_location, image_name), "rb").read()
    except FileNotFoundError:
        # image missing (shouldn't happen due to the disabled_dates search above, but just in case)
        # image_data = open(os.path.join(base_location, "missing_image.png"), "rb").read()
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
