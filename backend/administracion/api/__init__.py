from .resumen import admin_resumen
from .usuarios import (
    admin_usuarios,
    admin_investigadores,
    admin_participantes,
    admin_usuario_detalle,
)
from .programas import admin_programas, admin_inscripciones
from .exportacion import admin_exportar

__all__ = [
    'admin_resumen',
    'admin_usuarios',
    'admin_investigadores',
    'admin_participantes',
    'admin_usuario_detalle',
    'admin_programas',
    'admin_inscripciones',
    'admin_exportar',
]
