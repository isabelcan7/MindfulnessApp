from datetime import date

from django.db.models import Count, Q
from django.utils import timezone


def edad_de(fecha_nacimiento):
    if not fecha_nacimiento:
        return None
    hoy = date.today()
    return hoy.year - fecha_nacimiento.year - (
        (hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day)
    )


def filtrar_por_texto(queryset, texto, campos):
    if not texto:
        return queryset
    filtro = Q()
    for campo in campos:
        filtro |= Q(**{f'{campo}__icontains': texto})
    return queryset.filter(filtro)


def distribucion(queryset, campo, choices):
    conteos = {
        fila[campo]: fila['total']
        for fila in queryset.values(campo).annotate(total=Count('id'))
    }
    return [
        {'valor': valor, 'label': str(label), 'total': conteos.get(valor, 0)}
        for valor, label in choices
    ]


def meses_recientes(cantidad):
    ahora = timezone.now()
    anio, mes = ahora.year, ahora.month
    periodos = []
    for _ in range(cantidad):
        periodos.append((anio, mes))
        mes -= 1
        if mes == 0:
            anio, mes = anio - 1, 12
    return list(reversed(periodos))


def inicio_de_mes(anio, mes):
    return timezone.now().replace(
        year=anio, month=mes, day=1, hour=0, minute=0, second=0, microsecond=0
    )


def fecha_iso(valor):
    return valor.isoformat() if valor else None
