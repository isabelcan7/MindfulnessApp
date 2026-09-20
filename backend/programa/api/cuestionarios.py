from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from usuario.permissions import IsInvestigador
from django.shortcuts import get_object_or_404
from ..models import Programa
from cuestionario.models import RespuestaCuestionario
from config.enums import usa_formato_escala

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def programa_cuestionarios_y_respuestas(request, pk):
    """
    Obtiene los cuestionarios pre y post de un programa con sus respuestas.
    El formato de respuesta varía según el tipo de cuestionario:
    - Para cuestionarios Likert: devuelve las etiquetas, textos y respuestas como arrays
    - Para otros cuestionarios: devuelve las preguntas y respuestas en formato clave-valor
    """
    try:
        programa = get_object_or_404(Programa, pk=pk)
        
        if programa.creado_por != request.user.perfil_investigador:
            return Response(
                {'error': 'No tienes permiso para ver este programa'},
                status=status.HTTP_403_FORBIDDEN
            )

        cuestionario_pre = programa.cuestionario_pre
        cuestionario_post = programa.cuestionario_post

        resultado = {
            'pre': None,
            'post': None
        }

        def procesar_cuestionario(cuestionario):
            if not cuestionario:
                return None

            # Obtener las respuestas
            respuestas = RespuestaCuestionario.objects.filter(
                cuestionario=cuestionario
            ).select_related('participante').order_by('participante__id', 'fecha_respuesta')

            # Si es un cuestionario tipo Likert
            if usa_formato_escala(cuestionario.tipo_cuestionario):
                etiquetas = cuestionario.preguntas[0]['etiquetas']
                textos = cuestionario.preguntas[0]['textos']
                
                respuestas_por_participante = {}
                for respuesta in respuestas:
                    id_participante = f"P{respuesta.participante.id}"
                    # Las respuestas ya vienen como lista para cuestionarios Likert
                    respuestas_por_participante[id_participante] = respuesta.respuestas

                return {
                    'id': cuestionario.id,
                    'nombre': cuestionario.titulo,
                    'tipo': cuestionario.tipo_cuestionario,
                    'instrumento': cuestionario.cuestionario_predefinido,
                    'etiquetas': etiquetas,
                    'textos': textos,
                    'respuestas': respuestas_por_participante
                }
            
            # Para otros tipos de cuestionarios
            else:
                preguntas = []
                indices_preguntas = []
                
                for i, p in enumerate(cuestionario.preguntas):
                    preguntas.append(p['texto'])
                    indices_preguntas.append(i)
                
                respuestas_por_participante = {}
                for respuesta in respuestas:
                    id_participante = f"P{respuesta.participante.id}"
                    respuestas_lista = []
                    for i, pregunta in enumerate(cuestionario.preguntas):
                        if i in indices_preguntas:
                            pregunta_id = str(pregunta['id'])
                            valor_respuesta = respuesta.respuestas.get(pregunta_id, 'N/A')
                            respuestas_lista.append(valor_respuesta)
                    
                    respuestas_por_participante[id_participante] = respuestas_lista

                return {
                    'id': cuestionario.id,
                    'nombre': cuestionario.titulo,
                    'tipo': 'regular',
                    'preguntas': preguntas,
                    'respuestas': respuestas_por_participante
                }

        resultado['pre'] = procesar_cuestionario(cuestionario_pre)
        resultado['post'] = procesar_cuestionario(cuestionario_post)

        return Response(resultado)

    except Exception as e:
        print(f"Error al obtener cuestionarios y respuestas: {str(e)}")
        return Response(
            {'error': 'Error al obtener los cuestionarios y respuestas'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 