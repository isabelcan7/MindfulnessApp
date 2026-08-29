import pytest
from django.urls import reverse
from rest_framework import status
from programa.models import Programa, InscripcionPrograma
from sesion.models import DiarioSesion
from cuestionario.models import RespuestaCuestionario
from config.enums import EstadoInscripcion, EstadoPublicacion, RoleUsuario

@pytest.fixture
def programa_activo(programa_publicado):
    Programa.objects.filter(id=programa_publicado.id).update(
        estado_publicacion=EstadoPublicacion.PUBLICADO
    )
    programa_publicado.refresh_from_db()
    return programa_publicado

@pytest.fixture
def inscripcion(programa_activo, participante):
    return InscripcionPrograma.objects.create(
        programa=programa_activo,
        participante=participante,
        estado_inscripcion=EstadoInscripcion.EN_PROGRESO
    )

@pytest.mark.django_db
class TestAdministracionResumenAPI:

    def test_resumen_success_admin(self, authenticated_client_admin, investigador, participante, programa_activo):
        url = reverse('admin-resumen')
        response = authenticated_client_admin.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['usuarios']['investigadores'] == 1
        assert response.data['usuarios']['participantes'] == 1
        assert response.data['usuarios']['administradores'] == 1
        assert response.data['programas']['publicados'] == 1
        assert isinstance(response.data['registros_por_mes'], list)
        assert isinstance(response.data['top_programas'], list)
        assert isinstance(response.data['demografia']['genero'], list)

    def test_resumen_inscripciones_y_actividad(self, authenticated_client_admin, inscripcion, sesion, participante):
        DiarioSesion.objects.create(participante=participante, sesion=sesion, valoracion=4)

        url = reverse('admin-resumen')
        response = authenticated_client_admin.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['inscripciones']['total'] == 1
        assert response.data['inscripciones']['en_progreso'] == 1
        assert response.data['actividad']['diarios_completados'] == 1

    def test_resumen_forbidden_investigador(self, authenticated_client_investigador):
        url = reverse('admin-resumen')
        response = authenticated_client_investigador.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_resumen_forbidden_participante(self, authenticated_client_participante):
        url = reverse('admin-resumen')
        response = authenticated_client_participante.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_resumen_unauthenticated(self, api_client):
        url = reverse('admin-resumen')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
class TestAdministracionUsuariosAPI:

    def test_usuarios_list_success_admin(self, authenticated_client_admin, investigador, participante):
        url = reverse('admin-usuarios')
        response = authenticated_client_admin.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
        assert all('role_display' in usuario for usuario in response.data)

    def test_usuarios_list_filtro_role(self, authenticated_client_admin, investigador, participante):
        url = reverse('admin-usuarios')
        response = authenticated_client_admin.get(url, {'role': RoleUsuario.PARTICIPANTE})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['role'] == RoleUsuario.PARTICIPANTE

    def test_usuarios_list_filtro_search(self, authenticated_client_admin, investigador, participante):
        url = reverse('admin-usuarios')
        response = authenticated_client_admin.get(url, {'search': 'participante@test.com'})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['email'] == 'participante@test.com'

    def test_investigadores_list_success_admin(self, authenticated_client_admin, investigador, programa_activo, inscripcion):
        url = reverse('admin-investigadores')
        response = authenticated_client_admin.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['total_programas'] == 1
        assert response.data[0]['programas_publicados'] == 1
        assert response.data[0]['total_inscritos'] == 1

    def test_participantes_list_success_admin(self, authenticated_client_admin, participante, inscripcion, sesion):
        DiarioSesion.objects.create(participante=participante, sesion=sesion, valoracion=5)

        url = reverse('admin-participantes')
        response = authenticated_client_admin.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id_anonimo'] == f'P{participante.id}'
        assert response.data[0]['total_inscripciones'] == 1
        assert response.data[0]['sesiones_completadas'] == 1

    def test_participantes_list_filtro_sin_inscripciones(self, authenticated_client_admin, participante):
        url = reverse('admin-participantes')
        response = authenticated_client_admin.get(url, {'actividad': 'sin_inscripciones'})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['total_inscripciones'] == 0

    def test_usuario_detalle_investigador(self, authenticated_client_admin, investigador, programa_activo):
        url = reverse('admin-usuario-detalle', kwargs={'pk': investigador.usuario_id})
        response = authenticated_client_admin.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['role'] == RoleUsuario.INVESTIGADOR
        assert len(response.data['perfil_investigador']['programas']) == 1

    def test_usuario_detalle_participante(self, authenticated_client_admin, participante, inscripcion):
        url = reverse('admin-usuario-detalle', kwargs={'pk': participante.usuario_id})
        response = authenticated_client_admin.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['role'] == RoleUsuario.PARTICIPANTE
        assert len(response.data['perfil_participante']['inscripciones']) == 1

    def test_investigadores_list_forbidden_investigador(self, authenticated_client_investigador):
        url = reverse('admin-investigadores')
        response = authenticated_client_investigador.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_participantes_list_forbidden_participante(self, authenticated_client_participante):
        url = reverse('admin-participantes')
        response = authenticated_client_participante.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
