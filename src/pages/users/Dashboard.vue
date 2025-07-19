<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabase'
import UserAuth from '../../layouts/UserAuth.vue'
import StatsChart from '@/components/StatsChart.vue'

const user = ref(null)
const userProfile = ref(null)
const loading = ref(true)
const error = ref(null)
const router = useRouter()
const sentCards = ref([])
const totalSpent = ref(0)
const stats = ref({ totalSpent: 0, totalCards: 0 })
const chartData = ref(null)
const activeTab = ref('history') // 'history' or 'stats'

const fetchUser = async () => {
  try {
    const {
      data: { user: currentUser },
      error: authError
    } = await supabase.auth.getUser()

    if (authError) throw authError
    user.value = currentUser

    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single()

    if (profileError) throw profileError
    userProfile.value = profileData
  } catch (err) {
    console.error('Error loading user profile:', err)
    error.value = err.message || 'Could not load user data.'
  } finally {
    loading.value = false
  }
}

const fetchSentCards = async () => {
  if (!user.value) return

  const { data, error } = await supabase
    .from('card_messages')
    .select('id, slug, recipient_name, message, created_at, price, cards(image_name, title)')
    .eq('sender_id', user.value.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sent cards:', error)
    return
  }

  sentCards.value = data
  totalSpent.value = data.reduce((sum, card) => sum + Number(card.price || 0), 0)
}

const fetchStats = async () => {
  const userId = (await supabase.auth.getUser()).data.user.id

  const { data: messages } = await supabase
    .from('card_messages')
    .select('price')
    .eq('sender_id', userId)

  const totalSpent = messages.reduce((acc, m) => acc + Number(m.price), 0)
  const totalCards = messages.length

  stats.value = { totalSpent, totalCards }

  chartData.value = {
    labels: ['Cards Sent'],
    datasets: [
      {
        label: 'Total Spent (₦)',
        backgroundColor: '#b100e8',
        data: [totalSpent]
      }
    ]
  }
}

onMounted(async () => {
  await fetchUser()
  await fetchSentCards()
  await fetchStats()
})

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Card Sending Stats'
    }
  }
}
</script>

<template>
  <UserAuth>
    <!-- Error State -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="text-center py-12">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
    </div>
    
    <!-- Main Content -->
    <main v-else class="container mx-auto px-4 py-6">
      <!-- Welcome Banner -->
      <div class="bg-gray-800 rounded-lg p-4 mb-6">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-bold text-white font-playfair">Welcome, {{ userProfile.fullname }}</h3>
          <router-link 
            to="/user/wallet" 
            class="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            ₦{{Number(userProfile?.wallet_balance).toLocaleString('en-US')}}
          </router-link>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex space-x-8">
          <button
            @click="activeTab = 'history'"
            :class="{
              'border-blue-500 text-blue-600': activeTab === 'history',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'history'
            }"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Card History
          </button>
          <button
            @click="activeTab = 'stats'"
            :class="{
              'border-blue-500 text-blue-600': activeTab === 'stats',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'stats'
            }"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Sending Stats
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div>
        <!-- Card History Tab -->
        <div v-if="activeTab === 'history'" class="space-y-4">
          <h4 class="text-lg font-bold font-playfair mb-4">Card History</h4>
          
          <div v-if="sentCards.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
            <p class="text-gray-500">No cards sent yet</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="card in sentCards"
              :key="card.id"
              class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start">
                <h5 class="font-medium text-gray-800 font-playfair">To: {{ card.recipient_name }}</h5>
                <span class="text-sm text-gray-500">{{ new Date(card.created_at).toLocaleString() }}</span>
              </div>
              <p class="text-gray-600 mt-1 mb-3">{{ card.message }}</p>
              <div class="flex justify-between items-center">
                <span class="font-bold">₦{{ Number(card.price).toLocaleString('en-US') }}</span>
                <a 
                  :href="`/card/${card.slug}`" 
                  target="_blank" 
                  class="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  View Card
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Tab -->
        <div v-if="activeTab === 'stats'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-4 rounded-lg shadow-sm">
              <p class="text-gray-500 mb-1 font-playfair">Total Spent</p>
              <h4 class="text-2xl font-bold text-red-600">₦{{ totalSpent.toLocaleString('en-US') }}</h4>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm">
              <p class="text-gray-500 mb-1 font-playfair">Cards Sent</p>
              <h4 class="text-2xl font-bold text-blue-600">{{ sentCards.length }}</h4>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg shadow-sm">
            <StatsChart v-if="chartData" :data="chartData" :options="chartOptions" />
          </div>
        </div>
      </div>
    </main>
  </UserAuth>
</template>