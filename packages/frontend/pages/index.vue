<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Movie Database</h1>
    <Button @click="navigateToAddMovie" class="mb-4">Add New Movie</Button>
    <div v-if="movies.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="movie in movies" :key="movie.id" class="cursor-pointer" @click="navigateToMovie(movie.id)">
        <CardHeader>
          <CardTitle>{{ movie.title }}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="truncate">{{ movie.synopsis }}</p>
        </CardContent>
      </Card>
    </div>
    <p v-else>No movies found. Add some movies to get started!</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Movie {
  id: number
  title: string
  synopsis: string
}

const movies = ref<Movie[]>([])

const fetchMovies = async () => {
  const config = useRuntimeConfig()
  try {
    const response = await fetch(`${config.public.apiBaseUrl}/movies`)
    movies.value = await response.json()
  } catch (error) {
    console.error('Error fetching movies:', error)
  }
}

const navigateToMovie = (id: number) => {
  navigateTo(`/movies/${id}`)
}

const navigateToAddMovie = () => {
  navigateTo('/movies/add')
}

onMounted(fetchMovies)
</script>