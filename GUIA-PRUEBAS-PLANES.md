# 🧪 Guía de Pruebas - Módulo de Planes

Esta guía te ayudará a probar el módulo de Planes paso a paso.

## 📋 Requisitos Previos

1. **Base de datos configurada** con al menos:
   - Al menos una `Carrera` existente
   - Al menos una `Asignatura` existente
   - Al menos un `Docente` existente

2. **Servidor corriendo**:
   ```bash
   npm run start:dev
   ```

3. **Acceso a la API**:
   - API: `http://localhost:3000`
   - Swagger: `http://localhost:3000/api/docs`

---

## 🚀 Opción 1: Usar Swagger UI (Recomendado)

1. Abre tu navegador en: `http://localhost:3000/api/docs`
2. Busca la sección **"Planes"** en la documentación
3. Prueba los endpoints directamente desde la interfaz

---

## 🧪 Opción 2: Usar cURL o Postman

### Paso 1: Crear un Plan

```bash
curl -X POST http://localhost:3000/planes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_plan": "Plan de Estudios 2016",
    "codigo_plan": "PLAN-2016",
    "año": 2016,
    "descripcion": "Plan de estudios para ingeniería en sistemas",
    "fecha_inicio": "2016-01-01",
    "fecha_fin": "2020-12-31"
  }'
```

**Respuesta esperada:**
```json
{
  "id_plan": 1,
  "nombre_plan": "Plan de Estudios 2016",
  "codigo_plan": "PLAN-2016",
  "año": 2016,
  "descripcion": "Plan de estudios para ingeniería en sistemas",
  "estado": "activo",
  "fecha_inicio": "2016-01-01",
  "fecha_fin": "2020-12-31"
}
```

**Guarda el `id_plan` para los siguientes pasos** (ejemplo: `id_plan = 1`)

---

### Paso 2: Agregar Carreras al Plan

Primero, necesitas conocer los IDs de las carreras existentes. Puedes listarlas con:
```bash
curl -X GET http://localhost:3000/carreras
```

Luego, agrega carreras al plan:

```bash
curl -X POST http://localhost:3000/planes/1/carreras \
  -H "Content-Type: application/json" \
  -d '{
    "id_carreras": [1, 2]
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Carreras agregadas correctamente",
  "creadas": 2,
  "errores": []
}
```

**Guarda el `id_plan_carrera` de la carrera que usarás** (ejemplo: si agregaste la carrera con `id_carrera = 1`, el `id_plan_carrera` será el primero de la lista)

---

### Paso 3: Obtener Carreras del Plan

```bash
curl -X GET http://localhost:3000/planes/1/carreras
```

**Respuesta esperada:**
```json
[
  {
    "id_plan_carrera": 1,
    "estado": "activo",
    "carrera": {
      "id_carrera": 1,
      "nombre_carrera": "Ingeniería en Sistemas",
      "codigo_carrera": "ISI"
    }
  }
]
```

**Guarda el `id_plan_carrera`** (ejemplo: `id_plan_carrera = 1`)

---

### Paso 4: Agregar Asignaturas al Plan-Carrera

Primero, verifica que las asignaturas pertenezcan a la carrera. Puedes listarlas con:
```bash
curl -X GET http://localhost:3000/asignaturas
```

Luego, agrega asignaturas al plan-carrera:

```bash
curl -X POST http://localhost:3000/planes/1/plan-carrera/1/asignaturas \
  -H "Content-Type: application/json" \
  -d '{
    "id_asignaturas": [1, 2, 3, 4, 5]
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Asignaturas agregadas correctamente",
  "creadas": 5,
  "errores": []
}
```

---

### Paso 5: Obtener Asignaturas del Plan por Carrera (Útil para Grupos)

Este endpoint es especialmente útil cuando vas a crear un grupo, ya que muestra las asignaturas disponibles según el plan y la carrera:

```bash
curl -X GET http://localhost:3000/planes/1/carrera/1/asignaturas
```

**Respuesta esperada:**
```json
[
  {
    "id_plan_carrera_asignatura": 1,
    "estado": "activo",
    "asignatura": {
      "id_asignatura": 1,
      "nombre_asignatura": "Programación de Base de Datos",
      "codigo_asignatura": "PBD-001"
    }
  },
  {
    "id_plan_carrera_asignatura": 2,
    "estado": "activo",
    "asignatura": {
      "id_asignatura": 2,
      "nombre_asignatura": "Diseño de Sistemas",
      "codigo_asignatura": "DS-001"
    }
  }
  // ... más asignaturas
]
```

---

### Paso 6: Crear un Grupo con Plan

Ahora puedes crear un grupo que esté asociado al plan:

```bash
curl -X POST http://localhost:3000/grupos \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_grupo": "ISI-2025",
    "nombre_grupo": "Ingeniería en Sistemas II Año",
    "periodo_academico": "2024-1",
    "id_plan": 1,
    "id_carrera": 1,
    "id_docente_titular": 1,
    "min_asignaturas": 3,
    "max_asignaturas": 5,
    "estado": "activo"
  }'
```

**Respuesta esperada:**
```json
{
  "id_grupo": 1,
  "codigo_grupo": "ISI-2025",
  "nombre_grupo": "Ingeniería en Sistemas II Año",
  "periodo_academico": "2024-1",
  "plan": {
    "id_plan": 1,
    "nombre_plan": "Plan de Estudios 2016"
  },
  "carrera": {
    "id_carrera": 1,
    "nombre_carrera": "Ingeniería en Sistemas"
  },
  "min_asignaturas": 3,
  "max_asignaturas": 5
}
```

