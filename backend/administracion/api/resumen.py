from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from config.enums import (
    EstadoInscripcion,
    EstadoPublicacion,
    ExperienciaMindfulness,
    Genero,
    NivelEducativo,
    RoleUsuario,
)
from cuestionario.models import Cuestionario, RespuestaCuestionario
from programa.models import InscripcionPrograma, Programa
from sesion.models import DiarioSesion, Sesion
from usuario.models import Investigador, Participante, Usuario
from usuario.permissions import IsAdmin

from .comun import distribucion, fecha_iso, inicio_de_mes, meses_recientes

MESES_HISTORICO = 6
DIAS_INACTIVIDAD = 30


def _serie_registros():
    periodos = meses_recientes(MESES_HISTORICO)
    anio, mes = periodos[0]
    desde = inicio_de_mes(anio, mes)

    filas = (
        Usuario.objects.filter(date_joined__gte=desde)
        .annotate(mes=TruncMonth('date_joined'))
        .values('mes', 'role')
        .annotate(total=Count('id'))
    )

    acumulado = {}
    for fila in filas:
        clave = (fila['mes'].year, fila['mes'].month)
        acumulado.setdefault(clave, {}).update({fila['role']: fila['total']})

    serie = []
    for clave in periodos:
        por_rol = acumulado.get(clave, {})
        investigadores = por_rol.get(RoleUsuario.INVESTIGADOR, 0)
        participantes = por_rol.get(RoleUsuario.PARTICIPANTE, 0)
        serie.append({
            'mes': f'{clave[0]}-{clave[1]:02d}',
            'investigadores': investigadores,
            'participantes': participantes,
            'total': investigadores + participantes + por_rol.get(RoleUsuario.ADMIN, 0),
        })
    return serie


def _top_programas():
    programas = (
        Programa.objects.select_related('creado_por__usuario')
        .annotate(
            inscritos=Count('inscripciones', distinct=True),
            completados=Count(
                'inscripciones',
                filter=Q(inscripciones__estado_inscripcion=EstadoInscripcion.COMPLETADO),
                distinct=True,
            ),
        )
        .order_by('-inscritos', 'nombre')[:5]
    )

    return [
        {
            'id': programa.id,
            'nombre': programa.nombre,
            'estado': programa.estado_publicacion,
            'estado_display': programa.get_estado_publicacion_display(),
            'investigador': programa.creado_por.usuario.nombre_completo,
            'inscritos': programa.inscritos,
            'completados': programa.completados,
        }
        for programa in programas
    ]


def _investigadores_activos():
    investigadores = (
        Investigador.objects.select_related('usuario')
        .annotate(
            total_programas=Count('programas', distinct=True),
            total_inscritos=Count('programas__inscripciones', distinct=True),
        )
        .order_by('-total_programas', '-total_inscritos')[:5]
    )

    return [
        {
            'id': investigador.id,
            'nombre': investigador.usuario.nombre_completo,
            'email': investigador.usuario.email,
            'total_programas': investigador.total_programas,
            'total_inscritos': investigador.total_inscritos,
        }
        for investigador in investigadores
    ]


def _ultimos_registros():
    usuarios = Usuario.objects.order_by('-date_joined')[:6]
    return [
        {
            'id': usuario.id,
            'nombre': usuario.nombre_completo,
            'email': usuario.email,
            'role': usuario.role,
            'role_display': usuario.get_role_display(),
            'date_joined': fecha_iso(usuario.date_joined),
        }
        for usuario in usuarios
    ]


