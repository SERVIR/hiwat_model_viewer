# HIWAT Model Viewer
This is a web UI used to display and animate output images created by a HIWAT Model run

[![Django: 4.x](https://img.shields.io/badge/Django-4.x-blue)](https://www.djangoproject.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![SERVIR: Global](https://img.shields.io/badge/SERVIR-Global-green)](https://servirglobal.net)

## Setup and Installation
The installation described here will make use of conda to ensure there are no package conflicts with
existing or future applications on the machine.  It is highly recommended using a dedicated environment
for this application to avoid any issues.

### Recommended
Conda (To manage packages within the applications own environment)

### Environment
- Create the env

```commandline
conda env create -f environment.yml
```

Add a file named data.json in the base directory.  This file will hold a json object containing
ALLOWED_HOSTS, LOG_PATH, and SECRET_KEY.  The format will be:

```json
{
  "ALLOWED_HOSTS": ["localhost", "your_domain.com", "127.0.0.1"],
  "LOG_PATH": "path_to_where_you_want_logs_written",
  "SECRET_KEY": "REPLACE WITH A SECRET KEY USING LETTERS, NUMBERS, AND SPECIAL CHARACTERS"
}
```

- enter the environment

```shell
conda activate hmv
```

- Create database tables and superuser
###### follow prompts to create superuser
```commandline
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic
```

At this point you should be able to start the application.  From the root directory you can run the following command

```
python manage.py runserver
```

Of course running the application in this manner is only for development.  We recommend installing
this application on a server and serving it through nginx using gunicorn (conda install gunicorn) for production.  To do this you will need to
have both installed on your server.  There are enough resources explaining in depth how to install them,
so we will avoid duplicating this information.  We recommend adding a service to start the application
by creating a .service file located at /etc/systemd/system.  We named ours hmv.service
The service file will contain the following, please substitute the correct paths as mentioned below.

# Server installation
## Create Application Service
As mentioned above create the following file at /etc/systemd/system/ and name it hmv.service
```editorconfig
[Unit]
Description=hmv daemon
After=network.target

[Service]
User=nginx
Group=nginx
SocketUser=nginx
WorkingDirectory={REPLACE WITH PATH TO APPLICATION ROOT}/hiwat
accesslog = "/var/log/hmv/hmv_gunicorn.log"
errorlog = "/var/log/hmv/hmv_gunicornerror.log"
ExecStart={REPLACE WITH FULL PATH TO gunicorn IN YOUR CONDA ENV}/bin/gunicorn --timeout 60 --workers 5 --pythonpath '{REPLACE WITH PATH TO APPLICATION ROOT},{REPLACE WITH FULL PATH TO YOUR CONDA ENV}/lib/python3.10/site-packages' --bind unix:{REPLACE WITH LOCATION YOU WANT THE SOCK}/hmv_prod.sock wsgi:application

[Install]
WantedBy=multi-user.target

```

## Create nginx site
Create a file in /etc/nginx/conf.d/ named hmv_prod.conf

```editorconfig
upstream hmv_prod {
  server unix:{REPLACE WITH LOCATION YOU WANT THE SOCK}/hmv_prod.sock 
  fail_timeout=0;
}

server {
    listen 443;
    server_name {REPLACE WITH YOUR DOMAIN};
    add_header Access-Control-Allow-Origin *;

    ssl on;
    ssl_certificate {REPLACE WITH FULL PATH TO CERT FILE};
    ssl_certificate_key {REPLACE WITH FULL PATH TO CERT KEY};

    # Some Settings that worked along the way
    client_max_body_size 8000M;
    client_body_buffer_size 8000M;
    client_body_timeout 120;

    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    fastcgi_buffers 8 16k;
    fastcgi_buffer_size 32k;
    fastcgi_connect_timeout 90s;
    fastcgi_send_timeout 90s;
    fastcgi_read_timeout 90s;


    location = /favicon.ico { access_log off; log_not_found off; }
    location /static/ {
        autoindex on;
        alias {REPLACE WITH FULL PATH TO APPS}/staticfiles/;
    }

    location / {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://unix:{REPLACE WITH LOCATION YOU WANT THE SOCK}/hmv_prod.sock ;
    }


}

# Reroute any non https traffic to https
server {
    listen 80;
    server_name {REPLACE WITH YOUR DOMAIN};
    rewrite ^(.*) https://$server_name$1 permanent;
}

```

# Create Alias commands to make starting the application simple
Create a file at /etc/profile.d/ named hmv_alias.sh and add the following:
```commandline
# Global Alias
alias d='conda deactivate'
alias so='sudo chown -R www-data /servir_apps'
alias nsr='sudo service nginx restart'
alias nss='sudo service nginx stop'


# SAMS Alias
alias hmv='cd /servir_apps/hiwat_model_viewer'
alias acthmv='conda activate hmv'
alias uohmv='sudo chown -R ${USER} /servir_apps/hiwat_model_viewer'
alias sohmv='sudo chown -R www-data /servir_apps/hiwat_model_viewer'
alias hmvstart='sudo service hmv restart; sudo service nginx restart; so'
alias hmvstop='sudo service hmv stop'
alias hmvrestart='hmvstop; hmvstart'

```
Now activate the alias file by running
```commandline
source /etc/profile.d/hmv_alias.sh
```

Now you should be able to run hmvstart to run the production application.

## Contact

### Authors

- [Billy Ashmall (NASA)](mailto:billy.ashmall@nasa.gov)

## License and Distribution

Hiwat Model Viewer is distributed by SERVIR under the terms of the MIT License. See
[LICENSE](https://github.com/SERVIR/SAMS/blob/master/LICENSE) in this directory for more information.

## Privacy & Terms of Use

Hiwat Model Viewer abides to all of SERVIR's privacy and terms of use as described
at [https://servirglobal.net/Privacy-Terms-of-Use](https://servirglobal.net/Privacy-Terms-of-Use).
