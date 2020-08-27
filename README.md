# HIWAT Model Viewer
This is a web UI used to display and animate output images created by a HIWAT Model run

## INSTALLATION

We recommend installing in an environment like virtualenv or conda, we have used virtualenv in this case
```bash
pip install -r requirements.txt
```

## SETUP
Edit hiwat_model_viewer/hiwat/settings.py

Enter the domain name you will be using for your application.  You may also want to remove localhost when you have the application fully configured.

ALLOWED_HOSTS = ['your_domain_name', 'localhost']

## Configure Apache 
Depending on your OS and Apache version you may have different paths, however the paths used here are specifically for CentOS

Create a new config file hmv.conf (you may name it as you wish as long as you include the .conf file extension) in the conf.d directory located 

```bash
sudo touch /etc/httpd/conf.d/hmv.conf
```

Edit the configuration below replacing "yourdomain" in all locations with the domain you will be pointing at the application

```
# hmv.conf

<VirtualHost *:80>
    ServerAdmin webmaster@yourdomain
    ServerName yourdomain
    ServerAlias www.yourdomain
    Header set Access-Control-Allow-Origin "http://localhost:3000"
    Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"

    RewriteEngine on
    RewriteCond %{SERVER_NAME} =www.yourdomain [OR]
    RewriteCond %{SERVER_NAME} =yourdomain
    RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,QSA,R=permanent]

    WSGIPassAuthorization On
    WSGIApplicationGroup %{GLOBAL}

</VirtualHost>
```

Create a second new config file hmv-ssl.conf (you may name it as you wish as long as you include the .conf file extension) in the conf.d directory located 

```bash
sudo touch /etc/httpd/conf.d/hmv-ssl.conf
```

Edit the configuration below replacing as directed in the file

```
# hmv-ssl.config

<VirtualHost *:443>
	ServerName yourdomain
	ServerAlias www.yourdomain

	Header set Access-Control-Allow-Origin "http://localhost:3000"
	Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept"
	Header set Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"

	WSGIScriptAlias / Fullpath_To_Code/hiwat_model_viewer/hiwat/wsgi.py
	WSGIDaemonProcess hiwatviewer python-path=Full_Path_T_Your_Virtual_Env/.virtualenvs/hmv/lib/python3.6/site-packages:Full_Path_To_Code/hiwat_model_viewer/ processes=1 threads=25

	<Directory Fullpath_To_Code/hiwat_model_viewer/hiwat>
		WSGIProcessGroup hiwatviewer
		WSGIApplicationGroup %{GLOBAL}
		<Files wsgi.py>
			Require all granted
		</Files>
	</Directory> 

	<Directory Fullpath_To_Code/hiwat_model_viewer/staticfiles>
		Require all granted
	</Directory>

	<Directory Fullpath_To_Code/hiwat_model_viewer/media>
		Require all granted
	</Directory>

	<Directory /var/log/httpd>
		Require all granted
	</Directory>


	Alias /media/ Fullpath_To_Code/hiwat_model_viewer/media/
	Alias /static/ Fullpath_To_Code/hiwat_model_viewer/staticfiles/
 

	SSLEngine on
	SSLCertificateFile Fullpath_To_SSLCertificate.crt
	SSLCertificateKeyFile Fullpath_To_rsaopen.key
	SSLCACertificateFile Fullpath_To_CA_Certificte.crt

</VirtualHost>

```

## Give Apache ownership and proper permissions.  

In our case Apache is the user, in others the user is www-data, this is depending on the OS and version of Apache.  You will need to set the owner to the proper user.
```
sudo chmod 775 Fullpath_To_Code/hiwat_model_viewer -R
sudo chown apache:apache Fullpath_To_Code/hiwat_model_viewer -R

```

## Create super user

Navigate to the code directory then create the super user to login to the admin interface

```
cd Fullpath_To_Code/hiwat_model_viewer
python manage.py createsuperuser

```
Follow the prompts to create the user.  

## Restart your server
```
sudo systemctl restart httpd
```

# Test your application

Navigate to the domain that you configured in your Apache .conf file.  You should see the application, however likely the default settings will not point to your data.  Navigate to /admin/ then login with the super user account that you just created.  Under the section MODEL_VIEWER, click Data paths, then click DataPath object(1).  Update the variables here to set the Title, directory that the image structure is located at, Ensforecastprefix, and Detforecastprefix.  Click SAVE.  Navigate back to the home page at your domain and you will see the application with the data that you pointed to.  Make sure that the data directory has proper permissions to access the images and xml document.

