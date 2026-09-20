import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from usuario.models import Participante, Investigador
from config.enums import RoleUsuario

Usuario = get_user_model()

@pytest.mark.django_db
class TestAutenticacionAPI:
    """Tests para la API de autenticación."""

    def test_register_participante_success(self, api_client):
        """Test registro exitoso de participante."""
        data = {
            'username': 'nuevo_participante',
            'email': 'participante@ejemplo.com',
            'password': 'password123',
            'nombre': 'Juan',
            'apellidos': 'Pérez',
            'role': RoleUsuario.PARTICIPANTE,
            'aceptaTerminos': True
        }
        
        url = reverse('register')
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
        assert Usuario.objects.filter(email='participante@ejemplo.com').exists()

    def test_register_investigador_success(self, api_client):
        """Test registro exitoso de investigador."""
        data = {
            'username': 'nuevo_investigador',
            'email': 'investigador@ejemplo.com',
            'password': 'password123',
            'nombre': 'Dra. Ana',
            'apellidos': 'García',
            'role': RoleUsuario.INVESTIGADOR,
            'aceptaTerminos': True
        }
        
        url = reverse('register')
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
        assert Usuario.objects.filter(email='investigador@ejemplo.com').exists()

    def test_register_missing_fields(self, api_client):
        """Test registro con campos faltantes."""
        data = {
            'email': 'incompleto@ejemplo.com',
            'password': 'password123'
        }
        
        url = reverse('register')
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_email_already_exists(self, api_client, participante):
        """Test registro con email que ya existe."""
        data = {
            'username': 'otro_usuario',
            'email': participante.usuario.email,
            'password': 'password123',
            'nombre': 'Otro',
            'apellidos': 'Usuario',
            'role': RoleUsuario.PARTICIPANTE,
            'aceptaTerminos': True
        }
        
        url = reverse('register')
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_username_already_exists(self, api_client, participante):
        """Test registro con username que ya existe."""
        data = {
            'username': participante.usuario.username,
            'email': 'otro_email@ejemplo.com',
            'password': 'password123',
            'nombre': 'Otro',
            'apellidos': 'Usuario',
            'role': RoleUsuario.PARTICIPANTE,
            'aceptaTerminos': True
        }
        
        url = reverse('register')
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['error'] == 'Ya existe un usuario con este nombre de usuario'

    def test_register_error_no_expone_repr_de_drf(self, api_client, participante):
        """Test que los errores de registro llegan como texto legible."""
        data = {
            'username': participante.usuario.username,
            'email': 'otro_email_2@ejemplo.com',
            'password': 'password123',
            'nombre': 'Otro',
            'apellidos': 'Usuario',
            'role': RoleUsuario.PARTICIPANTE,
            'aceptaTerminos': True
        }
        
        url = reverse('register')
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert isinstance(response.data['error'], str)
        assert 'ErrorDetail' not in response.data['error']

    def test_login_success(self, api_client, participante):
        """Test login exitoso."""
        data = {
            'username': participante.usuario.username,
            'password': 'testpassword123'
        }
        
        url = reverse('login')
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data

    def test_login_invalid_credentials(self, api_client, participante):
        """Test login con credenciales inválidas."""
        data = {
            'username': participante.usuario.username,
            'password': 'contraseñaincorrecta'
        }
        
        url = reverse('login')
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'error' in response.data

    def test_login_missing_fields(self, api_client):
        """Test login con campos faltantes."""
        data = {
            'username': 'usuario'
        }
        
        url = reverse('login')
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data

    def test_user_profile_authenticated(self, authenticated_client_participante, participante):
        """Test obtención de perfil de usuario autenticado."""
        url = reverse('user-profile')
        response = authenticated_client_participante.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == participante.usuario.email
        assert response.data['username'] == participante.usuario.username

    def test_user_profile_unauthenticated(self, api_client):
        """Test obtención de perfil sin autenticación."""
        url = reverse('user-profile')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_profile_authenticated(self, authenticated_client_participante, participante):
        """Test actualización de perfil autenticado."""
        data = {
            'nombre': 'Juan Carlos',
            'telefono': '123456789'
        }
        
        url = reverse('update-profile')
        response = authenticated_client_participante.put(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        participante.usuario.refresh_from_db()
        assert participante.usuario.nombre == 'Juan Carlos'
        assert participante.usuario.telefono == '123456789'

    def test_update_profile_unauthenticated(self, api_client):
        """Test actualización de perfil sin autenticación."""
        data = {
            'nombre': 'Nuevo Nombre'
        }
        
        url = reverse('update-profile')
        response = api_client.put(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_change_password_success(self, authenticated_client_participante, participante):
        """Test cambio de contraseña exitoso."""
        data = {
            'old_password': 'testpassword123',
            'new_password': 'nuevapassword123',
            'confirm_password': 'nuevapassword123'
        }
        
        url = reverse('change-password')
        response = authenticated_client_participante.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'message' in response.data
        assert 'access' in response.data
        
        # Verificar que la contraseña cambió
        participante.usuario.refresh_from_db()
        assert participante.usuario.check_password('nuevapassword123')

    def test_change_password_wrong_old_password(self, authenticated_client_participante):
        """Test cambio de contraseña con contraseña anterior incorrecta."""
        data = {
            'old_password': 'contraseñaincorrecta',
            'new_password': 'nuevapassword123',
            'confirm_password': 'nuevapassword123'
        }
        
        url = reverse('change-password')
        response = authenticated_client_participante.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data

    def test_change_password_unauthenticated(self, api_client):
        """Test cambio de contraseña sin autenticación."""
        data = {
            'old_password': 'old123',
            'new_password': 'new123',
            'confirm_password': 'new123'
        }
        
        url = reverse('change-password')
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_delete_account_participante(self, authenticated_client_participante, participante):
        """Test eliminación de cuenta de participante."""
        url = reverse('delete-account')
        response = authenticated_client_participante.delete(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'message' in response.data
        assert not Usuario.objects.filter(id=participante.usuario.id).exists()

    def test_delete_account_investigador_sin_programas(self, authenticated_client_investigador, investigador):
        """Test eliminación de cuenta de investigador sin programas."""
        url = reverse('delete-account')
        response = authenticated_client_investigador.delete(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'message' in response.data
        assert not Usuario.objects.filter(id=investigador.usuario.id).exists()

    def test_delete_account_unauthenticated(self, api_client):
        """Test eliminación de cuenta sin autenticación."""
        url = reverse('delete-account')
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED 