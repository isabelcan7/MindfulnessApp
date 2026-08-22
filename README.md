# Mindfulness App

Proyecto **fullstack** para una aplicación de mindfulness: frontend en **React**
+ **Vite** + **Tailwind CSS**, backend en **Django** + **PostgreSQL**.

- `/backend`: API Django
- `/frontend`: Aplicación React (JSX)
- `docker-compose.yml`: entorno de desarrollo
- `docker-compose.prod.yml`: entorno de despliegue

---

## Requisitos

- **Node.js** v18 o superior
- **Python 3.12 o 3.13**

  > ⚠️ No uses Python 3.14: las versiones de `numpy` y `pandas` fijadas en
  > `requirements.txt` no publican wheels para 3.14 y la instalación falla.

- **Docker**, para la base de datos. (Si prefieres un PostgreSQL nativo, sáltate
  el paso 2 y apunta las variables `DB_*` de `backend/.env` a tu instancia.)

---

## Puesta en marcha

### 1. Clona el repositorio

```bash
git clone https://github.com/isacancor/MindfulnessApp.git
cd MindfulnessApp
```

### 2. Levanta la base de datos

```bash
cp backend/.env.example backend/.env
docker compose up -d
```

Arranca PostgreSQL 16 en `localhost:5432`. Espera a que `docker compose ps` la
marque como `healthy` antes de seguir.

`docker compose stop` / `start` la apagan y encienden conservando los datos;
`down -v` los borra para empezar de cero.

> Si cambias las credenciales de `backend/.env`, añade `--env-file backend/.env`
> a los comandos de compose para que el contenedor y Django lean las mismas.
> Con los valores por defecto no hace falta.

### 3. Configura el backend (Django)

```bash
cd backend
python3.13 -m venv venv
source venv/bin/activate   # venv\Scripts\activate en Windows
pip install -r requirements.txt
```

Genera una `SECRET_KEY` propia y ponla en `backend/.env`. Es la clave con la que
se firman los JWT, así que no reutilices la del `.env.example`:

```bash
python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"
```

Aplica migraciones y puebla la base de datos con datos de prueba:

```bash
python manage.py migrate
python populate_db.py
```

> Las migraciones están versionadas, así que **no ejecutes `makemigrations`**: no
> hay cambios pendientes y solo generaría migraciones espurias. Úsalo únicamente
> si modificas los modelos.

Levanta el servidor:

```bash
python manage.py runserver
```

Backend en `http://localhost:8000`, admin de Django en `/admin/`.

### 4. Configura el frontend (React + Vite)

En otra terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend en `http://localhost:3000`.

---

## Arrancar en sesiones posteriores

```bash
docker compose start
cd backend && source venv/bin/activate && python manage.py runserver
cd frontend && npm run dev    # en otra terminal
```

---

## Todo en Docker (opcional)

