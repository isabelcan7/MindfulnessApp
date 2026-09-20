from rest_framework import serializers
from .models import Cuestionario, RespuestaCuestionario
from config.enums import TipoPregunta, TipoCuestionario, usa_formato_escala

class CuestionarioSerializer(serializers.ModelSerializer):
    momento_display = serializers.CharField(source='get_momento_display', read_only=True)
    tipo_cuestionario_display = serializers.CharField(source='get_tipo_cuestionario_display', read_only=True)

    class Meta:
        model = Cuestionario
        fields = ['id', 'programa', 'momento', 'momento_display', 'tipo_cuestionario', 'tipo_cuestionario_display', 
                 'titulo', 'descripcion', 'preguntas', 'cuestionario_predefinido',
                 'fecha_creacion', 'fecha_actualizacion']
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']

    def validate_preguntas(self, preguntas):
        if not isinstance(preguntas, list):
            raise serializers.ValidationError("Las preguntas deben ser una lista")

        tipo_cuestionario = self.context.get('tipo_cuestionario', self.initial_data.get('tipo_cuestionario'))

        # Si es un cuestionario Likert, validamos el nuevo formato
        if usa_formato_escala(tipo_cuestionario):
            if len(preguntas) != 1:
                raise serializers.ValidationError("Los cuestionarios Likert deben tener una sola pregunta con etiquetas y textos")
            
            pregunta = preguntas[0]
            if not isinstance(pregunta, dict):
                raise serializers.ValidationError("La pregunta Likert debe ser un objeto")
            
            if 'etiquetas' not in pregunta or 'textos' not in pregunta:
                raise serializers.ValidationError("La pregunta Likert debe contener etiquetas y textos")
            
            if not isinstance(pregunta['etiquetas'], list):
                raise serializers.ValidationError("Las etiquetas deben ser una lista")

            if tipo_cuestionario == TipoCuestionario.LIKERT and len(pregunta['etiquetas']) != 5:
                raise serializers.ValidationError("Las etiquetas deben ser una lista de 5 elementos")

            if not 2 <= len(pregunta['etiquetas']) <= 11:
                raise serializers.ValidationError("La escala debe tener entre 2 y 11 puntos")
            
            if not isinstance(pregunta['textos'], list) or len(pregunta['textos']) == 0:
                raise serializers.ValidationError("Los textos deben ser una lista no vacía")
            
            return preguntas

        # Para otros tipos de cuestionarios, mantenemos la validación original
        for pregunta in preguntas:
            if not isinstance(pregunta, dict):
                raise serializers.ValidationError("Cada pregunta debe ser un objeto")
            
            if 'id' not in pregunta:
                raise serializers.ValidationError("Falta el campo requerido: id")
            
            if 'tipo' not in pregunta:
                raise serializers.ValidationError("Falta el campo requerido: tipo")
            
            if 'texto' not in pregunta:
                raise serializers.ValidationError("Falta el campo requerido: texto")

            if pregunta['tipo'] not in [choice[0] for choice in TipoPregunta.choices]:
                raise serializers.ValidationError(f"Tipo de pregunta inválido: {pregunta['tipo']}")

            if pregunta['tipo'] in ['SELECT', 'CHECKBOX']:
                if 'opciones' not in pregunta:
                    raise serializers.ValidationError("Las preguntas de selección deben incluir opciones")
                if not isinstance(pregunta['opciones'], list) or len(pregunta['opciones']) < 2:
                    raise serializers.ValidationError("Debe haber al menos 2 opciones")

            if pregunta['tipo'] == 'CALIFICACION':
                if 'estrellas' not in pregunta:
                    raise serializers.ValidationError("Las preguntas de calificación deben incluir configuración de estrellas")
                if not isinstance(pregunta['estrellas'], dict):
                    raise serializers.ValidationError("La configuración de estrellas debe ser un objeto")
                if 'cantidad' not in pregunta['estrellas'] or 'icono' not in pregunta['estrellas']:
                    raise serializers.ValidationError("La configuración de estrellas debe incluir cantidad e icono")

        return preguntas

    def validate(self, data):
        tipo_cuestionario = data.get('tipo_cuestionario')
        preguntas = data.get('preguntas', [])

        if usa_formato_escala(tipo_cuestionario):
            if len(preguntas) == 0:
                raise serializers.ValidationError("El cuestionario Likert debe tener al menos una pregunta")
            return data

        # Para otros tipos de cuestionarios, mantenemos la validación original
        if not preguntas:
            raise serializers.ValidationError("El cuestionario debe tener al menos una pregunta")

        return data