def _ultimas_inscripciones():
    inscripciones = (
        InscripcionPrograma.objects.select_related(
            'participante__usuario', 'programa', 'programa__creado_por__usuario'
        ).order_by('-fecha_inicio')[:6]
    )
    return [
        {
            'id': inscripcion.id,
            'participante': inscripcion.participante.usuario.nombre_completo,
            'programa': inscripcion.programa.nombre,
            'investigador': inscripcion.programa.creado_por.usuario.nombre_completo,
            'estado': inscripcion.estado_inscripcion,
            'estado_display': inscripcion.get_estado_inscripcion_display(),
            'fecha_inicio': fecha_iso(inscripcion.fecha_inicio),
        }
        for inscripcion in inscripciones
    ]


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_resumen(request):
    try:
        ahora = timezone.now()
        hace_30_dias = ahora - timedelta(days=DIAS_INACTIVIDAD)

        conteo_roles = {
            fila['role']: fila['total']
            for fila in Usuario.objects.values('role').annotate(total=Count('id'))
        }

        usuarios = {
            'total': Usuario.objects.count(),
            'investigadores': conteo_roles.get(RoleUsuario.INVESTIGADOR, 0),
            'participantes': conteo_roles.get(RoleUsuario.PARTICIPANTE, 0),
            'administradores': conteo_roles.get(RoleUsuario.ADMIN, 0),
            'nuevos_30_dias': Usuario.objects.filter(date_joined__gte=hace_30_dias).count(),
            'perfiles_investigador': Investigador.objects.count(),
            'perfiles_participante': Participante.objects.count(),
        }
        usuarios['sin_perfil'] = (
            Usuario.objects.filter(
                role__in=[RoleUsuario.INVESTIGADOR, RoleUsuario.PARTICIPANTE],
                perfil_investigador__isnull=True,
                perfil_participante__isnull=True,
            ).count()
        )

        conteo_estados_programa = {
            fila['estado_publicacion']: fila['total']
            for fila in Programa.objects.values('estado_publicacion').annotate(total=Count('id'))
        }

        programas = {
            'total': Programa.objects.count(),
            'publicados': conteo_estados_programa.get(EstadoPublicacion.PUBLICADO, 0),
            'borradores': conteo_estados_programa.get(EstadoPublicacion.BORRADOR, 0),
            'con_cuestionarios': Programa.objects.filter(tiene_cuestionarios=True).count(),
            'con_diarios': Programa.objects.filter(tiene_diarios=True).count(),
            'nuevos_30_dias': Programa.objects.filter(fecha_creacion__gte=hace_30_dias).count(),
        }

        conteo_estados_inscripcion = {
            fila['estado_inscripcion']: fila['total']
            for fila in InscripcionPrograma.objects.values('estado_inscripcion').annotate(
                total=Count('id')
            )
        }
        total_inscripciones = InscripcionPrograma.objects.count()
        completadas = conteo_estados_inscripcion.get(EstadoInscripcion.COMPLETADO, 0)

        inscripciones = {
            'total': total_inscripciones,
            'en_progreso': conteo_estados_inscripcion.get(EstadoInscripcion.EN_PROGRESO, 0),
            'completadas': completadas,
            'abandonadas': conteo_estados_inscripcion.get(EstadoInscripcion.ABANDONADO, 0),
            'nuevas_30_dias': InscripcionPrograma.objects.filter(
                fecha_inicio__gte=hace_30_dias
            ).count(),
            'tasa_completado': round(completadas / total_inscripciones * 100, 1)
            if total_inscripciones
            else 0,
        }

        respuestas_pre = RespuestaCuestionario.objects.filter(
            cuestionario__programas_pre__isnull=False
        ).distinct().count()
        respuestas_post = RespuestaCuestionario.objects.filter(
            cuestionario__programas_post__isnull=False
        ).distinct().count()

        actividad = {
            'sesiones_creadas': Sesion.objects.count(),
            'diarios_completados': DiarioSesion.objects.count(),
            'cuestionarios_creados': Cuestionario.objects.count(),
            'cuestionarios_respondidos': RespuestaCuestionario.objects.count(),
            'respuestas_pre': respuestas_pre,
            'respuestas_post': respuestas_post,
            'diarios_30_dias': DiarioSesion.objects.filter(
                fecha_creacion__gte=hace_30_dias
            ).count(),
        }

        participantes_qs = Participante.objects.all()
        demografia = {
            'genero': distribucion(participantes_qs, 'usuario__genero', Genero.choices),
            'nivel_educativo': distribucion(
                participantes_qs, 'usuario__nivelEducativo', NivelEducativo.choices
            ),
            'experiencia_mindfulness': distribucion(
                participantes_qs, 'experienciaMindfulness', ExperienciaMindfulness.choices
            ),
        }

        avisos = {
            'participantes_sin_inscripcion': Participante.objects.filter(
                inscripciones__isnull=True
            ).count(),
            'investigadores_sin_programas': Investigador.objects.filter(
                programas__isnull=True
            ).count(),
            'programas_borrador': conteo_estados_programa.get(EstadoPublicacion.BORRADOR, 0),
            'programas_publicados_sin_inscritos': Programa.objects.filter(
                estado_publicacion=EstadoPublicacion.PUBLICADO, inscripciones__isnull=True
            ).count(),
            'inscripciones_sin_actividad': InscripcionPrograma.objects.filter(
                estado_inscripcion=EstadoInscripcion.EN_PROGRESO,
                fecha_inicio__lt=hace_30_dias,
            )
            .exclude(participante__diarios__fecha_creacion__gte=hace_30_dias)
            .distinct()
            .count(),
            'usuarios_sin_perfil': usuarios['sin_perfil'],
        }

        return Response({
            'usuarios': usuarios,
            'programas': programas,
            'inscripciones': inscripciones,
            'actividad': actividad,
            'demografia': demografia,
            'avisos': avisos,
            'registros_por_mes': _serie_registros(),
            'top_programas': _top_programas(),
            'investigadores_activos': _investigadores_activos(),
            'ultimos_registros': _ultimos_registros(),
            'ultimas_inscripciones': _ultimas_inscripciones(),
            'generado_en': fecha_iso(ahora),
        })

    except Exception as e:
        print("Error al obtener el resumen de administración:", str(e))
        return Response(
            {'error': f'Error al obtener el resumen de administración: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
