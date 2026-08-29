import csv
from io import StringIO

from django.db.models import Count, Max, Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from config.enums import EstadoInscripcion, EstadoPublicacion
from programa.models import InscripcionPrograma, Programa
from sesion.models import DiarioSesion
from usuario.models import Investigador, Participante, Usuario
from usuario.permissions import IsAdmin

from .comun import edad_de


def _fecha(valor):
    return valor.strftime('%Y-%m-%d %H:%M') if valor else ''


def _tabla_usuarios():
    cabeceras = [
        'id', 'nombre', 'apellidos', 'username', 'email', 'rol', 'ubicacion',
        'ocupacion', 'nivel_educativo', 'tiene_perfil', 'activo', 'fecha_registro',
        'ultimo_acceso',
    ]
    filas = []
    usuarios = Usuario.objects.select_related(
        'perfil_investigador', 'perfil_participante'
    ).order_by('-date_joined')

    for usuario in usuarios:
        tiene_perfil = bool(
            getattr(usuario, 'perfil_investigador', None)
            or getattr(usuario, 'perfil_participante', None)
        )
        filas.append([
            usuario.id,
            usuario.nombre,
            usuario.apellidos,
            usuario.username,
            usuario.email,
            usuario.get_role_display(),
            usuario.ubicacion,
            usuario.ocupacion,
            usuario.get_nivel_educativo_display(),
            'sí' if tiene_perfil else 'no',
            'sí' if usuario.is_active else 'no',
            _fecha(usuario.date_joined),
            _fecha(usuario.last_login),
        ])
    return cabeceras, filas


def _tabla_investigadores():
    cabeceras = [
        'id', 'nombre_completo', 'email', 'experiencia_investigacion', 'areas_interes',
        'total_programas', 'programas_publicados', 'total_inscritos',
        'fecha_registro', 'ultima_publicacion',
    ]
    filas = []
    investigadores = (
        Investigador.objects.select_related('usuario')
        .annotate(
            total_programas=Count('programas', distinct=True),
            programas_publicados=Count(
                'programas',
                filter=Q(programas__estado_publicacion=EstadoPublicacion.PUBLICADO),
                distinct=True,
            ),
            total_inscritos=Count('programas__inscripciones', distinct=True),
            ultima_publicacion=Max('programas__fecha_publicacion'),
        )
        .order_by('usuario__apellidos')
    )

    for investigador in investigadores:
        filas.append([
            investigador.id,
            investigador.usuario.nombre_completo,
            investigador.usuario.email,
            investigador.get_experiencia_investigacion_display(),
            ', '.join(investigador.areasInteres or []),
            investigador.total_programas,
            investigador.programas_publicados,
            investigador.total_inscritos,
            _fecha(investigador.usuario.date_joined),
            _fecha(investigador.ultima_publicacion),
        ])
    return cabeceras, filas


def _tabla_participantes():
    cabeceras = [
        'id_anonimo', 'nombre_completo', 'email', 'edad', 'genero', 'ubicacion',
        'nivel_educativo', 'experiencia_mindfulness', 'total_inscripciones',
        'en_progreso', 'completadas', 'abandonadas', 'sesiones_completadas',
        'cuestionarios_respondidos', 'fecha_registro', 'ultima_sesion',
    ]
    filas = []
    participantes = (
        Participante.objects.select_related('usuario')
        .annotate(
            total_inscripciones=Count('inscripciones', distinct=True),
            en_progreso=Count(
                'inscripciones',
                filter=Q(inscripciones__estado_inscripcion=EstadoInscripcion.EN_PROGRESO),
                distinct=True,
            ),
            completadas=Count(
                'inscripciones',
                filter=Q(inscripciones__estado_inscripcion=EstadoInscripcion.COMPLETADO),
                distinct=True,
            ),
            abandonadas=Count(
                'inscripciones',
                filter=Q(inscripciones__estado_inscripcion=EstadoInscripcion.ABANDONADO),
                distinct=True,
            ),
            sesiones_completadas=Count('diarios', distinct=True),
            cuestionarios_respondidos=Count('respuestas_cuestionario', distinct=True),
            ultima_sesion=Max('diarios__fecha_creacion'),
        )
        .order_by('usuario__apellidos')
    )

    for participante in participantes:
        usuario = participante.usuario
        filas.append([
            f'P{participante.id}',
            usuario.nombre_completo,
            usuario.email,
            edad_de(usuario.fechaNacimiento) or '',
            usuario.get_genero_display(),
            usuario.ubicacion,
            usuario.get_nivel_educativo_display(),
            participante.get_experiencia_mindfulness_display(),
            participante.total_inscripciones,
            participante.en_progreso,
            participante.completadas,
            participante.abandonadas,
            participante.sesiones_completadas,
            participante.cuestionarios_respondidos,
            _fecha(usuario.date_joined),
            _fecha(participante.ultima_sesion),
        ])
    return cabeceras, filas


