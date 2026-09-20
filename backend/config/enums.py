from django.db import models
from django.utils.translation import gettext_lazy as _

# Enums de Usuario
class RoleUsuario(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrador'
    INVESTIGADOR = 'INVESTIGADOR', 'Investigador'
    PARTICIPANTE = 'PARTICIPANTE', 'Participante'

class Genero(models.TextChoices):
    MASCULINO = 'masculino', _('Masculino')
    FEMENINO = 'femenino', _('Femenino')
    TRANSGENERO = 'transgenero', _('Transgenero')
    NO_BINARIO = 'no_binario', _('No binario')
    OTRO = 'otro', _('Otro')
    PREFIERO_NO_DECIR = 'prefiero_no_decir', _('Prefiero no decir')

class NivelEducativo(models.TextChoices):
    SIN_ESTUDIOS = 'sin_estudios', _('Sin Estudios')
    PRIMARIA = 'primaria', _('Primaria')
    SECUNDARIA = 'secundaria', _('Secundaria')
    BACHILLERATO = 'bachillerato', _('Bachillerato')
    FP = 'fp', _('Formación Profesional')
    UNIVERSIDAD = 'universidad', _('Universidad')
    MASTER = 'master', _('Master')
    DOCTORADO = 'doctorado', _('Doctorado')
    OTROS = 'otros', _('Otros')

class ExperienciaMindfulness(models.TextChoices):
    NINGUNA = 'ninguna', _('Ninguna')
    MENOS_6_MESES = 'menos_6_meses', _('Menos de 6 meses')
    ENTRE_6_12_MESES = 'entre_6_12_meses', _('6 meses - 1 año')
    ENTRE_1_2_ANOS = 'entre_1_2_anos', _('1 - 2 años')
    ENTRE_2_10_ANOS = 'entre_2_10_anos', _('2 - 10 años')
    MAS_10_ANOS = 'mas_10_anos', _('Más de 10 años')

class ExperienciaInvestigacion(models.TextChoices):
    SI = 'si', _('Sí')
    NO = 'no', _('No')
    EN_PARTE = 'en_parte', _('En parte')

# Enums de Programa
class TipoContexto(models.TextChoices):
    ACADEMICO = 'académico', 'Académico'
    LABORAL = 'laboral', 'Laboral'
    CLINICO = 'clínico', 'Clínico/Terapéutico'
    DEPORTIVO = 'deportivo', 'Deportivo'
    CRECIMIENTO_PERSONAL = 'crecimiento_personal', 'Crecimiento Personal'
    OTRO = 'otro', 'Otro'

class EnfoqueMetodologico(models.TextChoices):
    MBSR = 'MBSR', 'MBSR (Mindfulness-Based Stress Reduction)'
    MBCT = 'MBCT', 'MBCT (Mindfulness-Based Cognitive Therapy)'
    MSC = 'MSC', 'MSC (Mindful Self-Compassion)'
    MBRP = 'MBRP', 'MBRP (Mindfulness-Based Relapse Prevention)'
    MBPM = 'MBPM', 'MBPM (Mindfulness-Based Pain Management)'
    PROPIO = 'propio', 'Enfoque propio'
    OTRO = 'otro', 'Otro'

class EstadoPublicacion(models.TextChoices):
    BORRADOR = 'borrador', 'Borrador'
    PUBLICADO = 'publicado', 'Publicado'

class EstadoInscripcion(models.TextChoices):
    EN_PROGRESO = 'en_progreso', 'En progreso'
    COMPLETADO = 'completado', 'Completado'
    ABANDONADO = 'abandonado', 'Abandonado'

# Enums de Sesión
class EtiquetaPractica(models.TextChoices):
    BREATH = 'breath', 'Atención a la Respiración'
    SOUNDS = 'sounds', 'Atención a los Sonidos'
    VISUAL_OBJECT = 'visual_object', 'Atención a un Objeto visual'
    SENSES = 'senses', 'Atención a los Sentidos'
    OPEN_AWARENESS = 'open_awareness', 'Conciencia Abierta'
    LOVING_KINDNESS = 'loving_kindness', 'Loving Kindness (Bondad Amorosa)'
    BODY_SCAN = 'body_scan', 'Escaneo Corporal'
    SELF_COMPASSION = 'self_compassion', 'Auto-compasión'
    MINDFUL_MOVEMENT = 'mindful_movement', 'Movimiento Consciente'
    OTRO = 'otro', 'Otro'

class TipoContenido(models.TextChoices):
    TEMPORIZADOR = 'temporizador', 'Temporizador'
    ENLACE = 'enlace', 'Enlace'
    AUDIO = 'audio', 'Audio'
    VIDEO = 'video', 'Video'

class Escala(models.TextChoices):
    ESTADO_EMOCIONAL = 'estado_emocional', '¿Cómo te sientes emocionalmente en este momento? [1–5]'
    ESTRES_ACTUAL = 'estres_actual', '¿Cuánto estrés sientes ahora mismo? [0–10]'
    BIENESTAR_GENERAL = 'bienestar_general', '¿Cómo valoras tu bienestar general ahora mismo? [0–10]'
    UTILIDAD_SESION = 'utilidad_sesion', '¿Cuánto te ha servido esta sesión de mindfulness? [1–5]'
    CLARIDAD_MENTAL = 'claridad_mental', '¿Cuánta claridad mental sientes ahora mismo? [1–5]'
    PRESENCIA = 'presencia', '¿Qué tan presente te sientes en este momento? [1–5]'

# Enums de Cuestionario
class MomentoCuestionario(models.TextChoices):
    PRE = 'pre', 'Pre'
    POST = 'post', 'Post'

class TipoCuestionario(models.TextChoices):
    PERSONALIZADO = 'personalizado', 'Personalizado'
    LIKERT = 'likert', 'Escala Likert'
    PREDEFINIDO = 'predefinido', 'Predefinido'

def usa_formato_escala(tipo_cuestionario):
    return tipo_cuestionario in (TipoCuestionario.LIKERT, TipoCuestionario.PREDEFINIDO)

class TipoPregunta(models.TextChoices):
    TEXTO = 'texto', 'Texto Libre'
    SELECT = 'select', 'Selección Única'
    CHECKBOX = 'checkbox', 'Múltiple Opción'
    CALIFICACION = 'calificacion', 'Calificación'
