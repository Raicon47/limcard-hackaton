<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const categories = ref([])
const loading = ref(true)
const searchQuery = ref('')
const cardFound = ref(null)
const loadingCard = ref(false)

const searchCard = async () => {
  if (!searchQuery.value.trim()) {
    cardFound.value = null
    return
  }

  loadingCard.value = true

  const { data, error } = await supabase
    .from('cards')
    .select('id, title, price, image_name, description')
    .ilike('title', `%${searchQuery.value}%`)
    .order('created_at', { ascending: false })
    .limit(1)

  cardFound.value = data?.[0] || null
  loadingCard.value = false
}

const fetchCategoriesWithCards = async () => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        *,
        cards:cards(
          *,
          category:categories(name)
        )
      `)
      .order('name', { ascending: true })

    if (error) throw error
    return categories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

onMounted(async () => {
  loading.value = true
  categories.value = await fetchCategoriesWithCards()
  loading.value = false
})
</script>

<template>
  <div class="container mx-auto px-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
    </div>

    <div v-else>
      <!-- Search Bar -->
      <div class="mb-10 max-w-2xl mx-auto">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            v-model="searchQuery"
            @input="searchCard"
            type="text"
            class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search cards by title..."
          >
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="loadingCard" class="text-center mb-3">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      </div>

      <div v-if="cardFound" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="card rounded-lg shadow-sm overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
          <img 
            :src="`/img/cards/${cardFound.image_name}`" 
            :alt="cardFound.title"
            class="w-full h-48 object-cover"
          >
          <div class="p-4">
            <h5 class="text-lg font-bold mb-2">{{ cardFound.title }}</h5>
            <p class="text-gray-500 mb-4" v-if="cardFound.description">
              {{ cardFound.description }}
            </p>
            <div class="flex justify-between items-center">
              <p class="text-primary-color text-xl font-semibold">₦{{ cardFound.price.toLocaleString() }}</p>
              <router-link 
                :to="`/customize/${cardFound.id}`"
                class="bg-secondary-color text-white py-2 px-4 rounded hover:bg-secondary-color-dark transition-colors"
              >
                <i class="bi bi-send-fill mr-2"></i>Send
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories Grid -->
      <div v-if="!cardFound">
        <div v-for="category in categories" :key="category.id" class="my-10">
          <h2 class="text-2xl font-bold mb-6 pb-2 border-gray-200 font-playfair">
            {{ category.name }}
          </h2>
          
          <div v-if="category.cards.length === 0" class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            No cards available in this category yet.
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="card in category.cards" 
              :key="card.id"
              class="card h-full rounded-lg shadow-sm overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <img 
                :src="`/img/cards/${card.image_name}`" 
                :alt="card.title"
                class="w-full h-48 object-cover"
              >
              <div class="p-4 flex flex-col h-full">
                <h5 class="text-lg font-bold mb-2">{{ card.title }}</h5>
                <p class="text-gray-500 mb-4" v-if="card.description">
                  {{ card.description.substring(0, 50) }}...
                </p>
                <div class="mt-auto">
                  <p class="text-primary-color text-xl font-semibold mb-3">₦{{ card.price.toLocaleString() }}</p>
                  <router-link 
                    :to="`/customize/${card.id}`"
                    class="block w-full bg-secondary-color text-white text-center py-2 px-4 rounded hover:bg-secondary-color-dark transition-colors"
                  >
                    <i class="bi bi-send-fill mr-2"></i>Send
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
