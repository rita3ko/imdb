<template>
  <div class="container mx-auto p-4">
    <Button @click="navigateBack" class="mb-4">Back to List</Button>
    <Card v-if="movie">
      <CardHeader>
        <CardTitle>{{ movie.title }}</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="mb-4">{{ movie.synopsis }}</p>
        <h3 class="font-bold mb-2">Actors:</h3>
        <ul class="list-disc list-inside mb-4">
          <li v-for="actor in movie.actors" :key="actor">{{ actor }}</li>
        </ul>
        <div class="mb-4">
          <h3 class="font-bold mb-2">
            Average Rating: 
            {{ averageRating !== null ? `${averageRating.toFixed(1)} / 5` : 'No ratings yet' }}
          </h3>
        </div>
        <div>
          <h3 class="font-bold mb-2">Rate this movie:</h3>
          <div class="flex items-center">
            <StarRating v-model="userRating" />
            <span class="ml-2">{{ userRating || 0 }} / 5</span>
          </div>
          <Button @click="submitRating" :disabled="!userRating" class="mt-2">Submit Rating</Button>
        </div>
      </CardContent>
    </Card>
    <p v-else>Loading movie details...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import StarRating from '@/components/ui/star-rating/StarRating.vue'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const movie = ref(null)
const averageRating = ref(null)
const userRating = ref(0)

const fetchMovie = async () => {
  try {
    const response = await fetch(`${config.public.apiBaseUrl}/movies/${route.params.id}?includeActors=true`)
    movie.value = await response.json()
    await fetchAverageRating()
  } catch (error) {
    console.error('Error fetching movie:', error)
  }
}

const fetchAverageRating = async () => {
  try {
    const response = await fetch(`${config.public.apiBaseUrl}/movies/${route.params.id}/ratings`)
    const data = await response.json()
    averageRating.value = data.averageRating || null
  } catch (error) {
    console.error('Error fetching average rating:', error)
  }
}

const submitRating = async () => {
  if (!userRating.value) return

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/movies/${route.params.id}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'user123', // In a real app, this would be the logged-in user's ID
        rating: userRating.value
      }),
    })
    if (response.ok) {
      await fetchAverageRating()
      userRating.value = 0
    } else {
      console.error('Failed to submit rating')
    }
  } catch (error) {
    console.error('Error submitting rating:', error)
  }
}

const navigateBack = () => {
  router.push('/')
}

onMounted(fetchMovie)
</script>