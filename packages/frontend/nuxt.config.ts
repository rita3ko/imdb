// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@vueuse/nuxt'],
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
  },
  components: [
    {
      path: '~/components/ui',
      pathPrefix: false,
    },
  ],
  runtimeConfig: {
    public: {
      apiBaseUrl: "https://imdb.rita.workers.dev",
    },
  },
})
