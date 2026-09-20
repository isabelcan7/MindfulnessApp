import pytest
from django.urls import reverse
from rest_framework import status
from cuestionario.models import Cuestionario, RespuestaCuestionario
from programa.models import InscripcionPrograma, Programa
from config.enums import MomentoCuestionario, TipoCuestionario, EstadoInscripcion, EstadoPublicacion

@pytest.mark.django_db
class TestCuestionarioAPI:
    """Tests para la API de cuestionarios."""

    def test_cuestionario_list_authenticated_investigador(self, authenticated_client_investigador, programa_borrador):
        """Test listar cuestionarios como investigador autenticado."""
        url = f'/api/programas/{programa_borrador.id}/cuestionarios/'
        response = authenticated_client_investigador.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)

    def test_cuestionario_list_unauthenticated(self, api_client, programa_borrador):
        """Test listar cuestionarios sin autenticación."""
        url = f'/api/programas/{programa_borrador.id}/cuestionarios/'
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_cuestionario_create_success_investigador(self, authenticated_client_investigador, programa_borrador):
        """Test crear cuestionario exitosamente como investigador."""
        data = {
            'momento': MomentoCuestionario.PRE,
            'tipo_cuestionario': TipoCuestionario.PERSONALIZADO,
            'titulo': 'Cuestionario Pre Test API',
            'descripcion': 'Descripción del cuestionario de prueba',
            'preguntas': [
                {
                    'id': 1,
                    'tipo': 'texto',
                    'texto': '¿Cómo te encuentras hoy?',
                    'requerida': True
                }
            ]
        }
        
        url = f'/api/programas/{programa_borrador.id}/cuestionarios/'
        response = authenticated_client_investigador.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['titulo'] == 'Cuestionario Pre Test API'
        assert Cuestionario.objects.filter(titulo='Cuestionario Pre Test API').exists()

    def test_cuestionario_create_predefinido(self, authenticated_client_investigador, programa_borrador):
        """Test crear cuestionario predefinido con su escala e items."""
        data = {
            'momento': MomentoCuestionario.PRE,
            'tipo_cuestionario': TipoCuestionario.PREDEFINIDO,
            'cuestionario_predefinido': 'MAAS',
            'titulo': 'MAAS (Mindful Attention Awareness Scale)',
            'descripcion': 'Mide el nivel de atencion y conciencia plena.',
            'preguntas': [
                {
                    'etiquetas': ['Casi siempre', 'Muy frecuentemente', 'Algo frecuentemente',
                                  'Algo infrecuentemente', 'Muy infrecuentemente', 'Casi nunca'],
                    'textos': ['Item uno', 'Item dos', 'Item tres']
                }
            ]
        }
        
        url = f'/api/programas/{programa_borrador.id}/cuestionarios/'
        response = authenticated_client_investigador.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['cuestionario_predefinido'] == 'MAAS'
        cuestionario = Cuestionario.objects.get(id=response.data['id'])
        assert len(cuestionario.preguntas[0]['etiquetas']) == 6
        assert len(cuestionario.preguntas[0]['textos']) == 3

    def test_cuestionario_predefinido_admite_escalas_no_de_cinco_puntos(self, authenticated_client_investigador, programa_borrador):
        """Test que un predefinido acepta escalas de 4 y de 7 puntos."""
        url = f'/api/programas/{programa_borrador.id}/cuestionarios/'

        for momento, puntos in ((MomentoCuestionario.PRE, 4), (MomentoCuestionario.POST, 7)):
            data = {
                'momento': momento,
                'tipo_cuestionario': TipoCuestionario.PREDEFINIDO,
                'cuestionario_predefinido': 'DASS',
                'titulo': f'Escala de {puntos} puntos',
                'descripcion': 'Instrumento validado con escala propia.',
                'preguntas': [
                    {
                        'etiquetas': [f'Opcion {i}' for i in range(puntos)],
                        'textos': ['Item uno', 'Item dos']
                    }
                ]
            }
            response = authenticated_client_investigador.post(url, data, format='json')

            assert response.status_code == status.HTTP_201_CREATED
            assert len(response.data['preguntas'][0]['etiquetas']) == puntos

    def test_cuestionario_likert_sigue_exigiendo_cinco_puntos(self, authenticated_client_investigador, programa_borrador):
        """Test que el Likert personalizado mantiene la restriccion de 5 etiquetas."""
        data = {
            'momento': MomentoCuestionario.PRE,
            'tipo_cuestionario': TipoCuestionario.LIKERT,
            'titulo': 'Likert invalido',
            'descripcion': 'Escala con un numero de puntos no permitido.',
            'preguntas': [
                {
                    'etiquetas': ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis'],
                    'textos': ['Item uno']
                }
            ]
        }
        
        url = f'/api/programas/{programa_borrador.id}/cuestionarios/'
        response = authenticated_client_investigador.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_cuestionario_create_forbidden_participante(self, authenticated_client_participante, programa_borrador):
        """Test crear cuestionario como participante (debe fallar)."""
        data = {
            'momento': MomentoCuestionario.POST,
            'tipo_cuestionario': TipoCuestionario.PERSONALIZADO,
            'titulo': 'No Permitido'
        }
        
        url = f'/api/programas/{programa_borrador.id}/cuestionarios/'
        response = authenticated_client_participante.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_cuestionario_create_programa_publicado(self, authenticated_client_investigador, programa_publicado):
        """Test crear cuestionario en programa publicado (debe fallar)."""
        # Asegurar que el programa esté realmente publicado
        Programa.objects.filter(id=programa_publicado.id).update(
            estado_publicacion=EstadoPublicacion.PUBLICADO
        )
        programa_publicado.refresh_from_db()
        
        data = {
            'momento': MomentoCuestionario.PRE,
            'tipo_cuestionario': TipoCuestionario.PERSONALIZADO,
            'titulo': 'Cuestionario en Programa Publicado',
            'preguntas': [
                {
                    'id': 1,
                    'tipo': 'texto',
                    'texto': '¿Pregunta de prueba?',
                    'requerida': True
                }
            ]
        }
        
        url = f'/api/programas/{programa_publicado.id}/cuestionarios/'
        response = authenticated_client_investigador.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_cuestionario_create_momento_duplicado(self, authenticated_client_investigador, programa_borrador, cuestionario_pre):
        """Test crear cuestionario con momento duplicado."""
        data = {
            'momento': MomentoCuestionario.PRE,  # Ya existe uno PRE
            'tipo_cuestionario': TipoCuestionario.PERSONALIZADO,
            'titulo': 'Cuestionario PRE Duplicado'
        }
        
        url = f'/api/programas/{programa_borrador.id}/cuestionarios/'
        response = authenticated_client_investigador.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_cuestionario_detail_get_success(self, authenticated_client_investigador, cuestionario_pre):
        """Test obtener detalle de cuestionario exitosamente."""
        url = f'/api/cuestionario/{cuestionario_pre.id}/'
        response = authenticated_client_investigador.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['titulo'] == cuestionario_pre.titulo

    def test_cuestionario_detail_update_success(self, authenticated_client_investigador, cuestionario_pre):
        """Test actualizar cuestionario exitosamente."""
        data = {
            'titulo': 'Título Actualizado',
            'descripcion': 'Descripción actualizada',
            'preguntas': [
                {
                    'id': 1,
                    'tipo': 'texto',
                    'texto': '¿Pregunta actualizada?',
                    'requerida': True
                }
            ]
        }
        
        url = f'/api/cuestionario/{cuestionario_pre.id}/'
        response = authenticated_client_investigador.put(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        cuestionario_pre.refresh_from_db()
        assert cuestionario_pre.titulo == 'Título Actualizado'

    def test_cuestionario_detail_update_forbidden_participante(self, authenticated_client_participante, cuestionario_pre):
        """Test actualizar cuestionario como participante (debe fallar)."""
        data = {
            'titulo': 'No Permitido'
        }
        
        url = f'/api/cuestionario/{cuestionario_pre.id}/'
        response = authenticated_client_participante.put(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_cuestionario_detail_delete_success(self, authenticated_client_investigador, programa_borrador):
        """Test eliminar cuestionario exitosamente."""
        cuestionario_temp = Cuestionario.objects.create(
            programa=programa_borrador,
            momento=MomentoCuestionario.POST,
            tipo_cuestionario=TipoCuestionario.PERSONALIZADO,
            titulo='Cuestionario a Eliminar',
            descripcion='Para eliminar',
            preguntas=[
                {
                    'id': 1,
                    'tipo': 'texto',
                    'texto': '¿Pregunta de prueba?',
                    'requerida': True
                }
            ]
        )
        
        url = f'/api/cuestionario/{cuestionario_temp.id}/'
        response = authenticated_client_investigador.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Cuestionario.objects.filter(pk=cuestionario_temp.pk).exists()

@pytest.mark.django_db
class TestCuestionarioParticipanteAPI:
    """Tests para la API de cuestionarios desde la perspectiva del participante."""

    def test_obtener_cuestionario_pre_success(self, authenticated_client_participante, participante, programa_borrador, cuestionario_pre):
        """Test obtener cuestionario pre exitosamente."""
        # Crear inscripción
        InscripcionPrograma.objects.create(
            programa=programa_borrador,
            participante=participante,
            estado_inscripcion=EstadoInscripcion.EN_PROGRESO
        )
        
        # Asignar cuestionario al programa
        programa_borrador.cuestionario_pre = cuestionario_pre
        programa_borrador.save()
        
        url = '/api/cuestionario/pre/'
        response = authenticated_client_participante.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['titulo'] == cuestionario_pre.titulo

    def test_obtener_cuestionario_pre_no_inscrito(self, authenticated_client_participante):
        """Test obtener cuestionario pre sin estar inscrito."""
        url = '/api/cuestionario/pre/'
        response = authenticated_client_participante.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_obtener_cuestionario_pre_forbidden_investigador(self, authenticated_client_investigador):
        """Test obtener cuestionario pre como investigador (debe fallar)."""
        url = '/api/cuestionario/pre/'
        response = authenticated_client_investigador.get(url)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_obtener_cuestionario_post_success(self, authenticated_client_participante, participante, programa_borrador, cuestionario_post):
        """Test obtener cuestionario post exitosamente."""
        # Crear inscripción
        InscripcionPrograma.objects.create(
            programa=programa_borrador,
            participante=participante,
            estado_inscripcion=EstadoInscripcion.EN_PROGRESO
        )
        
        # Asignar cuestionario al programa
        programa_borrador.cuestionario_post = cuestionario_post
        programa_borrador.save()
        
        url = '/api/cuestionario/post/'
        response = authenticated_client_participante.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['titulo'] == cuestionario_post.titulo

    def test_responder_cuestionario_pre_success(self, authenticated_client_participante, participante, programa_borrador, cuestionario_pre):
        """Test responder cuestionario pre exitosamente."""
        # Crear inscripción
        InscripcionPrograma.objects.create(
            programa=programa_borrador,
            participante=participante,
            estado_inscripcion=EstadoInscripcion.EN_PROGRESO
        )
        
        # Asignar cuestionario al programa
        programa_borrador.cuestionario_pre = cuestionario_pre
        programa_borrador.save()
        
        data = {
            'respuestas': {
                '1': 'Me siento bien'
            }
        }
        
        url = '/api/cuestionario/responder/pre/'
        response = authenticated_client_participante.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert RespuestaCuestionario.objects.filter(
            participante=participante,
            cuestionario=cuestionario_pre
        ).exists()

    def test_responder_cuestionario_predefinido_success(self, authenticated_client_participante, participante, programa_borrador):
        """Test responder un cuestionario predefinido de escala no de cinco puntos."""
        cuestionario = Cuestionario.objects.create(
            programa=programa_borrador,
            momento=MomentoCuestionario.PRE,
            tipo_cuestionario=TipoCuestionario.PREDEFINIDO,
            cuestionario_predefinido='MAAS',
            titulo='MAAS',
            descripcion='Escala de conciencia plena.',
            preguntas=[
                {
                    'etiquetas': ['Casi siempre', 'Muy frecuentemente', 'Algo frecuentemente',
                                  'Algo infrecuentemente', 'Muy infrecuentemente', 'Casi nunca'],
                    'textos': ['Item uno', 'Item dos', 'Item tres']
                }
            ]
        )

        InscripcionPrograma.objects.create(
            programa=programa_borrador,
            participante=participante,
            estado_inscripcion=EstadoInscripcion.EN_PROGRESO
        )

        programa_borrador.cuestionario_pre = cuestionario
        programa_borrador.save()

        data = {'respuestas': [6, 3, 1]}

        url = '/api/cuestionario/responder/pre/'
        response = authenticated_client_participante.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        respuesta = RespuestaCuestionario.objects.get(
            participante=participante,
            cuestionario=cuestionario
        )
        assert respuesta.respuestas == [6, 3, 1]

    def test_responder_cuestionario_pre_ya_respondido(self, authenticated_client_participante, participante, programa_borrador, cuestionario_pre):
        """Test responder cuestionario pre ya respondido (debe fallar)."""
        # Crear inscripción
        InscripcionPrograma.objects.create(
            programa=programa_borrador,
            participante=participante,
            estado_inscripcion=EstadoInscripcion.EN_PROGRESO
        )
        
        # Asignar cuestionario al programa
        programa_borrador.cuestionario_pre = cuestionario_pre
        programa_borrador.save()
        
        # Crear respuesta previa
        RespuestaCuestionario.objects.create(
            participante=participante,
            cuestionario=cuestionario_pre,
            respuestas=[{'pregunta_id': 1, 'respuesta': 'Ya respondido'}]
        )
        
        data = {
            'respuestas': [
                {
                    'pregunta_id': 1,
                    'respuesta': 'Intento responder de nuevo'
                }
            ]
        }
        
        url = '/api/cuestionario/responder/pre/'
        response = authenticated_client_participante.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_responder_cuestionario_post_success(self, authenticated_client_participante, participante, programa_borrador, cuestionario_post):
        """Test responder cuestionario post exitosamente."""
        # Crear inscripción
        InscripcionPrograma.objects.create(
            programa=programa_borrador,
            participante=participante,
            estado_inscripcion=EstadoInscripcion.EN_PROGRESO
        )
        
        # Asignar cuestionario al programa
        programa_borrador.cuestionario_post = cuestionario_post
        programa_borrador.save()
        
        data = {
            'respuestas': {
                '1': 'Completé el programa exitosamente'
            }
        }
        
        url = '/api/cuestionario/responder/post/'
        response = authenticated_client_participante.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert RespuestaCuestionario.objects.filter(
            participante=participante,
            cuestionario=cuestionario_post
        ).exists()

    def test_responder_cuestionario_forbidden_investigador(self, authenticated_client_investigador):
        """Test responder cuestionario como investigador (debe fallar)."""
        data = {
            'respuestas': [
                {
                    'pregunta_id': 1,
                    'respuesta': 'No permitido'
                }
            ]
        }
        
        url = '/api/cuestionario/responder/pre/'
        response = authenticated_client_investigador.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_cuestionario_unauthenticated_endpoints(self, api_client):
        """Test endpoints sin autenticación."""
        urls = [
            '/api/cuestionario/pre/',
            '/api/cuestionario/post/',
            '/api/cuestionario/responder/pre/',
            '/api/cuestionario/responder/post/'
        ]
        
        for url in urls:
            if 'responder' in url:
                response = api_client.post(url, {})
            else:
                response = api_client.get(url)
            assert response.status_code == status.HTTP_401_UNAUTHORIZED 