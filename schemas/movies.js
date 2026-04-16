const z = require('zod')

const movieSchema = z.object({
        title: z.string({
            invalid_type_error: "titulo es requerido en String",
            required_error: "titulo es requerido"
        }),
        year: z.number().int().positive().min(1900).max(2024),
        director: z.string(),
        duration: z.number().int().positive(),
        rate: z.number().min(0).max(10).optional(),
        poster: z.string().url({
            message: "poster debe ser una URL valida"
        }),
        genre: z.array(
            z.enum(['Action', 'Comedy', 'Drama', 'Crime', 'Romance', 'Sci-Fi', 'Fantasy', 'Horror', 'Thriller', 'Adventure']), 
            {
                required_error: "genero de pelicula es requerido",
                invalid_type_error: "genero de pelicula debe ser un array de strings"
            }
        )
    })

    function validateMovie (object) {
        return movieSchema.safeParse(object)
    }

    function validatePartialMovie (object) {
        return movieSchema.partial().safeParse(object)
    }

    module.exports = {
        validateMovie,
        validatePartialMovie
    }

