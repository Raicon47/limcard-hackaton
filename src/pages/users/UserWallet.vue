<script setup>
import UserAuth from '../../layouts/UserAuth.vue'
import { supabase } from '@/lib/supabase'
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'

const userProfile = ref(null)
const transactions = ref([])
const error = ref('')
const loading = ref(true)
const amount = ref('')
const toast = useToast()

const fetchUserProfile = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw authError || new Error('No user')

    // Fetch user profile
    const { data, error: profileError } = await supabase
      .from('users')
      .select('fullname, email, wallet_balance, phone')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError
    userProfile.value = { ...data, id: user.id }

    // Fetch user transactions
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (transactionsError) throw transactionsError
    transactions.value = transactionsData

  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const depositFunds = async () => {
  if (!amount.value || isNaN(amount.value)) {
    toast.error('Please enter a valid amount')
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()

    const response = await fetch('https://ruwhiqctiylpmysducqs.supabase.co/functions/v1/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        amount: parseFloat(amount.value),
        email: userProfile.value.email,
        phone: userProfile.value.phone,
        name: userProfile.value.fullname,
        user_id: userProfile.value.id
      })
    })

    const result = await response.json()

    if (!response.ok) throw new Error(result.message || 'Payment request failed')

    if (result?.data?.link) {
      window.location.href = result.data.link
    } else {
      toast.error('No payment URL returned')
    }
  } catch (err) {
    toast.error(`Deposit error: ${err.message}`)
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<template>
  <UserAuth>
    <div class="container mx-auto px-4 py-6 max-w-6xl">
      <!-- Header -->
      <div class="border-b border-gray-200 pb-4 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-2xl font-bold font-playfair">Your Wallet</h3>
            <p class="text-gray-600 uppercase">{{ userProfile?.fullname }}</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ error }}
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Balance Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <!-- Current Balance -->
          <div class="bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-xl font-playfair text-white mb-2">Current Balance</h3>
            <h2 class="text-3xl font-bold text-white mb-1">
              ₦{{Number(userProfile?.wallet_balance).toLocaleString('en-US')}}
            </h2>
            <p class="text-blue-200 italic">Your available funds</p>
          </div>

          <!-- Add Funds -->
          <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 class="text-xl font-playfair mb-2">Add Funds</h3>
            <p class="text-xs font-bold text-gray-500 mb-4">SECURED BY FLUTTERWAVE</p>
            
            <div class="flex mb-3">
              <input
                v-model="amount"
                type="text"
                class="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="₦5,000"
              />
              <button
                @click="depositFunds"
                class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-r-lg font-playfair transition-colors"
              >
                Add Funds
              </button>
            </div>
            
            <p class="text-xs italic text-gray-500">CBN charges 7.23% for each transaction</p>
          </div>
        </div>

        <!-- Transactions Section -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-6">
            <h4 class="text-lg font-playfair mb-4">Recent Transactions</h4>
            
            <div v-if="transactions.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
              <p class="text-gray-500">No transactions yet</p>
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="tx in transactions"
                :key="tx.id"
                class="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <h5 class="font-medium" :class="tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'">
                      ₦{{ Math.abs(Number(tx.amount)).toLocaleString('en-US') }}
                    </h5>
                    <p class="text-sm text-gray-500">{{ tx.description || tx.type }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-500">{{ new Date(tx.created_at).toLocaleString() }}</p>
                    <span class="text-xs px-2 py-1 rounded-full" :class="{
                      'bg-green-100 text-green-800': tx.status === 'completed',
                      'bg-yellow-100 text-yellow-800': tx.status === 'pending',
                      'bg-red-100 text-red-800': tx.status === 'failed'
                    }">
                      {{ tx.status || 'completed' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <router-link
              to="/user/transactions"
              class="inline-block mt-4 text-blue-600 hover:text-blue-800 hover:underline"
            >
              View all transactions →
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </UserAuth>
</template>