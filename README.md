# API Biblioteca – TypeScript + PostgreSQL + Drizzle ORM

API HTTP (REST) para administrar un catálogo de **libros**. Usa **TypeScript**, **Express**, **PostgreSQL** y **Drizzle ORM** con **migraciones versionadas** (los archivos SQL están en la carpeta `drizzle/` y se guardan en Git).

## Qué hace

Recurso principal: `books` (libros).

| Método | Ruta           | Descripción                              | Códigos HTTP            |
|--------|----------------|------------------------------------------|-------------------------|
| GET    | `/health`      | Comprueba que la API está viva           | 200                     |
| GET    | `/books`       | Lista libros (`?search=texto` opcional)  | 200                     |
| GET    | `/books/:id`   | Consulta un libro                        | 200, 400, 404           |
| POST   | `/books`       | Crea un libro                            | 201, 400, 409           |
| PUT    | `/books/:id`   | Actualiza uno o más campos de un libro   | 200, 400, 404, 409      |
| DELETE | `/books/:id`   | Elimina un libro                         | 204, 400, 404           |

Validaciones (con Zod): `title`, `author` e `isbn` obligatorios al crear; `isbn` de 10 a 20 caracteres y **único** (409 si se repite); `publishedYear` entero válido; `stock` entero mayor o igual a 0; no se aceptan campos desconocidos.

## Requisitos

- Node.js 20 o superior y npm
- PostgreSQL 14 o superior
- Git

## 1. Instalar PostgreSQL (Fedora)

```bash
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql
```

## 2. Crear usuario y base de datos

```bash
sudo -u postgres psql -c "CREATE USER biblioteca WITH PASSWORD 'cambia_esta_clave';"
sudo -u postgres psql -c "CREATE DATABASE biblioteca_db OWNER biblioteca;"
```

> Solo se crea la base **vacía**. Las tablas las crean las migraciones; no hay que tocar nada a mano.

## 3. Instalar el proyecto

```bash
git clone <URL-DEL-REPOSITORIO>
cd api-biblioteca-drizzle
npm install
```

## 4. Variables de entorno

```bash
cp .env.example .env
```

Abre `.env` y escribe tus datos reales:

```env
DATABASE_URL=postgresql://biblioteca:cambia_esta_clave@localhost:5432/biblioteca_db
PORT=3000
```

`.env` está en `.gitignore` (nunca se sube). Solo se sube `.env.example`, que no tiene secretos.

## 5. Migraciones

Las migraciones ya están generadas en `drizzle/`:

| Archivo                                          | Qué hace                                                    |
|--------------------------------------------------|-------------------------------------------------------------|
| `0000_crear_tabla_books.sql`                     | Migración inicial: crea la tabla `books`                    |
| `0001_agregar_genero_stock_y_updated_at.sql`     | Evolución: agrega `genre`, `stock`, `updated_at` e índice   |

**Aplicarlas** (esto es lo único que necesitas para crear las tablas):

```bash
npm run db:migrate
```

**Generar una migración nueva** (solo si cambias `src/db/schema.ts`):

```bash
npm run db:generate -- --name=descripcion_del_cambio
npm run db:migrate
```

## 6. Ejecutar la API

```bash
npm start          # ejecución normal
npm run dev        # modo desarrollo (se reinicia al guardar)
npm run typecheck  # revisa los tipos de TypeScript
```

Debe aparecer: `API de biblioteca escuchando en http://localhost:3000`

## 7. Probar con curl

```bash
# Crear
curl -i -X POST http://localhost:3000/books -H "Content-Type: application/json" \
  -d '{"title":"Cien años de soledad","author":"Gabriel García Márquez","isbn":"978-0307474728","publishedYear":1967,"genre":"Novela","stock":5}'

# Listar y consultar
curl -i http://localhost:3000/books
curl -i http://localhost:3000/books/1

# Actualizar
curl -i -X PUT http://localhost:3000/books/1 -H "Content-Type: application/json" -d '{"stock":10}'

# Eliminar
curl -i -X DELETE http://localhost:3000/books/1
```

## Estructura

```
├── drizzle/                 # migraciones SQL versionadas (van en Git)
│   ├── 0000_crear_tabla_books.sql
│   ├── 0001_agregar_genero_stock_y_updated_at.sql
│   └── meta/                # registro interno de Drizzle (journal y snapshots)
├── src/
│   ├── db/schema.ts         # definición de la tabla
│   ├── db/index.ts          # conexión a PostgreSQL
│   ├── validation.ts        # validaciones con Zod
│   ├── app.ts               # endpoints
│   └── index.ts             # arranque del servidor
├── drizzle.config.ts        # configuración de Drizzle Kit
├── .env.example             # plantilla de variables (sin secretos)
└── package.json
```
