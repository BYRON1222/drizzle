import { z } from "zod";

const bookFields = {
  title: z.string({ error: "El título es obligatorio y debe ser texto" }).trim().min(1, "El título es obligatorio").max(200),
  author: z.string({ error: "El autor es obligatorio y debe ser texto" }).trim().min(1, "El autor es obligatorio").max(150),
  isbn: z.string({ error: "El ISBN es obligatorio y debe ser texto" }).trim().min(10, "El ISBN debe tener al menos 10 caracteres").max(20),
  publishedYear: z
    .number({ error: "El año debe ser un número" })
    .int("El año debe ser un entero")
    .min(1000)
    .max(new Date().getFullYear())
    .nullable()
    .optional(),
  genre: z.string().trim().min(1).max(80).nullable().optional(),
  stock: z.number({ error: "El stock debe ser un número" }).int("El stock debe ser un entero").min(0, "El stock no puede ser negativo").optional(),
};

// POST: título, autor e ISBN son obligatorios
export const createBookSchema = z.object(bookFields).strict();

// PUT: se pueden enviar solo los campos a cambiar, pero al menos uno
export const updateBookSchema = z
  .object(bookFields)
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envía al menos un campo para actualizar",
  });

export const idParamSchema = z.coerce.number().int().positive();
