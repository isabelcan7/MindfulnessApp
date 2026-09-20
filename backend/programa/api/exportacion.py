import traceback
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from usuario.permissions import IsInvestigador
from django.shortcuts import get_object_or_404
from ..models import Programa, InscripcionPrograma
from sesion.models import DiarioSesion, Sesion
from cuestionario.models import RespuestaCuestionario
from config.enums import (
    TipoContexto, EnfoqueMetodologico, EstadoPublicacion, 
    EstadoInscripcion, EtiquetaPractica, Genero, NivelEducativo,
    ExperienciaMindfulness, usa_formato_escala
)
import csv
import json
import xlsxwriter
import zipfile
from io import BytesIO, StringIO
from django.http import HttpResponse
from datetime import datetime

def generar_archivo_participantes(programa, formato):
    """Genera el archivo de participantes en el formato especificado"""
    if not programa:
        return None

    # Datos de participantes
    participantes_data = []
    inscripciones = InscripcionPrograma.objects.filter(programa=programa).select_related('participante__usuario')
    
    if not inscripciones.exists():
        return None

    # Calcular totales del programa
    total_sesiones = programa.sesiones.count()
    total_cuestionarios = 2 if programa.tiene_cuestionarios else 0

    for inscripcion in inscripciones:
        try:
            participante = inscripcion.participante
            usuario = participante.usuario
            
            # Calcular edad si fechaNacimiento está disponible
            edad = None
            if hasattr(usuario, 'fechaNacimiento') and usuario.fechaNacimiento:
                edad = (datetime.now().date() - usuario.fechaNacimiento).days // 365
            
            # Obtener valores display de los enums y convertir a string
            genero_display = str(dict(Genero.choices).get(usuario.genero, usuario.genero)) if hasattr(usuario, 'genero') else 'No especificado'
            nivel_educativo_display = str(dict(NivelEducativo.choices).get(usuario.nivelEducativo, usuario.nivelEducativo)) if hasattr(usuario, 'nivelEducativo') else 'No especificado'
            experiencia_mindfulness_display = str(dict(ExperienciaMindfulness.choices).get(participante.experienciaMindfulness, participante.experienciaMindfulness)) if hasattr(participante, 'experienciaMindfulness') else 'No especificado'
            estado_inscripcion_display = str(dict(EstadoInscripcion.choices).get(inscripcion.estado_inscripcion, inscripcion.estado_inscripcion))
            
            # Calcular datos de progreso
            sesiones_completadas = DiarioSesion.objects.filter(
                sesion__programa=programa,
                participante=participante
            ).count()
            
            minutos_practica = 0
            diarios = DiarioSesion.objects.filter(
                sesion__programa=programa,
                participante=participante
            ).select_related('sesion')
            
            for diario in diarios:
                if diario.sesion.duracion_estimada:
                    minutos_practica += diario.sesion.duracion_estimada
            
            cuestionarios_completados = 0
            if programa.cuestionario_pre:
                if RespuestaCuestionario.objects.filter(
                    cuestionario=programa.cuestionario_pre,
                    participante=participante
                ).exists():
                    cuestionarios_completados += 1
            
            if programa.cuestionario_post:
                if RespuestaCuestionario.objects.filter(
                    cuestionario=programa.cuestionario_post,
                    participante=participante
                ).exists():
                    cuestionarios_completados += 1
            
            ultima_actividad = None
            ultimo_diario = DiarioSesion.objects.filter(
                sesion__programa=programa,
                participante=participante
            ).order_by('-fecha_creacion').first()
            
            ultima_respuesta = RespuestaCuestionario.objects.filter(
                cuestionario__programa=programa,
                participante=participante
            ).order_by('-fecha_respuesta').first()
            
            if ultimo_diario and ultima_respuesta:
                ultima_actividad = max(ultimo_diario.fecha_creacion, ultima_respuesta.fecha_respuesta)
            elif ultimo_diario:
                ultima_actividad = ultimo_diario.fecha_creacion
            elif ultima_respuesta:
                ultima_actividad = ultima_respuesta.fecha_respuesta

            participantes_data.append({
                'id_participante': f"P{participante.id}",
                # Datos demográficos
                'genero': genero_display,
                'edad': f"{edad} años" if edad is not None else 'No especificado',
                'ocupacion': str(usuario.ocupacion) if hasattr(usuario, 'ocupacion') and usuario.ocupacion else 'No especificado',
                'nivel_educativo': nivel_educativo_display,
                'ubicacion': str(usuario.ubicacion) if hasattr(usuario, 'ubicacion') and usuario.ubicacion else 'No especificado',
                'experiencia_mindfulness': experiencia_mindfulness_display,
                'condiciones_salud': str(participante.condicionesSalud) if hasattr(participante, 'condicionesSalud') and participante.condicionesSalud else 'No especificado',
                # Datos de progreso
                'estado_programa': estado_inscripcion_display,
                'sesiones_completadas': f"{sesiones_completadas} / {total_sesiones}",
                'cuestionarios_completados': f"{cuestionarios_completados} / {total_cuestionarios}",
                'minutos_practica': f"{minutos_practica} min",
                'ultima_actividad': ultima_actividad.strftime('%Y-%m-%d %H:%M') if ultima_actividad else 'N/A'
            })
        except Exception as e:
            print(f"Error procesando participante {inscripcion.participante.id}: {str(e)}")
            continue
    
    if formato == 'json':
        return json.dumps(participantes_data, ensure_ascii=False).encode('utf-8')
    
    elif formato == 'csv':
        output = StringIO()
        writer = csv.writer(output)
        
        # Escribir encabezados
        writer.writerow([
            'ID Participante',
            'Género',
            'Edad',
            'Ocupación',
            'Nivel Educativo',
            'Ubicación',
            'Experiencia Mindfulness',
            'Condiciones de Salud',
            'Estado del Programa',
            'Sesiones Completadas',
            'Cuestionarios Completados',
            'Minutos de Práctica',
            'Última Actividad'
        ])
        
        # Escribir datos
        for participante in participantes_data:
            writer.writerow([
                participante['id_participante'],
                participante['genero'],
                participante['edad'],
                participante['ocupacion'],
                participante['nivel_educativo'],
                participante['ubicacion'],
                participante['experiencia_mindfulness'],
                participante['condiciones_salud'],
                participante['estado_programa'],
                participante['sesiones_completadas'],
                participante['cuestionarios_completados'],
                participante['minutos_practica'],
                participante['ultima_actividad']
            ])
        
        return output.getvalue().encode('utf-8-sig')
    
    elif formato == 'excel':
        output = BytesIO()
        workbook = xlsxwriter.Workbook(output)
        
        # Estilos
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#D9E1F2',
            'border': 1
        })
        
        # Crear hoja de participantes
        ws_participantes = workbook.add_worksheet('Participantes')
        headers = [
            'ID Participante',
            'Género',
            'Edad',
            'Ocupación',
            'Nivel Educativo',
            'Ubicación',
            'Experiencia Mindfulness',
            'Condiciones de Salud',
            'Estado del Programa',
            'Sesiones Completadas',
            'Cuestionarios Completados',
            'Minutos de Práctica',
            'Última Actividad'
        ]
        
        # Escribir encabezados
        for col, header in enumerate(headers):
            ws_participantes.write(0, col, header, header_format)
        
        # Escribir datos
        for row, participante in enumerate(participantes_data, start=1):
            ws_participantes.write(row, 0, str(participante['id_participante']))
            ws_participantes.write(row, 1, str(participante['genero']))
            ws_participantes.write(row, 2, str(participante['edad']))
            ws_participantes.write(row, 3, str(participante['ocupacion']))
            ws_participantes.write(row, 4, str(participante['nivel_educativo']))
            ws_participantes.write(row, 5, str(participante['ubicacion']))
            ws_participantes.write(row, 6, str(participante['experiencia_mindfulness']))
            ws_participantes.write(row, 7, str(participante['condiciones_salud']))
            ws_participantes.write(row, 8, str(participante['estado_programa']))
            ws_participantes.write(row, 9, str(participante['sesiones_completadas']))
            ws_participantes.write(row, 10, str(participante['cuestionarios_completados']))
            ws_participantes.write(row, 11, str(participante['minutos_practica']))
            ws_participantes.write(row, 12, str(participante['ultima_actividad']))
        
        workbook.close()
        return output.getvalue()

