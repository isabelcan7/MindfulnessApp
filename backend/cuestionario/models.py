from django.db import models
from programa.models import Programa
from django.utils import timezone
from django.core.exceptions import ValidationError
from usuario.models import Participante
from config.enums import MomentoCuestionario, TipoCuestionario

class Cuestionario(models.Model):
    programa = models.ForeignKey(
        Programa, 
        on_delete=models.CASCADE, 
        related_name='cuestionarios',
        db_column='programa_id'
    )
    momento = models.CharField(
        max_length=50,
        choices=MomentoCuestionario.choices,
        default=MomentoCuestionario.PRE
    )
    tipo_cuestionario = models.CharField(
        max_length=50,
        choices=TipoCuestionario.choices,
        default=TipoCuestionario.PERSONALIZADO
    )
    cuestionario_predefinido = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(default='Sin descripción')
    preguntas = models.JSONField(default=list)
    fecha_creacion = models.DateTimeField(default=timezone.now)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def clean(self):
        # Verificar que no exista otro cuestionario del mismo momento para este programa
        if Cuestionario.objects.filter(programa=self.programa, momento=self.momento).exclude(pk=self.pk).exists():
            raise ValidationError(
                f'Ya existe un cuestionario del momento {self.get_momento_display()} para este programa'
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        unique_together = ['programa', 'momento']
        verbose_name = 'Cuestionario'
        verbose_name_plural = 'Cuestionarios'
        db_table = 'cuestionario_cuestionario'

    def __str__(self):
        return f"{self.titulo} - {self.get_momento_display()}"

    def get_momento_display(self):
        return dict(MomentoCuestionario.choices).get(self.momento, self.momento)

    def get_tipo_cuestionario_display(self):
        return dict(TipoCuestionario.choices).get(self.tipo_cuestionario, self.tipo_cuestionario)

class RespuestaCuestionario(models.Model):
    cuestionario = models.ForeignKey(
        Cuestionario, 
        on_delete=models.CASCADE, 
        related_name='respuestas'
    )
    participante = models.ForeignKey(
        Participante, 
        on_delete=models.CASCADE, 
        related_name='respuestas_cuestionario'
    )
    respuestas = models.JSONField(default=dict)
    fecha_respuesta = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['cuestionario', 'participante']
        verbose_name = 'Respuesta de Cuestionario'
        verbose_name_plural = 'Respuestas de Cuestionarios'
        db_table = 'cuestionario_respuestacuestionario'

    def __str__(self):
        return f"Respuesta de {self.participante} a {self.cuestionario}"