**Guarda el `id_grupo`** (ejemplo: `id_grupo = 1`)

---

### Paso 7: Agregar Asignaturas al Grupo (Validación del Plan)

Ahora intenta agregar asignaturas al grupo. **Solo funcionará si las asignaturas pertenecen al plan del grupo:**

```bash
curl -X POST http://localhost:3000/grupo-asignatura-docente/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "id_grupo": 1,
    "asignaturas_docentes": [
      {
        "id_asignatura": 1,
        "id_docente": 1
      },
      {
        "id_asignatura": 2,
        "id_docente": 2
      },
      {
        "id_asignatura": 3,
        "id_docente": 3
      }
    ],
    "estado": "activa"
  }'
```

**Respuesta esperada (éxito):**
```json
{
  "message": "Asignaciones creadas correctamente",
  "creadas": 3,
  "errores": []
}
```

**Si intentas agregar una asignatura que NO está en el plan, recibirás:**
```json
{
  "statusCode": 400,
  "message": "La asignatura con ID 99 no pertenece al plan del grupo o a la carrera del grupo",
  "error": "Bad Request"
}
```

---

## ✅ Casos de Prueba Importantes

### 1. Validar que solo se pueden agregar asignaturas del plan

**Prueba:**
- Crea un grupo con `id_plan = 1`
- Intenta agregar una asignatura que NO esté en el plan 1
- **Resultado esperado:** Error 400

### 2. Validar que no se puede eliminar un plan usado por grupos

**Prueba:**
- Crea un grupo asociado a un plan
- Intenta eliminar ese plan
- **Resultado esperado:** Error 400 con mensaje indicando que el plan está en uso

### 3. Validar que al eliminar una carrera del plan, se eliminan sus asignaturas

**Prueba:**
- Agrega carreras y asignaturas a un plan
- Elimina una carrera del plan
- Verifica que las asignaturas de esa carrera también fueron eliminadas

### 4. Validar endpoints de consulta

**Prueba:**
- `GET /planes` - Listar todos los planes
- `GET /planes/:id` - Obtener plan con carreras y asignaturas
- `GET /planes/:id/carreras` - Obtener carreras del plan
- `GET /planes/:id/carrera/:idCarrera/asignaturas` - Obtener asignaturas por plan y carrera

---

## 🔍 Endpoints Disponibles

### Planes
- `POST /planes` - Crear plan
- `GET /planes` - Listar planes (con filtros)
- `GET /planes/:id` - Obtener plan completo
- `PATCH /planes/:id` - Actualizar plan
- `DELETE /planes/:id` - Eliminar plan

### Carreras en Planes
- `POST /planes/:id/carreras` - Agregar carreras al plan
- `GET /planes/:id/carreras` - Obtener carreras del plan
- `DELETE /planes/:id/carreras/:idPlanCarrera` - Remover carrera del plan

### Asignaturas en Planes
- `POST /planes/:id/plan-carrera/:idPlanCarrera/asignaturas` - Agregar asignaturas
- `GET /planes/:id/plan-carrera/:idPlanCarrera/asignaturas` - Obtener asignaturas de plan-carrera
- `GET /planes/:id/carrera/:idCarrera/asignaturas` - Obtener asignaturas por plan y carrera ⭐ (Útil para grupos)
- `DELETE /planes/:id/plan-carrera/:idPlanCarrera/asignaturas/:idPlanCarreraAsignatura` - Remover asignatura

---

## 📝 Notas Importantes

1. **Validación de Plan en Grupos:**
   - Al crear un grupo, debes especificar `id_plan` (obligatorio)
   - Al agregar asignaturas a un grupo, solo se permiten asignaturas que estén en el plan del grupo

2. **Cascada de Eliminación:**
   - Si eliminas una carrera del plan, se eliminan automáticamente todas sus asignaturas asociadas
   - No puedes eliminar un plan si está siendo usado por grupos

3. **Unicidad:**
   - El `codigo_plan` debe ser único
   - No puedes agregar la misma carrera dos veces al mismo plan
   - No puedes agregar la misma asignatura dos veces al mismo plan-carrera

---

## 🐛 Solución de Problemas

### Error: "Plan no encontrado"
- Verifica que el `id_plan` existe usando `GET /planes/:id`

### Error: "Carrera no encontrada"
- Verifica que la carrera existe usando `GET /carreras`

### Error: "Asignatura no pertenece al plan"
- Verifica que la asignatura esté agregada al plan-carrera usando `GET /planes/:id/carrera/:idCarrera/asignaturas`

### Error: "No se puede eliminar: el plan está siendo usado por grupos"
- Primero elimina o actualiza los grupos que usan ese plan

---

## 🎯 Flujo Completo de Ejemplo

```bash
# 1. Crear Plan
POST /planes → id_plan = 1

# 2. Agregar Carreras
POST /planes/1/carreras → id_plan_carrera = 1

# 3. Agregar Asignaturas
POST /planes/1/plan-carrera/1/asignaturas

# 4. Ver Asignaturas Disponibles (para el grupo)
GET /planes/1/carrera/1/asignaturas

# 5. Crear Grupo con Plan
POST /grupos → id_grupo = 1

# 6. Agregar Asignaturas al Grupo (solo las del plan)
POST /grupo-asignatura-docente/bulk
```

¡Listo! Ahora puedes probar el módulo de Planes completamente. 🚀

