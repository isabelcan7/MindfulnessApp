# Mindfulness App

Proyecto **fullstack** para una aplicación de mindfulness: frontend en **React**
+ **Vite** + **Tailwind CSS**, backend en **Django** + **PostgreSQL**.

Todo el entorno corre en Docker, así que no necesitas instalar Python ni Node.

- `/backend`: API Django
- `/frontend`: Aplicación React (JSX)
- `docker-compose.yml`: entorno de desarrollo
- `docker-compose.prod.yml`: entorno de despliegue

---

## Requisitos

Solo **Docker** — [instalar Docker](https://docs.docker.com/get-docker/).
Comprueba que `docker compose version` responde.

---

## Puesta en marcha

```bash
git clone https://github.com/isabelcan7/MindfulnessApp.git
cd MindfulnessApp

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up -d --build
```

Y ya está. La primera vez tarda unos minutos en construir las imágenes; después
el arranque es de segundos.

- Frontend: http://localhost:3000
- API: http://localhost:8000
- Admin de Django: http://localhost:8000/admin/

El contenedor del backend espera a que la base de datos esté lista y **aplica las
migraciones solo** al arrancar. No hay que ejecutar `migrate` a mano.

Para cargar datos de prueba (usuarios, programas, sesiones):

```bash
docker compose exec backend python populate_db.py
```

> Genera una `SECRET_KEY` propia para tu `backend/.env`. Es la clave con la que se
> firman los tokens JWT, así que no dejes la del `.env.example`:
>
> ```bash
> docker compose exec backend python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"
> ```

---

## Día a día

```bash
docker compose up -d           # arrancar
docker compose stop            # parar (conserva los datos)
docker compose logs -f         # ver logs de todo
docker compose logs -f backend # ver logs de un servicio
docker compose ps              # estado de los servicios
```

El código está montado como volumen, así que **al guardar un fichero se recarga
solo**: HMR en el frontend y autoreload de Django en el backend. No hace falta
reconstruir para cambios de código.

### Comandos de Django

Van todos prefijados por `docker compose exec backend`:

```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py shell
```

### Cuándo hay que reconstruir

Solo si cambian las **dependencias**, no el código:

```bash
# Tras tocar requirements.txt
docker compose up -d --build backend

# Tras tocar package.json
docker compose down
docker volume rm mindfulnessapp_node_modules
docker compose up -d --build frontend
```

El `node_modules` vive en un volumen para que no choque con tu carpeta local, y
por eso hay que borrarlo explícitamente: reconstruir la imagen no lo actualiza.

### Base de datos

El puerto 5432 está publicado, así que puedes conectar un cliente gráfico
(DBeaver, TablePlus) a `localhost:5432` con las credenciales de `backend/.env`.

```bash
# Consola de PostgreSQL
docker compose exec postgres psql -U mindfulness -d mindfulness

# Empezar de cero (BORRA TODOS LOS DATOS)
docker compose down -v && docker compose up -d
```

---

## Tests

```bash
docker compose exec backend pytest              # toda la suite
docker compose exec backend pytest --cov        # con cobertura
docker compose exec backend pytest -v           # salida detallada
```

Los tests usan SQLite en memoria, así que no tocan tu base de datos de
desarrollo.

Para un módulo concreto (`autenticacion`, `usuario`, `programa`, `sesion`,
`cuestionario`):

```bash
docker compose exec backend python run_tests.py autenticacion
```

O un test suelto:

```bash
docker compose exec backend pytest tests/test_api/test_usuario_api.py::TestUsuarioAPI::test_usuario_create_success
```

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

## Despliegue

`docker-compose.prod.yml` define el stack de producción. Se diferencia del de
desarrollo en cosas que importan:

| | Desarrollo | Producción |
| --- | --- | --- |
| Servidor Django | `runserver` | **gunicorn**, 3 workers |
| Frontend | servidor de Vite | build estático servido por **nginx** |
| Código | montado como volumen | copiado dentro de la imagen |
| Estáticos y media | los sirve Django | los sirve nginx desde volúmenes |
| `DEBUG` | `True` | `False`, forzado por el compose |
| Puertos expuestos | 3000, 8000, 5432 | solo el 80 |

nginx es el único punto de entrada: sirve el frontend y hace de proxy a `/api/` y
`/admin/`. Por eso el frontend usa **rutas relativas** y no necesita conocer el
dominio al construirse.

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

   Igual que en desarrollo, el backend espera a la base de datos, recolecta los
   estáticos y aplica las migraciones solo.

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

   En producción el código está **dentro de la imagen**, así que un `restart` no
   basta: hay que reconstruir.

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
- [ ] `DEBUG=False` (lo fuerza el compose de producción, pero confírmalo: con
      `DEBUG=True` las trazas de error se muestran al usuario y se desactivan
      los validadores de contraseña).
- [ ] `ALLOWED_HOSTS` con tu dominio real.
- [ ] Ningún `populate_db.py` ejecutado contra la base de datos del estudio.

El encaje legal (consentimiento informado, base jurídica del tratamiento,
periodo de conservación y aprobación del comité de ética que corresponda) queda
fuera de lo que cubre este repositorio, pero conviene cerrarlo antes del
despliegue.

---

## Resolución de problemas

**Añadí una dependencia y el contenedor no la ve**
Las dependencias se instalan al construir la imagen, no al arrancar. Mira
[Cuándo hay que reconstruir](#cuándo-hay-que-reconstruir).

**El backend se queda en "Esperando a la base de datos..."**
Mira `docker compose logs postgres`. Lo más habitual es que las credenciales de
`backend/.env` no coincidan con las del volumen ya inicializado (ver el punto
siguiente).

**Cambié `DB_PASSWORD` y ahora falla la autenticación**
PostgreSQL solo aplica las credenciales al **inicializar** el volumen de datos;
si ya existe, las ignora. Para que una credencial nueva tenga efecto hay que
recrear el volumen con `docker compose down -v`, lo que **borra los datos**.

**El puerto 3000, 8000 o 5432 ya está ocupado**
Tienes algo corriendo en ese puerto. Cambia el mapeo en `docker-compose.yml` (la
parte izquierda de `"3000:3000"`), o para el proceso que lo ocupa. Para el 5432
basta cambiar `DB_PORT` en `backend/.env`.

**El frontend carga pero no llega a la API**
Vite congela las variables `VITE_*` al arrancar. Comprueba `VITE_API_URL` en
`frontend/.env` y reinicia el contenedor con `docker compose restart frontend`.

**`pip install` falla al construir la imagen del backend**
`requirements.txt` debe estar en UTF-8. Si tu editor lo guarda en UTF-16 (algo
habitual al redirigir `pip freeze` en PowerShell), pip no puede parsearlo.
Compruébalo con `file backend/requirements.txt`.
