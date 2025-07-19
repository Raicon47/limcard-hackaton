<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';

const cards = ref([]);
const loading = ref(true);

// Fetch all active cards
const fetchCards = async () => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    cards.value = data;
  } catch (err) {
    console.error("Error fetching cards:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCards);
</script>

<template>

<section>
<div class="grid grid-cols-1 gap-6 mt-10 p-2 sm:grid-cols-3">
    
<div v-for="card in cards" 
        :key="card.id" class="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm">
    <a href="#">
        <img class="p-8 rounded-t-lg" :src="`/img/cards/${card.image_name}`"  alt="product image" />
    </a>
    <div class="px-5 pb-5">
        <a href="#">
            <h5 class="text-xl font-semibold playfair tracking-tight secondary-color">{{ card.title }}</h5>
        </a>
        <div class="flex items-center mt-2.5 mb-5">
            
            <span  v-if="card.category" class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-sm dark:bg-blue-200 dark:text-blue-800 ms-3">{{ card.category.name }}</span>
        </div>
        <div class="flex items-center justify-between">
            <span class="text-2xl font-bold primary-color crimsob"> ₦{{ card.price.toLocaleString() }}</span>
             <router-link 
              :to="`/customize/${card.id}`"
              class="text-white bg-primary-color hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Send Card
            </router-link>
        </div>
    </div>
</div>


</div>
</section>

  
</template>

<style scoped>
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

/* Ensure consistent height for card bodies */
.card-body {
  display: flex;
  flex-direction: column;
}
</style>