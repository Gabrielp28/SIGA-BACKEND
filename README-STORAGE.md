# Configuración de Supabase Storage

Este documento explica cómo configurar Supabase Storage para subir archivos (imágenes, PDFs y documentos Word).

## Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# Supabase Storage
SUPABASE_URL=https://usurtzdmkcavabbnndeu.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdXJ0emRta2NhdmFiYm5uZGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzc4MDUwOCwiZXhwIjoyMDc5MzU2NTA4fQ.vKxe5TXiArn8tmId-gjQopzIpoEpAbt1MXiKZx623m8
SUPABASE_BUCKET=archivos
```

## Configuración en Supabase

### 1. Crear el Bucket

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Navega a **Storage** en el menú lateral
3. Haz clic en **New bucket**
4. Nombre del bucket: `archivos`
5. Marca como **Public bucket** (si quieres URLs públicas) o **Private bucket** (si quieres URLs firmadas)
6. Haz clic en **Create bucket**

### 2. Configurar Políticas (Opcional)

Si el bucket es privado, puedes configurar políticas RLS (Row Level Security) para controlar el acceso.

## Endpoints Disponibles

### 1. Subir un archivo
```http
POST /storage/upload
Content-Type: multipart/form-data

Body:
- file: [archivo]
- folder: [opcional] nombre de la carpeta
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/ruta/al/archivo.pdf" \
  -F "folder=documentos"
```

### 2. Subir archivo a carpeta específica
```http
POST /storage/upload/:folder
Content-Type: multipart/form-data

Body:
- file: [archivo]
```

**Ejemplo:**
```bash
POST /storage/upload/documentos
```

### 3. Subir múltiples archivos
```http
POST /storage/upload-multiple
Content-Type: multipart/form-data

Body:
- files: [array de archivos]
- folder: [opcional]
```

### 4. Eliminar archivo
```http
DELETE /storage/:path
```

**Ejemplo:**
```bash
DELETE /storage/documentos/1234567890-abc123.pdf
```

### 5. Obtener URL pública
```http
GET /storage/url/:path
```

### 6. Obtener URL firmada (temporal)
```http
GET /storage/signed-url/:path
```

### 7. Listar archivos
```http
GET /storage/list?folder=documentos
```

## Tipos de Archivos Permitidos

- **Imágenes**: jpg, jpeg, png, gif, webp
- **Documentos**: pdf, doc, docx

**Tamaño máximo**: 10MB por archivo

## Ejemplo de Respuesta

```json
{
  "url": "https://usurtzdmkcavabbnndeu.supabase.co/storage/v1/object/public/archivos/documentos/1234567890-abc123.pdf",
  "path": "documentos/1234567890-abc123.pdf"
}
```

## Uso en el Frontend

### Ejemplo con FormData (JavaScript)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('folder', 'documentos');

const response = await fetch('http://localhost:3000/storage/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log(data.url); // URL del archivo subido
```

### Ejemplo con Axios

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'documentos');

const response = await axios.post(
  'http://localhost:3000/storage/upload',
  formData,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  }
);

console.log(response.data.url);
```

## Notas Importantes

1. **Service Key**: Usa la `service_role` key (no la `anon` key) para tener permisos completos
2. **Bucket Público vs Privado**:
   - **Público**: URLs accesibles sin autenticación
   - **Privado**: Requiere URLs firmadas o autenticación
3. **Organización**: Usa carpetas para organizar archivos (ej: `documentos/`, `fotos/`, `evidencias/`)
4. **Seguridad**: Todos los endpoints requieren autenticación JWT (excepto si marcas como `@Public()`)