def _tabla_programas():
    cabeceras = [
        'id', 'nombre', 'investigador', 'email_investigador', 'estado', 'tipo_contexto',
        'enfoque_metodologico', 'duracion_semanas', 'sesiones_creadas', 'inscritos',
        'en_progreso', 'completados', 'abandonados', 'diarios', 'fecha_creacion',
        'fecha_publicacion',
    ]
    filas = []
    programas = (
        Programa.objects.select_related('creado_por__usuario')
        .annotate(
            total_sesiones=Count('sesiones', distinct=True),
            inscritos=Count('inscripciones', distinct=True),
            en_progreso=Count(
                'inscripciones',
                filter=Q(inscripciones__estado_inscripcion=EstadoInscripcion.EN_PROGRESO),
                distinct=True,
            ),
            completados=Count(
                'inscripciones',
                filter=Q(inscripciones__estado_inscripcion=EstadoInscripcion.COMPLETADO),
                distinct=True,
            ),
            abandonados=Count(
                'inscripciones',
                filter=Q(inscripciones__estado_inscripcion=EstadoInscripcion.ABANDONADO),
                distinct=True,
            ),
            diarios=Count('sesiones__diarios', distinct=True),
        )
        .order_by('-fecha_creacion')
    )

    for programa in programas:
        filas.append([
            programa.id,
            programa.nombre,
            programa.creado_por.usuario.nombre_completo,
            programa.creado_por.usuario.email,
            programa.get_estado_publicacion_display(),
            programa.get_tipo_contexto_display(),
            programa.get_enfoque_metodologico_display(),
            programa.duracion_semanas,
            programa.total_sesiones,
            programa.inscritos,
            programa.en_progreso,
            programa.completados,
            programa.abandonados,
            programa.diarios,
            _fecha(programa.fecha_creacion),
            _fecha(programa.fecha_publicacion),
        ])
    return cabeceras, filas


def _tabla_inscripciones():
    cabeceras = [
        'id', 'id_anonimo', 'participante', 'email', 'programa', 'investigador',
        'estado', 'sesiones_completadas', 'total_sesiones', 'progreso_pct',
        'fecha_inicio', 'fecha_fin',
    ]
    filas = []
    inscripciones = (
        InscripcionPrograma.objects.select_related(
            'participante__usuario', 'programa', 'programa__creado_por__usuario'
        )
        .annotate(total_sesiones=Count('programa__sesiones', distinct=True))
        .order_by('-fecha_inicio')
    )
    diarios_por_par = {
        (fila['participante'], fila['sesion__programa']): fila['total']
        for fila in DiarioSesion.objects.values('participante', 'sesion__programa').annotate(
            total=Count('id')
        )
    }

    for inscripcion in inscripciones:
        completadas = diarios_por_par.get(
            (inscripcion.participante_id, inscripcion.programa_id), 0
        )
        progreso = (
            round(completadas / inscripcion.total_sesiones * 100, 1)
            if inscripcion.total_sesiones
            else 0
        )
        filas.append([
            inscripcion.id,
            f'P{inscripcion.participante_id}',
            inscripcion.participante.usuario.nombre_completo,
            inscripcion.participante.usuario.email,
            inscripcion.programa.nombre,
            inscripcion.programa.creado_por.usuario.nombre_completo,
            inscripcion.get_estado_inscripcion_display(),
            completadas,
            inscripcion.total_sesiones,
            progreso,
            _fecha(inscripcion.fecha_inicio),
            _fecha(inscripcion.fecha_fin),
        ])
    return cabeceras, filas


TABLAS = {
    'usuarios': _tabla_usuarios,
    'investigadores': _tabla_investigadores,
    'participantes': _tabla_participantes,
    'programas': _tabla_programas,
    'inscripciones': _tabla_inscripciones,
}


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_exportar(request):
    tipo = request.query_params.get('tipo', 'usuarios')
    constructor = TABLAS.get(tipo)

    if not constructor:
        return Response(
            {'error': f'Tipo de exportación no válido. Opciones: {", ".join(TABLAS)}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        cabeceras, filas = constructor()
        buffer = StringIO()
        escritor = csv.writer(buffer)
        escritor.writerow(cabeceras)
        escritor.writerows(filas)

        marca_temporal = timezone.now().strftime('%Y%m%d_%H%M')
        respuesta = HttpResponse(buffer.getvalue(), content_type='text/csv; charset=utf-8')
        respuesta['Content-Disposition'] = (
            f'attachment; filename="{tipo}_{marca_temporal}.csv"'
        )
        return respuesta

    except Exception as e:
        print("Error al exportar datos de administración:", str(e))
        return Response(
            {'error': f'Error al exportar datos: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
