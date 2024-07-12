<template>
  <div v-if="movie" class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">{{ movie.title }}</h1>
    <p class="mb-4">{{ movie.synopsis }}</p>
    <h2 class="text-xl font-semibold mb-2">Actors:</h2>
    <ul class="list-disc list-inside">
      <li v-for="actor in movie.actors" :key="actor">{{ actor }}</li>
    </ul>
    <Button @click="goBack" class="mt-4">Back to List</Button>
  </div>
  <div v-else>Loading...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from '@/components/ui/button/Button.vue'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const movie = ref(null)

onMounted(async () => {
  try {
    const response = await fetch(`${config.public.apiBaseUrl}/movies/${route.params.id}?includeActors=true`)
    if (response.ok) {
      movie.value = await response.json()
    } else {
      console.error('Failed to fetch movie details')
    }
  } catch (error) {
    console.error('Error fetching movie details:', error)
  }
})

const goBack = () => {
  router.push('/')
}
</script>