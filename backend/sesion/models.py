from django.db import models
from programa.models import Programa, InscripcionPrograma, EstadoInscripcion
from usuario.models import Participante
from django.utils import timezone
from config.enums import EtiquetaPractica, TipoContenido, Escala

class Sesion(models.Model):
    programa = models.ForeignKey(Programa, on_delete=models.CASCADE, related_name='sesiones')
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    semana = models.PositiveIntegerField(help_text='Número de semana en el programa')
    duracion_estimada = models.PositiveIntegerField(blank=True, help_text='Duración estimada en minutos', null=True)
    tipo_practica = models.CharField(
        max_length=50,
        choices=EtiquetaPractica.choices,
        default=EtiquetaPractica.BREATH
    )
    tipo_contenido = models.CharField(
        max_length=50,
        choices=TipoContenido.choices,
        default=TipoContenido.TEMPORIZADOR
    )
    tipo_escala = models.CharField(
        max_length=50,
        choices=Escala.choices,
        default=Escala.ESTADO_EMOCIONAL,
        null=True,
        blank=True
    )
    contenido_temporizador = models.PositiveIntegerField(blank=True, null=True, help_text="Duración del temporizador en minutos")
    contenido_url = models.URLField(blank=True, null=True, help_text="URL para contenido externo o cargado")
    contenido_audio = models.FileField(upload_to='audio/', blank=True, null=True, help_text="Archivo de audio")
    contenido_video = models.FileField(upload_to='video/', blank=True, null=True, help_text="Archivo de video")
    video_fondo = models.CharField(max_length=100, blank=True, null=True, help_text="Nombre del video de fondo para el temporizador")
    
    class Meta:
        ordering = ['programa', 'semana']
        unique_together = ['programa', 'semana']
    
    def __str__(self):
        return f"{self.programa.nombre} - Semana {self.semana}: {self.titulo}"
    
    def get_tipo_practica_display(self):
        return dict(EtiquetaPractica.choices).get(self.tipo_practica, self.tipo_practica)
    
    def get_tipo_contenido_display(self):
        return dict(TipoContenido.choices).get(self.tipo_contenido, self.tipo_contenido)
    
    def esta_disponible_para(self, usuario):
        """Verifica si la sesión está disponible para un usuario."""
        participante = getattr(usuario, 'perfil_participante', None)
        if participante is None:
            return False

        # Verificar si el usuario está inscrito en el programa
        inscripcion = InscripcionPrograma.objects.filter(
            participante=participante,
            programa=self.programa,
            estado_inscripcion=EstadoInscripcion.EN_PROGRESO
        ).first()
        
        if not inscripcion:
            return False
            
        # Calcular la fecha de inicio de la semana
        fecha_inicio_semana = inscripcion.fecha_inicio + timezone.timedelta(weeks=self.semana-1)
        fecha_fin_semana = fecha_inicio_semana + timezone.timedelta(weeks=1)
        
        # Verificar si estamos en la semana correcta
        ahora = timezone.now()
        if not (fecha_inicio_semana <= ahora <= fecha_fin_semana):
            return False
            
        # Verificar si ya existe un diario para esta sesión
        if DiarioSesion.objects.filter(participante=participante, sesion=self).exists():
            return False
            
        # Verificar si la sesión anterior está completada
        if self.semana > 1:
            sesion_anterior = Sesion.objects.filter(
                programa=self.programa,
                semana=self.semana - 1
            ).first()
            
            if sesion_anterior:
                diario_anterior = DiarioSesion.objects.filter(
                    participante=participante,
                    sesion=sesion_anterior
                ).exists()
                
                if not diario_anterior:
                    return False
        
        return True


class DiarioSesion(models.Model):
    participante = models.ForeignKey(Participante, on_delete=models.CASCADE, related_name='diarios')
    sesion = models.ForeignKey(Sesion, on_delete=models.CASCADE, related_name='diarios')
    valoracion = models.FloatField()  # Usamos float por si hay escalas decimales en el futuro
    comentario = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('participante', 'sesion')
        ordering = ['sesion__semana', 'fecha_creacion']

    def __str__(self):
        return f"Diario de {self.participante.usuario.nombre} {self.participante.usuario.apellidos} en Semana {self.sesion.semana}"
