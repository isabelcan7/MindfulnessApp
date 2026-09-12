# Tests de la Aplicación de Mindfulness

Este directorio contiene los tests unitarios para todas las APIs de la aplicación de mindfulness.

## Estructura de Tests

```
tests/
├── conftest.py                      # Configuración general y fixtures
├── test_api/
│   ├── test_autenticacion_api.py   # Tests para API de autenticación
│   ├── test_usuario_api.py         # Tests para API de usuarios
│   ├── test_programa_api.py        # Tests para API de programas
│   ├── test_sesion_api.py          # Tests para API de sesiones
│   └── test_cuestionario_api.py    # Tests para API de cuestionarios
├── utils/
│   └── helpers.py                  # Utilidades helper para tests
└── README.md                       # Este archivo
```

## Instalación de Dependencias

Instala las dependencias necesarias para testing:

```bash
pip install -r requirements-dev.txt
```

Las dependencias de testing incluyen:
- `pytest` - Framework de testing principal
- `pytest-django` - Integración con Django
- `pytest-cov` - Generación de reportes de coverage
- `factory-boy` - Creación de datos de prueba
- `mixer` - Otra opción para datos de prueba

## Configuración

Los tests están configurados para usar:
- Base de datos SQLite en memoria (más rápida)
- Configuraciones específicas de Django para testing
- Fixtures compartidas en `conftest.py`

## Ejecución de Tests

### 1. Ejecutar todos los tests

```bash
# Opción 1: Usando el script personalizado
python run_tests.py

# Opción 2: Usando pytest directamente
pytest tests/ -v
```

### 2. Ejecutar tests por módulo

```bash
# Tests de autenticación
python run_tests.py autenticacion

# Tests de usuarios
python run_tests.py usuario

# Tests de programas
python run_tests.py programa

# Tests de sesiones
python run_tests.py sesion

# Tests de cuestionarios
python run_tests.py cuestionario
```

### 3. Ejecutar un test específico

```bash
# Test específico
python run_tests.py tests/test_api/test_autenticacion_api.py::TestAutenticacionAPI::test_login_success

# Archivo de test completo
python run_tests.py tests/test_api/test_usuario_api.py
```

### 4. Ejecutar tests con coverage

```bash
# Ejecutar tests y generar reporte de coverage
pytest tests/ --cov=. --cov-report=html --cov-report=term-missing

# Ver reporte de coverage
python run_tests.py coverage
```

## Tipos de Tests

### Tests de Autenticación (`test_autenticacion_api.py`)
- Registro de usuarios (participantes e investigadores)
- Login y logout
- Gestión de perfiles
- Cambio de contraseñas
- Eliminación de cuentas

### Tests de Usuarios (`test_usuario_api.py`)
- CRUD de usuarios (solo admin)
- Gestión de perfiles de participantes e investigadores
- Verificación de permisos por roles

### Tests de Programas (`test_programa_api.py`)
- Creación, edición y eliminación de programas
- Publicación de programas
- Inscripción y abandono de programas
- Duplicación de programas
- Gestión de participantes

### Tests de Sesiones (`test_sesion_api.py`)
- CRUD de sesiones
- Creación y gestión de diarios de sesión
- Diferentes tipos de contenido y práctica
- Permisos por roles

### Tests de Cuestionarios (`test_cuestionario_api.py`)
- CRUD de cuestionarios
- Respuesta a cuestionarios pre y post
- Validaciones de momento (pre/post)
- Gestión de respuestas

## Fixtures Disponibles

En `conftest.py` están disponibles las siguientes fixtures:

### Usuarios y Autenticación
- `usuario_participante` - Usuario participante
- `usuario_investigador` - Usuario investigador
- `usuario_admin` - Usuario administrador
- `authenticated_client_participante` - Cliente autenticado como participante
- `authenticated_client_investigador` - Cliente autenticado como investigador
- `authenticated_client_admin` - Cliente autenticado como admin

### Perfiles
- `participante` - Perfil de participante
- `investigador` - Perfil de investigador

### Programas
- `programa_borrador` - Programa en estado borrador
- `programa_publicado` - Programa publicado

### Cuestionarios y Sesiones
- `cuestionario_pre` - Cuestionario pre
- `cuestionario_post` - Cuestionario post
- `sesion` - Sesión de programa

## Mejores Prácticas

### 1. Nomenclatura de Tests
```python
def test_[accion]_[resultado]_[condicion](self, fixtures):
    """Descripción clara del test."""
    # Test implementation
```

### 2. Uso de Fixtures
```python
def test_programa_create_success(self, authenticated_client_investigador):
    """Usar fixtures existentes cuando sea posible."""
    pass
```

### 3. Verificaciones
```python
# Verificar código de estado HTTP
assert response.status_code == status.HTTP_201_CREATED

# Verificar contenido de respuesta
assert 'access' in response.data
assert response.data['user']['email'] == 'test@example.com'

# Verificar cambios en base de datos
assert Usuario.objects.filter(email='test@example.com').exists()
```

### 4. Limpieza de Datos
Los tests usan `@pytest.mark.django_db` que automáticamente limpia la base de datos después de cada test.

## Troubleshooting

### Error: "ModuleNotFoundError"
```bash
# Asegúrate de estar en el directorio correcto
cd backend/

# Verifica que Django esté configurado
export DJANGO_SETTINGS_MODULE=config.settings
```

### Tests Lentos
```bash
# Ejecutar solo tests rápidos
pytest tests/ -m "not slow"

# Ver tests más lentos
pytest tests/ --durations=10
```

### Problemas con Base de Datos
```bash
# Recrear migraciones si es necesario
python manage.py makemigrations
python manage.py migrate
```

## Continuous Integration

Los tests están listos para CI/CD. Script de ejemplo para GitHub Actions:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    - name: Install dependencies
      run: |
        pip install -r requirements-dev.txt
    - name: Run tests
      run: |
        cd backend
        python run_tests.py
```

## Contribuir

Al agregar nuevas funcionalidades:

1. **Escribir tests primero** (TDD)
2. **Cubrir casos de éxito y error**
3. **Verificar permisos por roles**
4. **Mantener coverage alto (>90%)**
5. **Documentar tests complejos**

¡Los tests son fundamentales para mantener la calidad del código! 