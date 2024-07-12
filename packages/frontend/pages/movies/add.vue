<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Add New Movie</h1>
    <form @submit.prevent="addMovie" class="space-y-4">
      <div>
        <label for="title" class="block mb-1">Title:</label>
        <input v-model="newMovie.title" id="title" required class="w-full p-2 border rounded">
      </div>
      <div>
        <label for="synopsis" class="block mb-1">Synopsis:</label>
        <textarea v-model="newMovie.synopsis" id="synopsis" required class="w-full p-2 border rounded"></textarea>
      </div>
      <div>
        <label for="actors" class="block mb-1">Actors (comma-separated):</label>
        <input v-model="actorsInput" id="actors" class="w-full p-2 border rounded">
      </div>
      <Button type="submit">Add Movie</Button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'

const config = useRuntimeConfig()
const router = useRouter()

const newMovie = ref({
  title: '',
  synopsis: '',
  actors: [] as string[]
})

const actorsInput = ref('')

const addMovie = async () => {
  newMovie.value.actors = actorsInput.value.split(',').map(actor => actor.trim())
  
  try {
    const response = await fetch(`${config.public.apiBaseUrl}/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMovie.value),
    })
    
    if (response.ok) {
      const createdMovie = await response.json()
      // Assuming the API returns the created movie object with an id
      if (createdMovie && createdMovie.id) {
        // Navigate to the movie details page
        router.push(`/movies/${createdMovie.id}`)
      } else {
        console.error('Created movie does not have an id')
        router.push('/') // Fallback to home page if no id is present
      }
    } else {
      console.error('Failed to add movie')
    }
  } catch (error) {
    console.error('Error adding movie:', error)
  }
}
</script>