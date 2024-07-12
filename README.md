# IMDB-like Movie Database

This project is a full-stack application that mimics some of the functionality of IMDB. It allows users to view, add, and manage movie information including titles, synopses, and actors.

## Project Structure

This is a monorepo containing two main packages:

1. `packages/api`: A Cloudflare Worker API built with Hono and TypeScript, using Cloudflare's D1 database.
2. `packages/frontend`: A Nuxt.js frontend application.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Cloudflare account
- Wrangler CLI (v2 or later)

## Setup

1. Clone the repository:

```
git clone https://github.com/yourusername/imdb-clone.git
cd imdb-clone
```

2. Install dependencies:
```
npm install
```

3. Set up your Cloudflare Worker and D1 database:
- Log in to your Cloudflare account
- Create a new Worker
- Create a new D1 database
- Update the `wrangler.toml` file in the `packages/api` directory with your Worker name and D1 database details

4. Set up environment variables:
- Create a `.env` file in the root directory
- Add the following variables:
  ```
  API_BASE_URL=http://localhost:8787
  ```

## Development

1. Start the API (from the root directory):
```
npm run dev:api
```
2. In a new terminal, start the frontend (from the root directory):
```
npm run dev:frontend
```

3. Open your browser and navigate to `http://localhost:3000`

## Deployment

1. Deploy the API:
```
npm run deploy:api
```
2. Deploy the frontend:
```
npm run deploy:frontend
```

## Features

- View a list of movies
- View details of a specific movie
- Add new movies
- (Future feature) Edit existing movies
- (Future feature) Delete movies

## API Endpoints

- `GET /movies`: Retrieve all movies
- `GET /movies/:id`: Retrieve a specific movie
- `POST /movies`: Add a new movie
- (Future endpoint) `PUT /movies/:id`: Update an existing movie
- (Future endpoint) `DELETE /movies/:id`: Delete a movie

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.