def generar_archivo_diarios(programa, formato):
    """Genera el archivo de diarios en el formato especificado"""
    # Obtener todas las sesiones del programa
    sesiones = Sesion.objects.filter(programa=programa).order_by('semana', 'id')
    diarios_data = []
    
    for sesion in sesiones:
        # Obtener los diarios de esta sesión
        diarios = DiarioSesion.objects.filter(
            sesion=sesion
        ).select_related('participante', 'sesion')
        
        for diario in diarios:
            # Obtener valor display del tipo de práctica y convertir a string
            tipo_practica_display = str(dict(EtiquetaPractica.choices).get(sesion.tipo_practica, sesion.tipo_practica))
            
            diarios_data.append({
                'semana': sesion.semana,
                'sesion': str(sesion.titulo),
                'tipo_practica': tipo_practica_display,
                'id_participante': f"P{diario.participante.id}",
                'valoracion': diario.valoracion,
                'comentario': str(diario.comentario) if diario.comentario else 'Sin comentario',
                'fecha': diario.fecha_creacion.strftime('%d/%m/%Y')
            })
    
    if formato == 'json':
        return json.dumps(diarios_data, ensure_ascii=False).encode('utf-8')
    
    elif formato == 'csv':
        output = StringIO()
        writer = csv.writer(output)
        
        # Escribir encabezados
        writer.writerow([
            'Semana',
            'Sesión',
            'Tipo de Práctica',
            'ID Participante',
            'Valoración',
            'Comentario',
            'Fecha'
        ])
        
        # Escribir datos
        for diario in diarios_data:
            writer.writerow([
                diario['semana'],
                diario['sesion'],
                diario['tipo_practica'],
                diario['id_participante'],
                diario['valoracion'],
                diario['comentario'],
                diario['fecha']
            ])
        
        return output.getvalue().encode('utf-8-sig')
    
    elif formato == 'excel':
        output = BytesIO()
        workbook = xlsxwriter.Workbook(output)
        
        # Estilos
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#D9E1F2',
            'border': 1
        })
        
        # Crear hoja
        ws_diarios = workbook.add_worksheet('Diarios')
        headers = [
            'Semana',
            'Sesión',
            'Tipo de Práctica',
            'ID Participante',
            'Valoración',
            'Comentario',
            'Fecha'
        ]
        
        # Escribir encabezados
        for col, header in enumerate(headers):
            ws_diarios.write(0, col, header, header_format)
        
        # Escribir datos (asegurándonos de que todos los valores sean del tipo correcto)
        for row, diario in enumerate(diarios_data, start=1):
            ws_diarios.write(row, 0, diario['semana'])  # número
            ws_diarios.write(row, 1, str(diario['sesion']))  # string
            ws_diarios.write(row, 2, str(diario['tipo_practica']))  # string
            ws_diarios.write(row, 3, str(diario['id_participante']))  # string
            ws_diarios.write(row, 4, diario['valoracion'])  # número
            ws_diarios.write(row, 5, str(diario['comentario']))  # string
            ws_diarios.write(row, 6, str(diario['fecha']))  # string
        
        workbook.close()
        return output.getvalue()

