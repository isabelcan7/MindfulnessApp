from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from .models import Sesion, DiarioSesion, EtiquetaPractica, TipoContenido, Escala
from .serializers import (
    SesionSerializer, 
    SesionDetalleSerializer, 
    DiarioSesionSerializer,
    EtiquetaPracticaSerializer,
    TipoContenidoSerializer,
    EscalaSerializer
)
from programa.models import Programa, InscripcionPrograma, EstadoPublicacion, EstadoInscripcion
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
from .validators import validar_audio, validar_video
import os
from django.conf import settings

def validate_url(url):
    if not url:
        return False
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    validator = URLValidator()
    try:
        validator(url)
        return True
    except ValidationError:
        return False

def error_de_archivo(archivo, validador):
    try:
        validador(archivo)
    except DRFValidationError as e:
        return Response({'error': e.detail[0]}, status=status.HTTP_400_BAD_REQUEST)
    return None

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def sesion_list_create(request):
    if request.method == 'GET':
        queryset = Sesion.objects.all()
        
        # Filtrar por programa si se proporciona el ID
        programa_id = request.query_params.get('programa')
        if programa_id:
            try:
                programa = Programa.objects.get(id=programa_id)
                queryset = queryset.filter(programa=programa)
                
                # Si el usuario es participante, mostrar solo sesiones disponibles
                if request.user.is_participante():
                    inscripciones = InscripcionPrograma.objects.filter(
                        participante=request.user.perfil_participante,
                        estado_inscripcion=EstadoInscripcion.EN_PROGRESO,
                        programa=programa
                    )
                    
                    # Filtrar por semanas disponibles según la fecha de inscripción
                    ahora = timezone.now()
                    sesiones_disponibles = []
                    
                    for sesion in queryset:
                        for inscripcion in inscripciones:
                            fecha_inicio_semana = inscripcion.fecha_inicio + timezone.timedelta(weeks=sesion.semana-1)
                            fecha_fin_semana = fecha_inicio_semana + timezone.timedelta(weeks=1)
                            if fecha_inicio_semana <= ahora <= fecha_fin_semana:
                                sesiones_disponibles.append(sesion.id)
                                break
                    
                    if sesiones_disponibles:
                        queryset = queryset.filter(id__in=sesiones_disponibles)
                
                # Si el usuario es investigador, mostrar solo sesiones de sus programas
                elif request.user.is_investigador():
                    if programa.creado_por != request.user.perfil_investigador:
                        return Response([], status=status.HTTP_200_OK)
            
            except Programa.DoesNotExist:
                return Response([], status=status.HTTP_200_OK)
        
        serializer = SesionSerializer(queryset.order_by('semana'), many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Validar que el usuario es un investigador
        if not request.user.is_investigador():
            return Response(
                {"error": "Solo los investigadores pueden crear sesiones"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validar que el programa pertenece al investigador
        programa_id = request.data.get('programa')
        try:
            programa = Programa.objects.get(id=programa_id)
            if programa.creado_por != request.user.perfil_investigador:
                return Response(
                    {"error": "No tienes permiso para crear sesiones en este programa"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Programa.DoesNotExist:
            return Response(
                {"error": "Programa no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validar que el programa no está publicado
        if programa.estado_publicacion == EstadoPublicacion.PUBLICADO:
            return Response(
                {"error": "No se pueden crear sesiones en un programa publicado"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar tipo de contenido
        tipo_contenido = request.data.get('tipo_contenido')
        if tipo_contenido == 'enlace':
            url = request.data.get('contenido_url', '')
            if url and not validate_url(url):
                return Response({'error': 'URL inválida. Debe incluir http:// o https://'}, status=status.HTTP_400_BAD_REQUEST)
        elif tipo_contenido == 'temporizador':
            if not request.data.get('contenido_temporizador'):
                request.data['contenido_temporizador'] = 0
        elif tipo_contenido == 'audio':
            audio_file = request.FILES.get('contenido_audio')
            if audio_file:
                request.data['contenido_audio'] = audio_file
            error = error_de_archivo(audio_file, validar_audio)
            if error:
                return error
        elif tipo_contenido == 'video':
            video_file = request.FILES.get('contenido_video')
            if video_file:
                request.data['contenido_video'] = video_file
            error = error_de_archivo(video_file, validar_video)
            if error:
                return error
        
        serializer = SesionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                print("Error al guardar la sesión:", str(e))
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # comprobar que el numero de semana no existe y enviar los posibles numeros de semana que quedan disponibles
        if Sesion.objects.filter(programa=programa, semana=request.data.get('semana')).exists():
            return Response({'error': 'El número de semana ya existe. Prueba con otro número de semana'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def sesion_detail(request, pk):
    try:
        sesion = get_object_or_404(Sesion, pk=pk)
    except Sesion.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = SesionDetalleSerializer(sesion, context={'request': request})
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        # Verificar que el usuario es un investigador
        if not request.user.is_investigador():
            return Response(
                {"error": "Solo los investigadores pueden modificar sesiones"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que el programa pertenece al investigador
        if sesion.programa.creado_por != request.user.perfil_investigador:
            return Response(
                {"error": "No tienes permiso para modificar esta sesión"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if sesion.programa.estado_publicacion == EstadoPublicacion.PUBLICADO:
            return Response(
                {"error": "No se pueden modificar sesiones de un programa publicado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar tipo de contenido
        tipo_contenido = request.data.get('tipo_contenido')
        if tipo_contenido == 'enlace':
            url = request.data.get('contenido_url', '')
            if url and not validate_url(url):
                return Response({'error': 'URL inválida. Debe incluir http:// o https://'}, status=status.HTTP_400_BAD_REQUEST)
        elif tipo_contenido == 'temporizador':
            if not request.data.get('contenido_temporizador'):
                request.data['contenido_temporizador'] = 0
        elif tipo_contenido == 'audio':
            error = error_de_archivo(request.FILES.get('contenido_audio'), validar_audio)
            if error:
                return error
        elif tipo_contenido == 'video':
            error = error_de_archivo(request.FILES.get('contenido_video'), validar_video)
            if error:
                return error

        # Limpiar contenido anterior si se cambió el tipo de contenido
        if request.data.get('limpiar_contenido') == 'true':
            tipo_anterior = request.data.get('tipo_contenido_anterior')
            
            # Eliminar archivos físicos si existen
            if tipo_anterior == 'audio' and sesion.contenido_audio:
                try:
                    os.remove(os.path.join(settings.MEDIA_ROOT, str(sesion.contenido_audio)))
                except:
                    pass
                sesion.contenido_audio = None
            
            elif tipo_anterior == 'video' and sesion.contenido_video:
                try:
                    os.remove(os.path.join(settings.MEDIA_ROOT, str(sesion.contenido_video)))
                except:
                    pass
                sesion.contenido_video = None
            
            # Limpiar campos en la base de datos
            if tipo_anterior == 'temporizador':
                sesion.contenido_temporizador = None
            elif tipo_anterior == 'enlace':
                sesion.contenido_url = None
            
            sesion.save()
        
        # Usar partial=True para PATCH
        partial = request.method == 'PATCH'
        serializer = SesionSerializer(sesion, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Verificar que el usuario es un investigador
        if not request.user.is_investigador():
            return Response(
                {"error": "Solo los investigadores pueden eliminar sesiones"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que el programa pertenece al investigador
        if sesion.programa.creado_por != request.user.perfil_investigador:
            return Response(
                {"error": "No tienes permiso para eliminar esta sesión"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if sesion.programa.estado_publicacion == EstadoPublicacion.PUBLICADO:
            return Response(
                {"error": "No se pueden eliminar sesiones de un programa publicado"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Eliminar archivos físicos si existen
        if sesion.contenido_audio:
            try:
                os.remove(os.path.join(settings.MEDIA_ROOT, str(sesion.contenido_audio)))
            except:
                pass
        
        if sesion.contenido_video:
            try:
                os.remove(os.path.join(settings.MEDIA_ROOT, str(sesion.contenido_video)))
            except:
                pass
        
        sesion.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def tipos_practica(request):
    """Devuelve los tipos de práctica disponibles."""
    tipos = [{'value': key, 'label': label} for key, label in EtiquetaPractica.choices]
    serializer = EtiquetaPracticaSerializer(tipos, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def tipos_contenido(request):
    """Devuelve los tipos de contenido disponibles."""
    tipos = [{'value': key, 'label': label} for key, label in TipoContenido.choices]
    serializer = TipoContenidoSerializer(tipos, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def tipos_escala(request):
    tipos = [{'value': choice[0], 'label': choice[1]} for choice in Escala.choices]
    return Response(tipos)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def diario_sesion_list_create(request):
    if request.method == 'GET':
        if request.user.is_participante():
            diarios = DiarioSesion.objects.filter(participante=request.user.perfil_participante)
        else:
            diarios = DiarioSesion.objects.none()
        serializer = DiarioSesionSerializer(diarios, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if not request.user.is_participante():
            return Response(
                {"error": "Solo los participantes pueden crear diarios"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = DiarioSesionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            diario = serializer.save(participante=request.user.perfil_participante)
            
            # Verificar si es la última sesión y el programa no tiene cuestionarios
            sesion = diario.sesion
            programa = sesion.programa
            
            if not programa.tiene_cuestionarios:
                # Obtener todas las sesiones del programa ordenadas por semana
                todas_sesiones = Sesion.objects.filter(programa=programa).order_by('semana')
                ultima_sesion = todas_sesiones.last()
                
                # Si esta es la última sesión, marcar el programa como completado
                if sesion.id == ultima_sesion.id:
                    # Obtener la inscripción del participante
                    inscripcion = InscripcionPrograma.objects.get(
                        participante=request.user.perfil_participante,
                        programa=programa
                    )
                    inscripcion.estado_inscripcion = EstadoInscripcion.COMPLETADO
                    inscripcion.fecha_fin = timezone.now()
                    inscripcion.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def diario_sesion_detail(request, pk):
    try:
        diario = DiarioSesion.objects.get(pk=pk)
    except DiarioSesion.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if request.user.is_participante() and diario.participante != request.user.perfil_participante:
            return Response(
                {"error": "No tienes permiso para ver este diario"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = DiarioSesionSerializer(diario)
        return Response(serializer.data)

    elif request.method == 'PUT':
        if not request.user.is_participante() or diario.participante != request.user.perfil_participante:
            return Response(
                {"error": "No tienes permiso para modificar este diario"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = DiarioSesionSerializer(diario, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not request.user.is_participante() or diario.participante != request.user.perfil_participante:
            return Response(
                {"error": "No tienes permiso para eliminar este diario"},
                status=status.HTTP_403_FORBIDDEN
            )
        diario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def diario_info(request, sesion_id):
    try:
        sesion = get_object_or_404(Sesion, pk=sesion_id)
    except Sesion.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    # Verificar que el usuario es un participante
    if not request.user.is_participante():
        return Response(
            {"error": "Solo los participantes pueden ver sus diarios"}, 
            status=status.HTTP_403_FORBIDDEN
        )

    # Buscar el diario para esta sesión
    try:
        diario = DiarioSesion.objects.get(
            participante=request.user.perfil_participante,
            sesion=sesion
        )
        serializer = DiarioSesionSerializer(diario)
        return Response(serializer.data)
    except DiarioSesion.DoesNotExist:
        return Response(None, status=status.HTTP_200_OK)
