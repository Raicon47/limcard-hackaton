<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/lib/supabase';

const route = useRoute();
const category = ref(null);
const cards = ref([]);
const loading = ref(true);

// Fetch category and its cards
const fetchCategoryData = async () => {
  try {
    // Get category by slug
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', route.params.slug)
      .single();
    
    if (categoryError) throw categoryError;
    category.value = categoryData;

    // Get cards for this category
    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('category_id', categoryData.id)
      .eq('is_active', true);
    
    if (cardsError) throw cardsError;
    cards.value = cardsData;
    
  } catch (err) {
    console.error("Error fetching category data:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCategoryData);
</script>

<template>
  <div class="container mx-auto my-5 px-4">
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-5">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
    </div>
    
    <!-- Category not found -->
    <div v-else-if="!category" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
      Category not found. <router-link to="/cards" class="text-blue-600 hover:underline">Browse all cards</router-link>
    </div>

    <!-- Category content -->
    <div v-else>
      <router-link 
        to="/"
        class="inline-block px-3 py-2 mb-5 text-gray-700 hover:text-gray-900"
      >
        <i class="bi bi-arrow-left mr-1"></i> Back
      </router-link>
      
      <h1 class="text-center text-gray-500 mb-4 font-playfair font-bold text-2xl">{{ category.name }} Cards</h1>
        
      <div v-if="cards.length === 0" class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        No cards available in this category yet.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div 
          v-for="card in cards" 
          :key="card.id"
          class="mb-4"
        >
          <div class="card h-full shadow-sm rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <img 
              :src="`/img/cards/${card.image_name}`" 
              class="w-full h-48 object-cover" 
              :alt="card.title"
            >
            <div class="p-4 flex flex-col h-full">
              <h5 class="text-secondary-color font-bold text-lg mb-2">{{ card.title }}</h5>
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
</template>