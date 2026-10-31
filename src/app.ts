import express, { type NextFunction, type Request, type Response } from "express";
import { eq, ilike, or, sql } from "drizzle-orm";
import { ZodError } from "zod";
import { db } from "./db/index.js";
import { books } from "./db/schema.js";
import { createBookSchema, idParamSchema, updateBookSchema } from "./validation.js";

export const app = express();
app.use(express.json());

const PG_UNIQUE_VIOLATION = "23505";

function parseId(raw: unknown) {
  const result = idParamSchema.safeParse(raw);
  return result.success ? result.data : null;
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// LISTAR (con búsqueda opcional: /books?search=texto)
app.get("/books", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const rows = search
    ? await db
        .select()
        .from(books)
        .where(or(ilike(books.title, `%${search}%`), ilike(books.author, `%${search}%`)))
        .orderBy(books.id)
    : await db.select().from(books).orderBy(books.id);
  res.status(200).json(rows);
});

// CONSULTAR UNO
app.get("/books/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "El id debe ser un número entero positivo" });

  const [book] = await db.select().from(books).where(eq(books.id, id));
  if (!book) return res.status(404).json({ error: "Libro no encontrado" });
  res.status(200).json(book);
});

// CREAR
app.post("/books", async (req, res) => {
  const data = createBookSchema.parse(req.body);
  const [created] = await db.insert(books).values(data).returning();
  res.status(201).location(`/books/${created.id}`).json(created);
});

// ACTUALIZAR
app.put("/books/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "El id debe ser un número entero positivo" });

  const data = updateBookSchema.parse(req.body);
  const [updated] = await db
    .update(books)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(books.id, id))
    .returning();
  if (!updated) return res.status(404).json({ error: "Libro no encontrado" });
  res.status(200).json(updated);
});

// ELIMINAR
app.delete("/books/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "El id debe ser un número entero positivo" });

  const [deleted] = await db.delete(books).where(eq(books.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "Libro no encontrado" });
  res.status(204).send();
});

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo central de errores
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: err.issues.map((i) => ({ campo: i.path.join("."), mensaje: i.message })),
    });
  }
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: "JSON mal formado" });
  }
  const code = (err as { code?: string; cause?: { code?: string } })?.code
    ?? (err as { cause?: { code?: string } })?.cause?.code;
  if (code === PG_UNIQUE_VIOLATION) {
    return res.status(409).json({ error: "Ya existe un libro con ese ISBN" });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});
