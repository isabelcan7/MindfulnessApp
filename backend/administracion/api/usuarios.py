from django.db.models import Count, Max, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from config.enums import EstadoInscripcion, EstadoPublicacion
from cuestionario.models import RespuestaCuestionario
from programa.models import InscripcionPrograma
from sesion.models import DiarioSesion
from usuario.models import Investigador, Participante, Usuario
from usuario.permissions import IsAdmin

from .comun import edad_de, fecha_iso, filtrar_por_texto

CAMPOS_BUSQUEDA_USUARIO = ['nombre', 'apellidos', 'username', 'email', 'ubicacion', 'ocupacion']
CAMPOS_BUSQUEDA_PERFIL = [f'usuario__{campo}' for campo in CAMPOS_BUSQUEDA_USUARIO]


def _datos_base_usuario(usuario):
    return {
        'id': usuario.id,
        'nombre': usuario.nombre,
        'apellidos': usuario.apellidos,
        'nombre_completo': usuario.nombre_completo,
        'username': usuario.username,
        'email': usuario.email,
        'telefono': usuario.telefono,
        'role': usuario.role,
        'role_display': usuario.get_role_display(),
        'genero': usuario.genero,
        'genero_display': usuario.get_genero_display(),
        'edad': edad_de(usuario.fechaNacimiento),
        'fecha_nacimiento': fecha_iso(usuario.fechaNacimiento),
        'ubicacion': usuario.ubicacion,
        'ocupacion': usuario.ocupacion,
        'nivel_educativo': usuario.nivelEducativo,
        'nivel_educativo_display': usuario.get_nivel_educativo_display(),
        'acepta_terminos': usuario.aceptaTerminos,
        'is_active': usuario.is_active,
        'date_joined': fecha_iso(usuario.date_joined),
        'last_login': fecha_iso(usuario.last_login),
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_usuarios(request):
    try:
        usuarios = Usuario.objects.select_related(
            'perfil_investigador', 'perfil_participante'
        ).order_by('-date_joined')

        role = request.query_params.get('role')
        if role:
            usuarios = usuarios.filter(role=role)

        usuarios = filtrar_por_texto(
            usuarios, request.query_params.get('search'), CAMPOS_BUSQUEDA_USUARIO
        )

        resultado = []
        for usuario in usuarios:
            perfil_investigador = getattr(usuario, 'perfil_investigador', None)
            perfil_participante = getattr(usuario, 'perfil_participante', None)
            datos = _datos_base_usuario(usuario)
            datos.update({
                'perfil_id': (
                    perfil_investigador.id if perfil_investigador
                    else perfil_participante.id if perfil_participante
                    else None
                ),
                'tiene_perfil': bool(perfil_investigador or perfil_participante),
            })
            resultado.append(datos)

        return Response(resultado)

    except Exception as e:
        print("Error al listar usuarios:", str(e))
        return Response(
            {'error': f'Error al listar usuarios: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_investigadores(request):
    try:
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
                total_sesiones=Count('programas__sesiones', distinct=True),
                ultima_publicacion=Max('programas__fecha_publicacion'),
            )
            .order_by('-total_programas', 'usuario__apellidos')
        )

        investigadores = filtrar_por_texto(
            investigadores, request.query_params.get('search'), CAMPOS_BUSQUEDA_PERFIL
        )

        resultado = []
        for investigador in investigadores:
            datos = _datos_base_usuario(investigador.usuario)
            datos.update({
                'perfil_id': investigador.id,
                'usuario_id': investigador.usuario_id,
                'experiencia_investigacion': investigador.experienciaInvestigacion,
                'experiencia_investigacion_display': investigador.get_experiencia_investigacion_display(),
                'areas_interes': investigador.areasInteres,
                'total_programas': investigador.total_programas,
                'programas_publicados': investigador.programas_publicados,
                'programas_borrador': investigador.total_programas - investigador.programas_publicados,
                'total_inscritos': investigador.total_inscritos,
                'total_sesiones': investigador.total_sesiones,
                'ultima_publicacion': fecha_iso(investigador.ultima_publicacion),
            })
            resultado.append(datos)

        return Response(resultado)

    except Exception as e:
        print("Error al listar investigadores:", str(e))
        return Response(
            {'error': f'Error al listar investigadores: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_participantes(request):
    try:
        participantes = (
            Participante.objects.select_related('usuario')
            .annotate(
                total_inscripciones=Count('inscripciones', distinct=True),
                inscripciones_en_progreso=Count(
                    'inscripciones',
                    filter=Q(inscripciones__estado_inscripcion=EstadoInscripcion.EN_PROGRESO),
                    distinct=True,
                ),
                inscripciones_completadas=Count(
                    'inscripciones',
                    filter=Q(inscripciones__estado_inscripcion=EstadoInscripcion.COMPLETADO),
                    distinct=True,
                ),
                inscripciones_abandonadas=Count(
                    'inscripciones',
                    filter=Q(inscripciones__estado_inscripcion=EstadoInscripcion.ABANDONADO),
                    distinct=True,
                ),
                sesiones_completadas=Count('diarios', distinct=True),
                cuestionarios_respondidos=Count('respuestas_cuestionario', distinct=True),
                ultima_sesion=Max('diarios__fecha_creacion'),
            )
            .order_by('-total_inscripciones', 'usuario__apellidos')
        )

        actividad = request.query_params.get('actividad')
        if actividad == 'con_inscripciones':
            participantes = participantes.filter(inscripciones__isnull=False).distinct()
        elif actividad == 'sin_inscripciones':
            participantes = participantes.filter(inscripciones__isnull=True)

        participantes = filtrar_por_texto(
            participantes, request.query_params.get('search'), CAMPOS_BUSQUEDA_PERFIL
        )

        resultado = []
        for participante in participantes:
            datos = _datos_base_usuario(participante.usuario)
            datos.update({
                'perfil_id': participante.id,
                'usuario_id': participante.usuario_id,
                'id_anonimo': f'P{participante.id}',
                'experiencia_mindfulness': participante.experienciaMindfulness,
                'experiencia_mindfulness_display': participante.get_experiencia_mindfulness_display(),
                'condiciones_salud': participante.condicionesSalud,
                'total_inscripciones': participante.total_inscripciones,
                'inscripciones_en_progreso': participante.inscripciones_en_progreso,
                'inscripciones_completadas': participante.inscripciones_completadas,
                'inscripciones_abandonadas': participante.inscripciones_abandonadas,
                'sesiones_completadas': participante.sesiones_completadas,
                'cuestionarios_respondidos': participante.cuestionarios_respondidos,
                'ultima_sesion': fecha_iso(participante.ultima_sesion),
            })
            resultado.append(datos)

        return Response(resultado)

    except Exception as e:
        print("Error al listar participantes:", str(e))
        return Response(
            {'error': f'Error al listar participantes: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_usuario_detalle(request, pk):
    try:
        usuario = get_object_or_404(
            Usuario.objects.select_related('perfil_investigador', 'perfil_participante'), pk=pk
        )
        datos = _datos_base_usuario(usuario)

        perfil_investigador = getattr(usuario, 'perfil_investigador', None)
        if perfil_investigador:
            programas = (
                perfil_investigador.programas.annotate(
                    inscritos=Count('inscripciones', distinct=True),
                    total_sesiones=Count('sesiones', distinct=True),
                ).order_by('-fecha_creacion')
            )
            datos['perfil_investigador'] = {
                'id': perfil_investigador.id,
                'experiencia_investigacion': perfil_investigador.experienciaInvestigacion,
                'experiencia_investigacion_display': perfil_investigador.get_experiencia_investigacion_display(),
                'areas_interes': perfil_investigador.areasInteres,
                'programas': [
                    {
                        'id': programa.id,
                        'nombre': programa.nombre,
                        'estado': programa.estado_publicacion,
                        'estado_display': programa.get_estado_publicacion_display(),
                        'inscritos': programa.inscritos,
                        'total_sesiones': programa.total_sesiones,
                        'fecha_creacion': fecha_iso(programa.fecha_creacion),
                    }
                    for programa in programas
                ],
            }

        perfil_participante = getattr(usuario, 'perfil_participante', None)
        if perfil_participante:
            inscripciones = (
                InscripcionPrograma.objects.filter(participante=perfil_participante)
                .select_related('programa', 'programa__creado_por__usuario')
                .annotate(total_sesiones=Count('programa__sesiones', distinct=True))
                .order_by('-fecha_inicio')
            )
            sesiones_por_programa = {
                fila['sesion__programa']: fila['total']
                for fila in DiarioSesion.objects.filter(participante=perfil_participante)
                .values('sesion__programa')
                .annotate(total=Count('id'))
            }
            respuestas = RespuestaCuestionario.objects.filter(
                participante=perfil_participante
            ).select_related('cuestionario')

            datos['perfil_participante'] = {
                'id': perfil_participante.id,
                'id_anonimo': f'P{perfil_participante.id}',
                'experiencia_mindfulness': perfil_participante.experienciaMindfulness,
                'experiencia_mindfulness_display': perfil_participante.get_experiencia_mindfulness_display(),
                'condiciones_salud': perfil_participante.condicionesSalud,
                'inscripciones': [
                    {
                        'id': inscripcion.id,
                        'programa_id': inscripcion.programa_id,
                        'programa': inscripcion.programa.nombre,
                        'investigador': inscripcion.programa.creado_por.usuario.nombre_completo,
                        'estado': inscripcion.estado_inscripcion,
                        'estado_display': inscripcion.get_estado_inscripcion_display(),
                        'fecha_inicio': fecha_iso(inscripcion.fecha_inicio),
                        'fecha_fin': fecha_iso(inscripcion.fecha_fin),
                        'total_sesiones': inscripcion.total_sesiones,
                        'sesiones_completadas': sesiones_por_programa.get(inscripcion.programa_id, 0),
                    }
                    for inscripcion in inscripciones
                ],
                'respuestas_cuestionario': [
                    {
                        'id': respuesta.id,
                        'cuestionario': respuesta.cuestionario.titulo,
                        'momento': respuesta.cuestionario.momento,
                        'fecha_respuesta': fecha_iso(respuesta.fecha_respuesta),
                    }
                    for respuesta in respuestas
                ],
            }

        return Response(datos)

    except Exception as e:
        print("Error al obtener el detalle del usuario:", str(e))
        return Response(
            {'error': f'Error al obtener el detalle del usuario: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