class RespuestaCuestionarioSerializer(serializers.ModelSerializer):
    participante_nombre = serializers.SerializerMethodField()
    cuestionario_titulo = serializers.SerializerMethodField()

    class Meta:
        model = RespuestaCuestionario
        fields = ['id', 'cuestionario', 'participante', 'participante_nombre', 'cuestionario_titulo', 
                 'respuestas', 'fecha_respuesta']
        read_only_fields = ['fecha_respuesta']

    def get_participante_nombre(self, obj):
        return f"{obj.participante.usuario.nombre} {obj.participante.usuario.apellidos}"

    def get_cuestionario_titulo(self, obj):
        return obj.cuestionario.titulo

    def validate(self, data):
        # Verificar que el participante no haya respondido este cuestionario antes
        if RespuestaCuestionario.objects.filter(
            cuestionario=data['cuestionario'],
            participante=data['participante']
        ).exists():
            raise serializers.ValidationError(
                "Este participante ya ha respondido este cuestionario"
            )

        # Validar que las respuestas coincidan con las preguntas del cuestionario
        cuestionario = data['cuestionario']
        respuestas = data['respuestas']

        # Si es un cuestionario Likert, validamos el formato especial
        if usa_formato_escala(cuestionario.tipo_cuestionario):
            if not isinstance(respuestas, list):
                raise serializers.ValidationError("Las respuestas deben ser una lista para cuestionarios Likert")
            
            if len(respuestas) != len(cuestionario.preguntas[0]['textos']):
                raise serializers.ValidationError(
                    f"El número de respuestas ({len(respuestas)}) no coincide con el número de preguntas ({len(cuestionario.preguntas[0]['textos'])})"
                )
            
            puntos_escala = len(cuestionario.preguntas[0]['etiquetas'])
            if not all(isinstance(r, int) and 1 <= r <= puntos_escala for r in respuestas):
                raise serializers.ValidationError(
                    f"Todas las respuestas deben ser números entre 1 y {puntos_escala}"
                )
            
            return data

        # Para otros tipos de cuestionarios, mantenemos la validación original
        preguntas = cuestionario.preguntas

        for pregunta in preguntas:
            pregunta_id = str(pregunta['id'])
            if pregunta_id not in respuestas:
                raise serializers.ValidationError(
                    f"Falta la respuesta para la pregunta {pregunta_id}"
                )

            respuesta = respuestas[pregunta_id]
            tipo = pregunta['tipo']

            # Validar el tipo de respuesta según el tipo de pregunta
            if tipo == TipoPregunta.TEXTO:
                if not isinstance(respuesta, str):
                    raise serializers.ValidationError(
                        f"La respuesta para la pregunta {pregunta_id} debe ser texto"
                    )
            elif tipo in [TipoPregunta.SELECT, TipoPregunta.CHECKBOX]:
                if tipo == TipoPregunta.SELECT:
                    if not isinstance(respuesta, str):
                        raise serializers.ValidationError(
                            f"La respuesta para la pregunta {pregunta_id} debe ser una opción válida"
                        )
                    if respuesta not in pregunta['opciones']:
                        raise serializers.ValidationError(
                            f"La respuesta para la pregunta {pregunta_id} no es una opción válida"
                        )
                else:  # CHECKBOX
                    if not isinstance(respuesta, list):
                        raise serializers.ValidationError(
                            f"La respuesta para la pregunta {pregunta_id} debe ser una lista de opciones"
                        )
                    if not all(opcion in pregunta['opciones'] for opcion in respuesta):
                        raise serializers.ValidationError(
                            f"La respuesta para la pregunta {pregunta_id} contiene opciones no válidas"
                        )
            elif tipo == TipoPregunta.CALIFICACION:
                if not isinstance(respuesta, (int, float)):
                    raise serializers.ValidationError(
                        f"La respuesta para la pregunta {pregunta_id} debe ser un número"
                    )
                if not 1 <= respuesta <= pregunta['estrellas']['cantidad']:
                    raise serializers.ValidationError(
                        f"La respuesta para la pregunta {pregunta_id} debe estar entre 1 y {pregunta['estrellas']['cantidad']}"
                    )

        return data
