from pathlib import Path

from rest_framework import serializers

MB = 1024 * 1024

MAX_TAMANO_AUDIO = 25 * MB
MAX_TAMANO_VIDEO = 200 * MB

EXTENSIONES_AUDIO = ('.mp3', '.m4a', '.ogg')
EXTENSIONES_VIDEO = ('.mp4', '.webm')

TIPOS_MIME_AUDIO = (
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'audio/ogg',
    'application/ogg',
)
TIPOS_MIME_VIDEO = (
    'video/mp4',
    'video/webm',
)


def validar_archivo(archivo, extensiones, tipos_mime, max_tamano):
    if not archivo:
        return archivo

    if archivo.size > max_tamano:
        raise serializers.ValidationError(
            f'El archivo pesa {archivo.size / MB:.1f} MB y el maximo permitido '
            f'son {max_tamano // MB} MB.'
        )

    extension = Path(archivo.name or '').suffix.lower()
    if extension not in extensiones:
        raise serializers.ValidationError(
            f'Formato "{extension or "sin extension"}" no permitido. '
            f'Formatos aceptados: {", ".join(extensiones)}.'
        )

    tipo_mime = (getattr(archivo, 'content_type', '') or '').lower()
    if tipo_mime and tipo_mime not in tipos_mime:
        raise serializers.ValidationError(
            f'El tipo de contenido "{tipo_mime}" no corresponde a un archivo '
            f'{", ".join(extensiones)}.'
        )

    return archivo


def validar_audio(archivo):
    return validar_archivo(archivo, EXTENSIONES_AUDIO, TIPOS_MIME_AUDIO, MAX_TAMANO_AUDIO)


def validar_video(archivo):
    return validar_archivo(archivo, EXTENSIONES_VIDEO, TIPOS_MIME_VIDEO, MAX_TAMANO_VIDEO)
