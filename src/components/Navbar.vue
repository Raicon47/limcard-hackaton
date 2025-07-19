<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/lib/supabase';

const route = useRoute();
const categories = ref([]);
const loading = ref(true);
const isAuthenticated = ref(false)

// Fetch all categories
const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true });
    
    if (error) throw error;
    categories.value = data;
  } catch (err) {
    console.error("Error fetching categories:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCategories);

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  isAuthenticated.value = !!session
})
</script>

<template>
  
  

<nav class="bg-white">
    <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
        <router-link to="/" class="flex items-center space-x-3 rtl:space-x-reverse">
            <span class="self-center text-2xl font-semibold whitespace-nowrap crimson primary-color">Mylimcard</span>
        </router-link>
        <div class="flex items-center space-x-4 rtl:space-x-reverse">
            <a href="tel:5541251234" class="text-sm  text-gray-500 dark:text-gray-500 hover:underline">(555) 412-1234</a>
             <template v-if="isAuthenticated">
                <router-link class="focus:outline-none text-white bg-secondary-color hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-3 py-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900" to="/user/dashboard">Dashboard</router-link>
              </template>
              <template v-else>
                <router-link class="focus:outline-none text-white bg-secondary-color hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-3 py-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900" to="/user/register">Signup</router-link>
              </template>
        </div>
    </div>
</nav>
<nav class="bg-primary-color dark:bg-gray-700">
    <div class="max-w-screen-xl px-4 py-3 mx-auto">
        <div class="flex items-center">
            <ul class="flex flex-row font-medium mt-0 space-x-8 rtl:space-x-reverse text-sm">
                <li>
                    <router-link to="/" class="text-white hover:underline playfair" aria-current="page">Home</router-link>
                </li>
                <li>
                    <router-link to="/cards" href="#" class="text-white hover:underline playfair">Shop Cards</router-link>
                </li>
            </ul>
        </div>
    </div>
</nav>

 <div class="p-4 text-sm text-blue-800 rounded-lg bg-blue-50" role="alert">
  <nav class="flex" aria-label="Breadcrumb">
  <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
      <template v-if="loading">
        <li class="breadcrumb-item" v-for="i in 5" :key="i">
          <a href="#" class="placeholder col-2"></a>
        </li>
      </template>
        <template v-else>
    <li v-for="category in categories" :key="category.id">
      <div class="flex items-center">
        <router-link :to="`/category/${category.slug}`" class="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white" :class="{ 'active-link': route.params.slug === category.slug }">{{ category.name }}</router-link>
      </div>
    </li>
    </template>
  </ol>
</nav>
</div>




  
</template>

<style scoped>
/* Active link styling */
.active-link {
  color: #b100e8 !important;
  font-weight: bold;
}

/* Breadcrumb styling */
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.breadcrumb-item {
  white-space: nowrap;
}

/* Placeholder loading animation */
.placeholder {
  display: inline-block;
  min-width: 80px;
  height: 16px;
  background-color: #e9ecef;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}
</style>