class TestAdministracionProgramasAPI:

    def test_programas_list_success_admin(self, authenticated_client_admin, programa_borrador, programa_activo, inscripcion):
        url = reverse('admin-programas')
        response = authenticated_client_admin.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
        publicado = next(p for p in response.data if p['id'] == programa_activo.id)
        assert publicado['inscritos'] == 1
        assert publicado['investigador']['email'] == 'investigador@test.com'

    def test_programas_list_filtro_estado(self, authenticated_client_admin, programa_borrador, programa_activo):
        url = reverse('admin-programas')
        response = authenticated_client_admin.get(url, {'estado': 'publicado'})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == programa_activo.id

    def test_inscripciones_list_success_admin(self, authenticated_client_admin, inscripcion, participante, programa_activo):
        url = reverse('admin-inscripciones')
        response = authenticated_client_admin.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['participante']['email'] == participante.usuario.email
        assert response.data[0]['programa']['id'] == programa_activo.id
        assert response.data[0]['estado'] == EstadoInscripcion.EN_PROGRESO

    def test_inscripciones_progreso(self, authenticated_client_admin, inscripcion, participante, sesion, programa_activo):
        sesion.programa = programa_activo
        sesion.save()
        DiarioSesion.objects.create(participante=participante, sesion=sesion, valoracion=3)

        url = reverse('admin-inscripciones')
        response = authenticated_client_admin.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]['sesiones_completadas'] == 1
        assert response.data[0]['total_sesiones'] == 1
        assert response.data[0]['progreso'] == 100.0

    def test_inscripciones_cuestionario_respondido(self, authenticated_client_admin, inscripcion, participante, programa_activo, cuestionario_pre):
        Programa.objects.filter(id=programa_activo.id).update(cuestionario_pre=cuestionario_pre)
        RespuestaCuestionario.objects.create(
            cuestionario=cuestionario_pre,
            participante=participante,
            respuestas={'1': 'bien'}
        )

        url = reverse('admin-inscripciones')
        response = authenticated_client_admin.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]['cuestionario_pre_respondido'] is True
        assert response.data[0]['cuestionario_post_respondido'] is False

    def test_programas_list_forbidden_investigador(self, authenticated_client_investigador):
        url = reverse('admin-programas')
        response = authenticated_client_investigador.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
class TestAdministracionExportacionAPI:

    def test_exportar_usuarios_success_admin(self, authenticated_client_admin, investigador, participante):
        url = reverse('admin-exportar')
        response = authenticated_client_admin.get(url, {'tipo': 'usuarios'})

        assert response.status_code == status.HTTP_200_OK
        assert 'text/csv' in response['Content-Type']
        assert 'attachment' in response['Content-Disposition']
        assert 'investigador@test.com' in response.content.decode('utf-8')

    def test_exportar_inscripciones_success_admin(self, authenticated_client_admin, inscripcion):
        url = reverse('admin-exportar')
        response = authenticated_client_admin.get(url, {'tipo': 'inscripciones'})

        assert response.status_code == status.HTTP_200_OK
        assert 'Programa Publicado Test' in response.content.decode('utf-8')

    def test_exportar_tipo_invalido(self, authenticated_client_admin):
        url = reverse('admin-exportar')
        response = authenticated_client_admin.get(url, {'tipo': 'inventado'})

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_exportar_forbidden_participante(self, authenticated_client_participante):
        url = reverse('admin-exportar')
        response = authenticated_client_participante.get(url, {'tipo': 'usuarios'})

        assert response.status_code == status.HTTP_403_FORBIDDEN
