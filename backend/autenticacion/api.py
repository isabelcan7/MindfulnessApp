from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
from usuario.serializers import (
    UsuarioSerializer, 
    UpdateUsuarioSerializer, 
    RegisterSerializer,
    ChangePasswordSerializer
)
from programa.models import Programa
from config.enums import EstadoPublicacion

class AuthAnonRateThrottle(AnonRateThrottle):
    rate = '5/minute'  # 5 intentos por minuto para usuarios anónimos

class AuthUserRateThrottle(UserRateThrottle):
    rate = '20/minute'  # 20 intentos por minuto para usuarios autenticados

Usuario = get_user_model()


def mensaje_de_error(exc):
    detalle = getattr(exc, 'detail', exc)
    while isinstance(detalle, (dict, list, tuple)):
        if isinstance(detalle, dict):
            if not detalle:
                return 'Error de validacion'
            detalle = next(iter(detalle.values()))
        else:
            if not detalle:
                return 'Error de validacion'
            detalle = detalle[0]
    return str(detalle)

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthAnonRateThrottle])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        try:
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UsuarioSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        except DRFValidationError as e:
            return Response({'error': mensaje_de_error(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response(
                {'error': 'No se ha podido completar el registro'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(
        {'error': mensaje_de_error(serializer.errors), 'errors': serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthAnonRateThrottle])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Por favor proporcione nombre de usuario y contraseña'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if not user:
        return Response(
            {'error': 'El nombre de usuario o la contraseña no son correctos'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UsuarioSerializer(user).data
    })

    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    serializer = UsuarioSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UpdateUsuarioSerializer(request.user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(
        {'error': mensaje_de_error(serializer.errors), 'errors': serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AuthUserRateThrottle])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    
    if serializer.is_valid():
        user = request.user
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        # Verificar la contraseña actual
        if not user.check_password(old_password):
            return Response(
                {'error': 'La contraseña actual no es correcta'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cambiar la contraseña
        user.set_password(new_password)
        user.save()
        
        # Generar nuevo token
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Contraseña actualizada exitosamente',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UsuarioSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    return Response(
        {'error': mensaje_de_error(serializer.errors), 'errors': serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    
    try:
        # Si es investigador, verificar si tiene programas publicados
        if user.is_investigador():
            programas_publicados = Programa.objects.filter(
                creado_por=user.perfil_investigador,
                estado_publicacion=EstadoPublicacion.PUBLICADO
            ).exists()
            
            if programas_publicados:
                return Response(
                    {'error': 'No puedes eliminar tu cuenta mientras tengas programas publicados'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Eliminar programas en borrador
            Programa.objects.filter(
                creado_por=user.perfil_investigador,
                estado_publicacion=EstadoPublicacion.BORRADOR
            ).delete()
        
        # Eliminar el usuario
        user.delete()
        
        return Response(
            {'message': 'Cuenta eliminada exitosamente'},
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {'error': 'Error al eliminar la cuenta'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 