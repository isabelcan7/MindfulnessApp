from django.db.models import Count, Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from config.enums import EstadoInscripcion
from cuestionario.models import RespuestaCuestionario
from programa.models import InscripcionPrograma, Programa
from sesion.models import DiarioSesion
from usuario.permissions import IsAdmin

from .comun import fecha_iso, filtrar_por_texto

CAMPOS_BUSQUEDA_PROGRAMA = [
    'nombre',
    'descripcion',
    'poblacion_objetivo',
    'creado_por__usuario__nombre',
    'creado_por__usuario__apellidos',
    'creado_por__usuario__email',
]
CAMPOS_BUSQUEDA_INSCRIPCION = [
    'programa__nombre',
    'participante__usuario__nombre',
    'participante__usuario__apellidos',
    'participante__usuario__email',
]


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_programas(request):
    try:
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

        estado = request.query_params.get('estado')
        if estado:
            programas = programas.filter(estado_publicacion=estado)

        programas = filtrar_por_texto(
            programas, request.query_params.get('search'), CAMPOS_BUSQUEDA_PROGRAMA
        )

        respuestas_por_cuestionario = {
            fila['cuestionario']: fila['total']
            for fila in RespuestaCuestionario.objects.values('cuestionario').annotate(
                total=Count('id')
            )
        }

        resultado = []
        for programa in programas:
            respuestas_pre = respuestas_por_cuestionario.get(programa.cuestionario_pre_id, 0)
            respuestas_post = respuestas_por_cuestionario.get(programa.cuestionario_post_id, 0)
            investigador = programa.creado_por

            resultado.append({
                'id': programa.id,
                'nombre': programa.nombre,
                'descripcion': programa.descripcion,
                'estado': programa.estado_publicacion,
                'estado_display': programa.get_estado_publicacion_display(),
                'tipo_contexto': programa.tipo_contexto,
                'tipo_contexto_display': programa.get_tipo_contexto_display(),
                'enfoque_metodologico': programa.enfoque_metodologico,
                'enfoque_metodologico_display': programa.get_enfoque_metodologico_display(),
                'poblacion_objetivo': programa.poblacion_objetivo,
                'duracion_semanas': programa.duracion_semanas,
                'tiene_cuestionarios': programa.tiene_cuestionarios,
                'tiene_diarios': programa.tiene_diarios,
                'investigador': {
                    'id': investigador.id,
                    'usuario_id': investigador.usuario_id,
                    'nombre': investigador.usuario.nombre_completo,
                    'email': investigador.usuario.email,
                },
                'total_sesiones': programa.total_sesiones,
                'sesiones_esperadas': programa.duracion_semanas,
                'inscritos': programa.inscritos,
                'en_progreso': programa.en_progreso,
                'completados': programa.completados,
                'abandonados': programa.abandonados,
                'diarios': programa.diarios,
                'respuestas_pre': respuestas_pre,
                'respuestas_post': respuestas_post,
                'tasa_completado': round(programa.completados / programa.inscritos * 100, 1)
                if programa.inscritos
                else 0,
                'fecha_creacion': fecha_iso(programa.fecha_creacion),
                'fecha_publicacion': fecha_iso(programa.fecha_publicacion),
            })

        return Response(resultado)

    except Exception as e:
        print("Error al listar programas:", str(e))
        return Response(
            {'error': f'Error al listar programas: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_inscripciones(request):
    try:
        inscripciones = (
            InscripcionPrograma.objects.select_related(
                'participante__usuario', 'programa', 'programa__creado_por__usuario'
            )
            .annotate(total_sesiones=Count('programa__sesiones', distinct=True))
            .order_by('-fecha_inicio')
        )

        estado = request.query_params.get('estado')
        if estado:
            inscripciones = inscripciones.filter(estado_inscripcion=estado)

        programa_id = request.query_params.get('programa')
        if programa_id:
            inscripciones = inscripciones.filter(programa_id=programa_id)

        inscripciones = filtrar_por_texto(
            inscripciones, request.query_params.get('search'), CAMPOS_BUSQUEDA_INSCRIPCION
        )

        diarios_por_par = {
            (fila['participante'], fila['sesion__programa']): fila['total']
            for fila in DiarioSesion.objects.values('participante', 'sesion__programa').annotate(
                total=Count('id')
            )
        }
        respuestas_por_par = {
            (fila['participante'], fila['cuestionario']): fila['total']
            for fila in RespuestaCuestionario.objects.values('participante', 'cuestionario').annotate(
                total=Count('id')
            )
        }

        resultado = []
        for inscripcion in inscripciones:
            participante = inscripcion.participante
            programa = inscripcion.programa
            sesiones_completadas = diarios_por_par.get((participante.id, programa.id), 0)

            resultado.append({
                'id': inscripcion.id,
                'participante': {
                    'id': participante.id,
                    'usuario_id': participante.usuario_id,
                    'id_anonimo': f'P{participante.id}',
                    'nombre': participante.usuario.nombre_completo,
                    'email': participante.usuario.email,
                },
                'programa': {
                    'id': programa.id,
                    'nombre': programa.nombre,
                    'estado': programa.estado_publicacion,
                    'duracion_semanas': programa.duracion_semanas,
                    'investigador': programa.creado_por.usuario.nombre_completo,
                },
                'estado': inscripcion.estado_inscripcion,
                'estado_display': inscripcion.get_estado_inscripcion_display(),
                'fecha_inicio': fecha_iso(inscripcion.fecha_inicio),
                'fecha_fin': fecha_iso(inscripcion.fecha_fin),
                'total_sesiones': inscripcion.total_sesiones,
                'sesiones_completadas': sesiones_completadas,
                'progreso': round(sesiones_completadas / inscripcion.total_sesiones * 100, 1)
                if inscripcion.total_sesiones
                else 0,
                'cuestionario_pre_respondido': bool(
                    respuestas_por_par.get((participante.id, programa.cuestionario_pre_id))
                ),
                'cuestionario_post_respondido': bool(
                    respuestas_por_par.get((participante.id, programa.cuestionario_post_id))
                ),
            })

        return Response(resultado)

    except Exception as e:
        print("Error al listar inscripciones:", str(e))
        return Response(
            {'error': f'Error al listar inscripciones: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
