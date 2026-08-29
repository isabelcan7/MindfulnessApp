from django.urls import path
from . import api

urlpatterns = [
    path('resumen/', api.admin_resumen, name='admin-resumen'),
    path('usuarios/', api.admin_usuarios, name='admin-usuarios'),
    path('usuarios/<int:pk>/', api.admin_usuario_detalle, name='admin-usuario-detalle'),
    path('investigadores/', api.admin_investigadores, name='admin-investigadores'),
    path('participantes/', api.admin_participantes, name='admin-participantes'),
    path('programas/', api.admin_programas, name='admin-programas'),
    path('inscripciones/', api.admin_inscripciones, name='admin-inscripciones'),
    path('exportar/', api.admin_exportar, name='admin-exportar'),
]
