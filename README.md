# Mindfulness App

Aplicación web para gestionar programas de mindfulness en el contexto de
estudios de investigación: investigadores que diseñan programas con sesiones,
cuestionarios y diarios, y participantes que los siguen desde su cuenta.

## Características

- Gestión de **programas** de mindfulness con sesiones organizadas por semanas.
- Sesiones en distintos formatos: texto, audio y vídeo.
- **Cuestionarios** pre/post programa y **diarios** de autoevaluación tras cada sesión.
- Panel de administración con estadísticas y exportación de resultados.
- Roles diferenciados: administrador, investigador y participante.
- Autenticación con JWT.

## Tecnologías

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Django, Django REST Framework
- **Base de datos**: PostgreSQL
- **Infraestructura**: Docker

## Puesta en marcha

Requiere tener [Docker](https://docs.docker.com/get-docker/) instalado.

```bash
git clone https://github.com/isabelcan7/MindfulnessApp.git
cd MindfulnessApp

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up -d --build
```

- Frontend: http://localhost:3000
- API: http://localhost:8000
- Admin de Django: http://localhost:8000/admin/

Las migraciones se aplican automáticamente al arrancar el backend.

## Tests

```bash
docker compose exec backend pytest
```

## Estructura del proyecto

```
backend/   API Django (REST Framework)
frontend/  Aplicación React
```
