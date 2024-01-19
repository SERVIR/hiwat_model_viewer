from django.db import models
from django.template.defaultfilters import slugify
from django.contrib.auth.models import User
from django.urls import reverse


class DataPath(models.Model):
    title = models.CharField(max_length=255)
    directory = models.TextField(default='/mnt/hiwat/hkh/image_files')
    ensforecastprefix = models.CharField(
        default='hkhEnsemble_', max_length=255)
    detforecastprefix = models.CharField(default='hkhControl_', max_length=255)
    created_on = models.DateTimeField(auto_now_add=True)

    def get_data_directory(self):
        return reverse('data_directory', args=[self.directory])

    def save(self, *args, **kwargs):
        super(DataPath, self).save(*args, **kwargs)

    def __str__(self):
        return str(self.id) + "-" + self.title

    class Meta:
        ordering = ['created_on']

        def __unicode__(self):
            return self.title


class Domain(models.Model):
    title = models.CharField(max_length=255)
    abbreviation = models.CharField(max_length=255)

    def __str__(self):
        return self.title + "- (" + self.abbreviation + ")"