El flujo recomendado para el día a día es el de arriba: la base de datos en
Docker y el código nativo, porque el depurador y el reload van más directos. Pero
si prefieres no instalar Python ni Node, el perfil `full` levanta las tres piezas:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose --profile full up -d --build
```

Mismas URLs (`:3000` y `:8000`) y el hot-reload funciona en ambos: el código va
montado como volumen. La primera vez tarda en construir las imágenes.

```bash
docker compose --profile full logs -f          # ver logs
docker compose --profile full down             # parar todo
docker compose exec backend python manage.py migrate
docker compose exec backend python populate_db.py
```

Ojo: con el código en un contenedor, cualquier comando de Django se prefija con
`docker compose exec backend`.

---

## Despliegue

`docker-compose.prod.yml` define el stack de producción. Se diferencia del de
desarrollo en cosas que importan:

| | Desarrollo | Producción |
| --- | --- | --- |
| Servidor Django | `runserver` | **gunicorn**, 3 workers |
| Frontend | Vite dev server | build estático servido por **nginx** |
| Estáticos y media | los sirve Django | los sirve nginx desde volúmenes |
| `DEBUG` | `True` | `False` |
| Puertos expuestos | 3000, 8000, 5432 | solo el 80 |

nginx es el único punto de entrada: sirve el frontend y hace de proxy a `/api/`
y `/admin/`. Por eso el frontend usa **rutas relativas** y no necesita conocer
el dominio al construirse.

### Pasos

1. En el servidor, con Docker instalado, clona el repositorio.

2. Crea el fichero de entorno **en la raíz** del repo:

   ```bash
   cp .env.prod.example .env
   ```

   Rellena todos los valores. Compose lee este `.env` automáticamente, sin flags.
   Genera una `SECRET_KEY` nueva y una `DB_PASSWORD` larga y aleatoria — no
   reutilices las de desarrollo.

3. Levanta el stack:

   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

   El contenedor del backend, al arrancar, espera a la base de datos, recolecta
   los estáticos y **aplica las migraciones** solo. No hay que hacerlo a mano.

4. Crea tu usuario administrador:

   ```bash
   docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
   ```

   > ⚠️ **No ejecutes `populate_db.py` en producción**: borra todos los datos de
   > la base de datos antes de insertar los de prueba.

5. Para actualizar tras un cambio de código:

   ```bash
   git pull && docker compose -f docker-compose.prod.yml up -d --build
   ```

### HTTPS

Con datos de personas reales, HTTPS no es opcional: sin él las contraseñas y los
tokens JWT viajan en claro. El stack sirve HTTP por el puerto 80 y espera un
proxy inverso por delante que termine TLS. Las dos vías habituales:

- Un proxy con certificados automáticos de Let's Encrypt (Caddy o Traefik)
  delante del stack.
- El proxy que ya te da la plataforma, si despliegas en un PaaS.

Una vez tengas HTTPS, pon `SECURE_SSL=True` en el `.env`: activa la redirección a
HTTPS, HSTS y las cookies seguras. **Actívalo solo cuando el HTTPS funcione**, o
entrarás en un bucle de redirecciones.

### Copias de seguridad

Los datos de los participantes viven en el volumen `pgdata`. Si lo pierdes, no
hay vuelta atrás y el estudio se va contigo. Antes de empezar a reclutar gente,
asegúrate de tener copias automáticas y de **haber probado una restauración**.

```bash
# Volcado manual
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "$DB_USER" "$DB_NAME" | gzip > backup-$(date +%F).sql.gz
```

Los ficheros de audio y vídeo subidos viven en el volumen `media`, e igualmente
necesitan copia. Si tu proveedor te ofrece PostgreSQL gestionado con backups
automáticos, úsalo en vez del contenedor de `postgres`: apunta las variables
`DB_*` a él y borra ese servicio del compose.

### Antes de un estudio con personas

La app almacena datos personales de los participantes (nombre, email, fecha de
nacimiento, género, ubicación, ocupación) y sus respuestas a cuestionarios y
diarios de sesión. Antes de reclutar a nadie:

- [ ] HTTPS funcionando y `SECURE_SSL=True`.
- [ ] `SECRET_KEY` y `DB_PASSWORD` nuevas, distintas de las de desarrollo.
- [ ] Copias de seguridad automáticas de `pgdata` y `media`, con una
      restauración ya probada.
- [ ] `DEBUG=False` (lo fuerza el compose de producción, pero confírmalo:
      con `DEBUG=True` las trazas de error se muestran al usuario y se
      desactivan los validadores de contraseña).
- [ ] `ALLOWED_HOSTS` con tu dominio real.
- [ ] Ningún `populate_db.py` ejecutado contra la base de datos del estudio.

El encaje legal (consentimiento informado, base jurídica del tratamiento,
periodo de conservación y aprobación del comité de ética que corresponda) queda
fuera de lo que cubre este repositorio, pero conviene cerrarlo antes del
despliegue.

---

## Usuarios de prueba

`populate_db.py` **borra los datos existentes** y crea un juego de usuarios,
todos con la contraseña `MindfulnessApp123`:

| Usuario                    | Rol           |
| -------------------------- | ------------- |
| `admin`                    | Administrador |
| `investigador@demo.com`    | Investigador  |
| `jon.kabat.zinn@gmail.com` | Investigador  |
| `p1@demo.com`              | Participante  |
| `p2@demo.com`              | Participante  |
| `p3@demo.com`              | Participante  |

> El endpoint de login espera el campo **`username`**, no `email`:
>
> ```bash
> curl -X POST http://localhost:8000/api/auth/login/ \
>   -H 'Content-Type: application/json' \
>   -d '{"username":"admin","password":"MindfulnessApp123"}'
> ```

---

## Tests

Los tests usan **SQLite en memoria**, así que no necesitas PostgreSQL levantado.

```bash
cd backend
source venv/bin/activate
pytest                 # toda la suite
pytest --cov           # con cobertura
pytest -v              # salida detallada
```

Para un módulo concreto (`autenticacion`, `usuario`, `programa`, `sesion`,
`cuestionario`):

```bash
python run_tests.py autenticacion
```

O un test suelto:

```bash
pytest tests/test_api/test_usuario_api.py::TestUsuarioAPI::test_usuario_create_success
```

Cubren autenticación y JWT, usuarios y permisos, programas e inscripciones,
sesiones y diarios, y cuestionarios y respuestas.

---

## Resolución de problemas

**`pip install -r requirements.txt` falla al parsear el fichero**
`requirements.txt` debe estar en UTF-8. Si tu editor lo guarda en UTF-16 (algo
habitual al redirigir `pip freeze` en PowerShell), pip no puede leerlo.
Compruébalo con `file requirements.txt`.

**`OperationalError: connection refused`**
La base de datos no está levantada, o las credenciales de `backend/.env` no
coinciden con las del contenedor. Revisa `docker compose ps` y recuerda el
`--env-file backend/.env`.

**El puerto 5432 ya está ocupado**
Tienes otro PostgreSQL corriendo. Cambia `DB_PORT` en `backend/.env` y vuelve a
lanzar `docker compose --env-file backend/.env up -d`: el mapeo de puertos se
lee de esa variable.

**Cambié `DB_PASSWORD` y ahora falla la autenticación**
PostgreSQL solo aplica las credenciales al **inicializar** el volumen de datos;
si ya existe, las ignora. Para que una credencial nueva tenga efecto hay que
recrear el volumen (`docker compose down -v`), lo que **borra los datos**.

**El frontend carga pero no llega a la API**
Vite solo lee el `.env` al arrancar. Comprueba `VITE_API_URL` en
`frontend/.env` y reinicia `npm run dev` tras cambiarlo.
