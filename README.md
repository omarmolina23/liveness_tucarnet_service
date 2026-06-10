# Liveness TuCarnet Service

Microservicio de **prueba de vida facial (face liveness)** para el sistema de carnet estudiantil TuCarnet. Inicia sesiones de liveness, compara rostros y gestiona el almacenamiento de las fotos capturadas, apoyándose en **AWS Rekognition**, **S3** y **STS**.

## Tecnologías

- **Node.js** + **Express 5** (ESM, `"type": "module"`)
- **AWS SDK v3**: Rekognition (Face Liveness y comparación), S3 (almacenamiento), STS (credenciales temporales)
- CORS habilitado; límite de payload de 10 MB

## Arquitectura / flujo

1. La app cliente pide iniciar una sesión (`/liveness/start`). El servicio crea la sesión en Rekognition y devuelve credenciales **temporales** generadas vía STS (`AssumeRole`) para que el cliente ejecute el liveness directamente contra AWS.
2. Al terminar, el cliente consulta el resultado (`/liveness/result/:sessionId`), que incluye el `ConfidenceScore` y la imagen de referencia.
3. Las fotos pueden subirse a S3 (`/liveness/photo/upload`) y recuperarse mediante URLs firmadas (`/liveness/photo/signedUrl`).
4. `/liveness/compare` compara dos rostros (por ejemplo, la foto del carnet vs. la captura del liveness).

> Este servicio lo consume directamente la **app cliente** (TuCarnetApp); no es llamado por el backend principal.

## Requisitos previos

- Node.js 20+ y npm
- Cuenta de AWS con:
  - **Amazon Rekognition** habilitado en la región elegida
  - Un **bucket S3**
  - Un **rol IAM** (para `AssumeRole` vía STS) con permisos de Rekognition/S3
  - Credenciales de acceso (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`)

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Obligatoria | Default |
|---|---|---|---|
| `PORT` | Puerto del servidor | recomendada | `4000` |
| `AWS_REGION` | Región AWS (ej. `us-east-1`) | ✅ | — |
| `S3_BUCKET` | Bucket S3 para las fotos | ✅ | — |
| `AWS_LIVENESS_ROLE_ARN` | ARN del rol que asume STS | ✅ | — |
| `AWS_ACCESS_KEY_ID` | Credencial de acceso AWS | ✅ | — |
| `AWS_SECRET_ACCESS_KEY` | Secreto de acceso AWS | ✅ | — |
| `SIGNED_URL_EXPIRATION` | Validez (segundos) de las URLs firmadas | opcional | `600` |

> ⚠️ Las credenciales AWS son **muy sensibles**. Nunca las subas a git: el `.gitignore` ya ignora `.env` y `.env.*` (excepto `.env.example`).

## Ejecución local

```bash
npm install
npm run dev     # con recarga (nodemon)
# o
npm start       # node src/server.js
```

Al arrancar verás: `Liveness service running on port 4000`. El servicio escucha en `0.0.0.0`.

## Endpoints

Prefijo: `/liveness`

| Método | Ruta | Descripción | Body / Params |
|---|---|---|---|
| POST | `/liveness/start` | Inicia una sesión de liveness y devuelve `sessionId` + credenciales temporales | — |
| GET | `/liveness/result/:sessionId` | Resultado de la sesión (`processing` o `done` con `confidenceScore` e imagen base64) | `sessionId` (param) |
| POST | `/liveness/compare` | Compara dos rostros y devuelve coincidencias con su `similarity` | `{ sourceImageBase64, targetImageBase64 }` |
| POST | `/liveness/photo/upload` | Sube una imagen base64 a S3 (máx. 10 MB) | `{ imageBase64 }` |
| POST | `/liveness/photo/signedUrl` | Devuelve una URL firmada para una foto en S3 | `{ photoKey }` |

## Despliegue en Railway

1. **+ New → GitHub Repo → `liveness_tucarnet_service`**. Railway detecta Node automáticamente.
2. **Comandos** (Settings, normalmente automáticos):
   - Build: `npm install`
   - Start: `npm start`
3. **Variables de entorno:** las de la tabla anterior.
4. **Dominio:** fija `PORT=4000` y enruta el dominio público al puerto **4000**.
5. Verifica en los logs: `Liveness service running on port 4000`.

Una vez desplegado, configura la URL pública de este servicio en la **app cliente** (TuCarnetApp), que es quien lo consume.
