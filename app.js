const express = require('express') // require -> commonJs 
const crypto = require('crypto') // modulo nativo de node para generar ids unicos   
const cors = require('cors')
const movies = require('./movies.json')


const { validateMovie, validatePartialMovie } = require('./schemas/movies') // importamos la funcion de validacion del esquema de peliculas
const { callbackify } = require('util')

const app = express()
app.use(express.json()) // middleware para parsear el body de las peticiones como JSON  
app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:8080',
            'https://movies.com',
            'https://midu.dev'
        ]

        if (ACCEPTED_ORIGINS.includes(origin)) {
            return callback(null, true)
        }

        if (!origin) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    }

}))
// middleware para habilitar CORS en todas las rutas
app.disable('x-powered-by') // deshabilitar el header x-powered-by


// Todos loos recursos que sean movies se identifica con /movies
app.get('/movies', (req, res) => {
    const { genre } = req.query
    if (genre) {
        const fiteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(fiteredMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res) => { // path-to-regexp
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json(movie)

    res.status(404).json({ message: 'movie not found' })
})


app.post('/movies', (req, res) => {

    const result = validateMovie(req.body)

    if (result.success) {
        // 422 Bad Request -> el cliente envio una solicitud mal formada, en este caso, el body no cumple con el esquema definido
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }


    // EN BASE DE DATOS
    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data

    }
    movies.push(newMovie)
    res.status(201).json(newMovie) // actualizar la cache del cliente
})

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: "movie not found" })
    }

    movies.splice(movieIndex, 1) // eliminar la pelicula del array

    return res.json({ message: "movie deleted" })
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: "movie not found" })
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})

const PORT = process.env.PORT ?? 8080

app.get('/', (req, res) => {
    res.send('<p>servidor corriendo bien, pero aun falta agregarle (/) lo que quiero mostrar en la Ruta Principal</p>');
});

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})

