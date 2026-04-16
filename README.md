# Sistema de Inspección Técnica — Volquetes Volvo FM
**Cía. Minera Santa Luisa S.A. · Unidad Minera Huanzala · Áncash**

Aplicación web multiusuario para registrar inspecciones técnicas integrales de la flota de volquetes Volvo FM.

---

## Stack tecnológico
| Capa | Tecnología |
|------|-----------|
| Frontend | HTML / CSS / JavaScript (vanilla) |
| Backend | Node.js + Express.js |
| Base de datos | PostgreSQL |
| Autenticación | JWT (cookies HttpOnly) |
| Hosting | Railway |

---

## Instalación local

### 1. Requisitos previos
- Node.js 18+
- PostgreSQL 14+ instalado y corriendo localmente
- Git

### 2. Clonar e instalar dependencias
```bash
git clone https://github.com/TU_USUARIO/inspeccion-volquetes-msl.git
cd inspeccion-volquetes-msl
npm install
```

### 3. Configurar base de datos local
```sql
-- En psql o pgAdmin, crear la base de datos:
CREATE DATABASE inspeccion_msl;
```

### 4. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

### 5. Crear tablas y usuarios iniciales
```bash
# Crear tablas
psql $DATABASE_URL -f config/schema.sql

# Crear usuarios admin y técnico
npm run seed
```

### 6. Iniciar servidor
```bash
npm run dev      # Modo desarrollo (nodemon)
npm start        # Modo producción
```

Abrir en el navegador: **http://localhost:3000**

---

## Usuarios por defecto (tras ejecutar seed)
| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | Administrador — acceso total |
| `tecnico` | `tecnico123` | Técnico — solo registrar inspecciones |

> **Cambiar contraseñas** tras el primer inicio de sesión.

---

## Despliegue en Railway

### 1. Crear cuenta en Railway
Ir a [railway.app](https://railway.app) y registrarse con GitHub.

### 2. Crear proyecto
- New Project → Deploy from GitHub repo → seleccionar este repositorio
- Railway detecta automáticamente Node.js

### 3. Agregar base de datos PostgreSQL
- En el proyecto → New → Database → PostgreSQL
- Railway crea la BD y provee `DATABASE_URL` automáticamente

### 4. Variables de entorno en Railway
En el panel del servicio → Variables:
```
JWT_SECRET=clave_secreta_muy_larga_y_aleatoria
NODE_ENV=production
```
> `DATABASE_URL` y `PORT` los asigna Railway automáticamente.

### 5. Ejecutar schema y seed en Railway
En el panel → Settings → Custom Start Command (temporalmente):
```
node config/seed.js
```
Luego volver a `node server.js`.

### 6. Compartir el link
Railway provee una URL pública tipo:  
`https://inspeccion-volquetes-msl.up.railway.app`

---

## Estructura del proyecto
```
PRUEBA 04/
├── server.js              ← Punto de entrada
├── package.json
├── .env.example           ← Plantilla de variables
├── .gitignore
├── config/
│   ├── db.js              ← Conexión PostgreSQL
│   ├── schema.sql         ← Crear tablas
│   └── seed.js            ← Usuarios iniciales
├── controllers/
│   ├── authController.js
│   ├── inspeccionController.js
│   └── usuarioController.js
├── middleware/
│   ├── authMiddleware.js  ← Verificar JWT
│   └── adminMiddleware.js ← Solo admin
├── routes/
│   ├── auth.js
│   ├── inspecciones.js
│   └── usuarios.js
└── public/
    └── index.html         ← Frontend completo
```

---

## API REST

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Usuario actual |
| PUT | `/api/auth/password` | Cambiar contraseña |

### Inspecciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/inspecciones/volquetes` | Lista de volquetes |
| GET | `/api/inspecciones/dia/:fecha` | Inspecciones del día |
| GET | `/api/inspecciones/:vol/:fecha` | Inspección específica |
| POST | `/api/inspecciones` | Guardar inspección |
| DELETE | `/api/inspecciones/:vol/:fecha` | Eliminar (admin) |

### Usuarios (solo admin)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/usuarios` | Listar usuarios |
| POST | `/api/usuarios` | Crear usuario |
| PUT | `/api/usuarios/:id` | Actualizar |
| DELETE | `/api/usuarios/:id` | Desactivar |

---

*v3.0 · Planeamiento de Mantenimiento · MSL Huanzala*
