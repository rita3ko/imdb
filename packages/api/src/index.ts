import { Hono } from 'hono'
import { z } from 'zod'
//import { createHonoMiddleware } from "@fiberplane/hono";
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

//app.use(createHonoMiddleware(app))

// Schema for movie input
const movieSchema = z.object({
  title: z.string(),
  synopsis: z.string(),
  actors: z.array(z.string()),
})

app.use('/*', cors({
  origin: ['http://localhost:3000', 'https://localhost:3000', 'https://imdb.ritakozlov.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}))

// GET all movies
app.get('/movies', async (c) => {
  const includeActors = c.req.query('includeActors') === 'true'

  let query = 'SELECT id, title, synopsis FROM movies'
  
  if (includeActors) {
    query = `
      SELECT movies.id, movies.title, movies.synopsis, 
             GROUP_CONCAT(movie_actors.actor_name) as actors
      FROM movies
      LEFT JOIN movie_actors ON movies.id = movie_actors.movie_id
      GROUP BY movies.id
    `
  }

  const { results } = await c.env.DB.prepare(query).all()

  const movies = results.map(movie => ({
    id: movie.id,
    title: movie.title,
    synopsis: movie.synopsis,
    ...(includeActors && { actors: movie.actors ? movie.actors.split(',') : [] })
  }))

  return c.json(movies)
})

// GET a specific movie
app.get('/movies/:id', async (c) => {
  const id = c.req.param('id')
  const includeActors = c.req.query('includeActors') === 'true'

  let query = 'SELECT id, title, synopsis FROM movies WHERE id = ?'
  
  if (includeActors) {
    query = `
      SELECT movies.id, movies.title, movies.synopsis, 
             GROUP_CONCAT(movie_actors.actor_name) as actors
      FROM movies
      LEFT JOIN movie_actors ON movies.id = movie_actors.movie_id
      WHERE movies.id = ?
      GROUP BY movies.id
    `
  }

  const movie = await c.env.DB.prepare(query).bind(id).first()

  if (!movie) return c.json({ error: 'Movie not found' }, 404)
  
  return c.json({
    id: movie.id,
    title: movie.title,
    synopsis: movie.synopsis,
    ...(includeActors && { actors: movie.actors ? movie.actors.split(',') : [] })
  })
})

// POST a new movie
app.post('/movies', async (c) => {
  const body = await c.req.json()
  const result = movieSchema.safeParse(body)
  
  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }

  const { title, synopsis, actors } = result.data

  const { results } = await c.env.DB.prepare(
    'INSERT INTO movies (title, synopsis) VALUES (?, ?) RETURNING id'
  ).bind(title, synopsis).run()

  const movieId = results[0].id

  for (const actor of actors) {
    await c.env.DB.prepare(
      'INSERT INTO movie_actors (movie_id, actor_name) VALUES (?, ?)'
    ).bind(movieId, actor).run()
  }

  return c.json({ id: movieId, title, synopsis, actors }, 201)
})

// PUT (update) a movie
app.put('/movies/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const result = movieSchema.safeParse(body)
  
  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }

  const { title, synopsis, actors } = result.data

  await c.env.DB.prepare(
    'UPDATE movies SET title = ?, synopsis = ? WHERE id = ?'
  ).bind(title, synopsis, id).run()

  await c.env.DB.prepare(
    'DELETE FROM movie_actors WHERE movie_id = ?'
  ).bind(id).run()

  for (const actor of actors) {
    await c.env.DB.prepare(
      'INSERT INTO movie_actors (movie_id, actor_name) VALUES (?, ?)'
    ).bind(id, actor).run()
  }

  return c.json({ id, title, synopsis, actors }, 200)
})

// DELETE a movie
app.delete('/movies/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM movies WHERE id = ?').bind(id).run()
  await c.env.DB.prepare('DELETE FROM movie_actors WHERE movie_id = ?').bind(id).run()
  return c.json({ message: 'Movie deleted successfully' }, 200)
})

// Add a new rating
app.post('/movies/:id/ratings', async (c) => {
  const movieId = c.req.param('id')
  const { userId, rating } = await c.req.json()

  if (!userId || !rating || rating < 1 || rating > 5) {
    return c.json({ error: 'Invalid rating data' }, 400)
  }
  

  try {
    await c.env.DB.prepare(
      'INSERT INTO ratings (movie_id, user_id, rating) VALUES (?, ?, ?)'
    ).bind(movieId, userId, rating).run()

    return c.json({ message: 'Rating added successfully' }, 201)
  } catch (error) {
    return c.json({ error: 'Failed to add rating' }, 500)
  }
})

// Get average rating for a movie
app.get('/movies/:id/ratings', async (c) => {
  const movieId = c.req.param('id')

  try {
    const result = await c.env.DB.prepare(
      'SELECT AVG(rating) as averageRating FROM ratings WHERE movie_id = ?'
    ).bind(movieId).first()

    return c.json({ averageRating: result?.averageRating || 0 })
  } catch (error) {
    return c.json({ error: 'Failed to fetch average rating' }, 500)
  }
})

export default app