def generar_archivo_cuestionario(programa, momento, formato):
    """Genera el archivo de cuestionario (pre o post) en el formato especificado"""
    cuestionario = programa.cuestionario_pre if momento == 'pre' else programa.cuestionario_post
    
    if not cuestionario:
        return None

    # Si es un cuestionario tipo Likert
    if usa_formato_escala(cuestionario.tipo_cuestionario):
        # Obtener etiquetas y textos del cuestionario Likert
        etiquetas = cuestionario.preguntas[0]['etiquetas']
        textos = cuestionario.preguntas[0]['textos']
        
        # Obtener respuestas
        respuestas = RespuestaCuestionario.objects.filter(
            cuestionario=cuestionario
        ).select_related('participante').order_by('participante__id', 'fecha_respuesta')

        # Preparar datos para exportación
        datos = []
        respuestas_por_participante = {}
        
        for respuesta in respuestas:
            participante_id = f"P{respuesta.participante.id}"
            # Para JSON, mantener el formato original de respuestas por participante
            if formato == 'json':
                respuestas_por_participante[participante_id] = respuesta.respuestas
            else:
                # Para CSV y Excel, formatear como filas
                fila = {'ID Participante': participante_id}
                for i, texto in enumerate(textos):
                    valor = respuesta.respuestas[i] if i < len(respuesta.respuestas) else 'N/A'
                    fila[texto] = str(valor)
                datos.append(fila)

        if formato == 'json':
            return json.dumps({
                'tipo': cuestionario.tipo_cuestionario,
                'instrumento': cuestionario.cuestionario_predefinido,
                'momento': momento,
                'etiquetas': etiquetas,
                'textos': textos,
                'respuestas': respuestas_por_participante
            }, ensure_ascii=False).encode('utf-8')

        elif formato == 'csv':
            output = StringIO()
            writer = csv.writer(output)
            # Escribir encabezados
            writer.writerow(['ID Participante'] + textos)
            # Escribir datos
            for dato in datos:
                fila = [dato['ID Participante']]
                for texto in textos:
                    fila.append(dato[texto])
                writer.writerow(fila)
            return output.getvalue().encode('utf-8-sig')

        elif formato == 'excel':
            output = BytesIO()
            workbook = xlsxwriter.Workbook(output)
            
            # Estilos
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D9E1F2',
                'border': 1
            })
            
            # Crear hoja
            nombre_hoja = f'Cuestionario {momento.title()}'
            ws = workbook.add_worksheet(nombre_hoja)
            
            # Escribir información de la escala Likert
            ws.write(0, 0, 'Escala de valoración:', header_format)
            for i, etiqueta in enumerate(etiquetas, start=1):
                ws.write(0, i, f"{i}: {etiqueta}")
            
            # Escribir encabezados de la tabla (dejando una fila en blanco después de la escala)
            headers = ['ID Participante'] + textos
            for col, header in enumerate(headers):
                ws.write(2, col, str(header), header_format)
            
            # Escribir datos
            for row, dato in enumerate(datos, start=3):
                ws.write(row, 0, dato['ID Participante'])
                for col, texto in enumerate(textos, start=1):
                    ws.write(row, col, dato[texto])
            
            workbook.close()
            return output.getvalue()

    # Para otros tipos de cuestionarios, mantener la lógica existente
    else:
        preguntas = []
        indices_preguntas = []
        
        for i, p in enumerate(cuestionario.preguntas):
            preguntas.append(str(p['texto']))
            indices_preguntas.append(i)
        
        respuestas = RespuestaCuestionario.objects.filter(
            cuestionario=cuestionario
        ).select_related('participante').order_by('participante__id', 'fecha_respuesta')

        # Preparar datos para exportación
        datos = []
        for respuesta in respuestas:
            fila = {'ID Participante': f"P{respuesta.participante.id}"}
            for i, pregunta in enumerate(cuestionario.preguntas):
                if i in indices_preguntas:
                    pregunta_id = str(pregunta['id'])
                    valor_respuesta = respuesta.respuestas.get(pregunta_id, 'N/A')
                    fila[str(pregunta['texto'])] = str(valor_respuesta) if valor_respuesta is not None else 'N/A'
            datos.append(fila)

        if formato == 'json':
            return json.dumps({
                'tipo': 'regular',
                'momento': momento,
                'preguntas': preguntas,
                'datos': datos
            }, ensure_ascii=False).encode('utf-8')

        elif formato == 'csv':
            output = StringIO()
            writer = csv.writer(output)
            writer.writerow(['ID Participante'] + preguntas)

            for respuesta in respuestas:
                fila = [f"P{respuesta.participante.id}"]
                for i, pregunta in enumerate(cuestionario.preguntas):
                    if i in indices_preguntas:
                        pregunta_id = str(pregunta['id'])
                        valor_respuesta = respuesta.respuestas.get(pregunta_id, 'N/A')
                        fila.append(str(valor_respuesta) if valor_respuesta is not None else 'N/A')
                writer.writerow(fila)

            return output.getvalue().encode('utf-8-sig')

        elif formato == 'excel':
            output = BytesIO()
            workbook = xlsxwriter.Workbook(output)
            
            # Estilos
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D9E1F2',
                'border': 1
            })
            
            # Crear hoja
            nombre_hoja = f'Cuestionario {momento.title()}'
            ws = workbook.add_worksheet(nombre_hoja)
            
            # Escribir encabezados
            headers = ['ID Participante'] + preguntas
            for col, header in enumerate(headers):
                ws.write(0, col, str(header), header_format)
            
            # Escribir datos
            for row, respuesta in enumerate(respuestas, start=1):
                ws.write(row, 0, f"P{respuesta.participante.id}")
                col_index = 1
                for i, pregunta in enumerate(cuestionario.preguntas):
                    if i in indices_preguntas:
                        pregunta_id = str(pregunta['id'])
                        valor_respuesta = respuesta.respuestas.get(pregunta_id, 'N/A')
                        ws.write(row, col_index, str(valor_respuesta) if valor_respuesta is not None else 'N/A')
                        col_index += 1
            
            workbook.close()
            return output.getvalue()

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsInvestigador])
def exportar_datos_programa(request, pk):
    try:
        programa = get_object_or_404(Programa, pk=pk)
        
        # Verificar que el programa pertenece al investigador actual
        if programa.creado_por != request.user.perfil_investigador:
            return Response(
                {"error": "No tienes permiso para exportar datos de este programa"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        tipo_exportacion = request.GET.get('tipo', 'todos')
        formato = request.GET.get('formato', 'csv')
        fecha = datetime.now().strftime('%Y%m%d')
        
        if formato not in ['csv', 'excel', 'json']:
            return Response(
                {"error": "Formato no válido. Use 'csv', 'excel' o 'json'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar que hay datos para exportar según el tipo
        if tipo_exportacion == 'participantes':
            if not InscripcionPrograma.objects.filter(programa=programa).exists():
                return Response(
                    {"error": "El programa no tiene participantes para exportar"},
                    status=status.HTTP_404_NOT_FOUND
                )
        elif tipo_exportacion == 'diarios':
            if not DiarioSesion.objects.filter(sesion__programa=programa).exists():
                return Response(
                    {"error": "El programa no tiene diarios para exportar"},
                    status=status.HTTP_404_NOT_FOUND
                )
        elif tipo_exportacion == 'cuestionarios':
            if not programa.cuestionario_pre and not programa.cuestionario_post:
                return Response(
                    {"error": "El programa no tiene cuestionarios para exportar"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        extension = {
            'csv': 'csv',
            'excel': 'xlsx',
            'json': 'json'
        }[formato]
        
        if tipo_exportacion == 'todos':
            # Crear ZIP con todos los datos
            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                # Agregar participantes
                participantes_data = generar_archivo_participantes(programa, formato)
                if participantes_data:
                    zip_file.writestr(f'participantes_programa_{programa.id}_{fecha}.{extension}', participantes_data)
                
                # Agregar diarios
                diarios_data = generar_archivo_diarios(programa, formato)
                if diarios_data:
                    zip_file.writestr(f'diarios_programa_{programa.id}_{fecha}.{extension}', diarios_data)
                
                # Agregar cuestionario pre si existe
                if programa.cuestionario_pre:
                    cuestionario_pre_data = generar_archivo_cuestionario(programa, 'pre', formato)
                    if cuestionario_pre_data:
                        zip_file.writestr(f'cuestionario_pre_programa_{programa.id}_{fecha}.{extension}', cuestionario_pre_data)
                
                # Agregar cuestionario post si existe
                if programa.cuestionario_post:
                    cuestionario_post_data = generar_archivo_cuestionario(programa, 'post', formato)
                    if cuestionario_post_data:
                        zip_file.writestr(f'cuestionario_post_programa_{programa.id}_{fecha}.{extension}', cuestionario_post_data)
            
            response = HttpResponse(
                zip_buffer.getvalue(),
                content_type='application/zip'
            )
            response['Content-Disposition'] = f'attachment; filename="datos_completos_programa_{programa.id}_{fecha}.zip"'
            return response
        
        elif tipo_exportacion == 'cuestionarios':
            # Crear ZIP solo con cuestionarios
            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                # Agregar cuestionario pre si existe
                if programa.cuestionario_pre:
                    cuestionario_pre_data = generar_archivo_cuestionario(programa, 'pre', formato)
                    if cuestionario_pre_data:
                        zip_file.writestr(f'cuestionario_pre_programa_{programa.id}_{fecha}.{extension}', cuestionario_pre_data)
                
                # Agregar cuestionario post si existe
                if programa.cuestionario_post:
                    cuestionario_post_data = generar_archivo_cuestionario(programa, 'post', formato)
                    if cuestionario_post_data:
                        zip_file.writestr(f'cuestionario_post_programa_{programa.id}_{fecha}.{extension}', cuestionario_post_data)
            
            response = HttpResponse(
                zip_buffer.getvalue(),
                content_type='application/zip'
            )
            response['Content-Disposition'] = f'attachment; filename="cuestionarios_programa_{programa.id}_{fecha}.zip"'
            return response

        elif tipo_exportacion == 'participantes':
            # Exportar solo participantes (archivo individual)
            participantes_data = generar_archivo_participantes(programa, formato)
            
            if formato == 'json':
                response = HttpResponse(
                    participantes_data,
                    content_type='application/json; charset=utf-8'
                )
                response['Content-Disposition'] = f'attachment; filename="participantes_programa_{programa.id}_{fecha}.json"'
                return response
            
            elif formato == 'csv':
                response = HttpResponse(
                    participantes_data,
                    content_type='text/csv; charset=utf-8'
                )
                response['Content-Disposition'] = f'attachment; filename="participantes_programa_{programa.id}_{fecha}.csv"'
                return response
            
            elif formato == 'excel':
                response = HttpResponse(
                    participantes_data,
                    content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
                response['Content-Disposition'] = f'attachment; filename="participantes_programa_{programa.id}_{fecha}.xlsx"'
                return response

        elif tipo_exportacion == 'diarios':
            # Exportar solo diarios (archivo individual)
            diarios_data = generar_archivo_diarios(programa, formato)
            
            if formato == 'json':
                response = HttpResponse(
                    diarios_data,
                    content_type='application/json; charset=utf-8'
                )
                response['Content-Disposition'] = f'attachment; filename="diarios_programa_{programa.id}_{fecha}.json"'
                return response
            
            elif formato == 'csv':
                response = HttpResponse(
                    diarios_data,
                    content_type='text/csv; charset=utf-8'
                )
                response['Content-Disposition'] = f'attachment; filename="diarios_programa_{programa.id}_{fecha}.csv"'
                return response
            
            elif formato == 'excel':
                response = HttpResponse(
                    diarios_data,
                    content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
                response['Content-Disposition'] = f'attachment; filename="diarios_programa_{programa.id}_{fecha}.xlsx"'
                return response

        else:
            return Response(
                {"error": "Tipo de exportación no válido. Use 'todos', 'cuestionarios', 'diarios' o 'participantes'"},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        print(f"Error al exportar datos: {str(e)}")
        print(traceback.format_exc())
        return Response(
            {"error": "Error interno del servidor al exportar datos"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 