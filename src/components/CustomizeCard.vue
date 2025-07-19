<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()
const card = ref(null)
const loading = ref(true)
const note = ref('')
const recipientName = ref('')

const handleSubmit = async () => {
  router.push({
    path: '/send',
    query: {
      cardId: card.value.id,
      recipient: recipientName.value,
      msg: note.value
    }
  })
}

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', route.params.cardId)
      .single()
    
    if (error) throw error
    card.value = data
  } catch (err) {
    console.error("Error fetching card:", err)
  } finally {
    loading.value = false
  }
})

const formattedPrice = computed(() => {
  return card.value ? `₦${card.value.price.toLocaleString()}` : ''
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <router-link 
      to="/"
      class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
    >
      <i class="bi bi-arrow-left mr-2"></i> Back
    </router-link>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
    </div>

    <div v-else-if="!card" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
      Card not found. <router-link to="/" class="text-blue-600 hover:underline">Browse cards</router-link>
    </div>

    <div v-else class="flex flex-col lg:flex-row gap-8">
      <!-- Left Column - Card Preview -->
      <div class="w-full lg:w-1/2">
        <div class="relative rounded-xl overflow-hidden shadow-lg">
          <!-- Card Image -->
          <img 
            :src="`/img/cards/${card.image_name}`" 
            class="w-full h-auto object-cover"
            :alt="card.title"
          >
          
          <!-- Overlay for Note Preview -->
          <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div class="bg-white/90 backdrop-blur-sm p-4 rounded-lg max-h-48 overflow-y-auto">
              <p v-if="recipientName" class="font-bold text-gray-800 mb-1">Dear {{ recipientName }},</p>
              <p class="text-gray-700">{{ note || 'Your message will appear here' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Customization Form -->
      <div class="w-full lg:w-1/2">
        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Personalize Your Card</h2>
            <p class="text-gray-600">Make it special with your personal message</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label for="recipientName" class="block text-sm font-medium text-gray-700 mb-1">Recipient's Name</label>
              <input 
                type="text" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                id="recipientName"
                v-model="recipientName"
                placeholder="Enter name"
                required
              >
            </div>
            
            <div>
              <label for="note" class="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
              <textarea
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                id="note"
                v-model="note"
                rows="5"
                placeholder="Write your personal message..."
                required
              ></textarea>
            </div>
            
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
              <div>
                <p class="text-xl font-bold text-secondary-color">{{ formattedPrice }}</p>
              </div>
              <button 
                type="submit" 
                class="w-full bg-primary-color text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
              >
               Preview & Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>




