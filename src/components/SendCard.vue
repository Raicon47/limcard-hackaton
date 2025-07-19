<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const card = ref(null)
const phone = ref('')
const loading = ref(true)
const sending = ref(false)
const error = ref(null)

const cardId = route.query.cardId
const recipient = route.query.recipient
const msg = route.query.msg

onMounted(async () => {
  try {
    if (!cardId || !recipient || !msg) {
      throw new Error('Missing card details')
    }

    const { data, error: fetchError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .single()

    if (fetchError || !data) throw fetchError || new Error('Card not found')
    
    card.value = data
  } catch (err) {
    error.value = err.message || 'Failed to load card details'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const sendCard = async () => {
  const slug = 'card-' + nanoid(6)

  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData?.user

  if (userError || !user) {
    toast.error('You must be logged in to send a card.')
    return
  }

  // 1. Fetch user to get wallet_balance
  const { data: userRow, error: userFetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (userFetchError || !userRow) {
    alert('User not found.')
    return
  }

  // 2. Check if balance is enough
  if (parseFloat(userRow.wallet_balance) < card.value.price) {
    toast.error('Insufficient balance. Please fund your wallet.')
    return
  }

  // 3. Insert card message
  const { error: insertError } = await supabase.from('card_messages').insert({
    card_id: card.value.id,
    recipient_name: recipient,
    message: msg,
    slug,
    sender_id: user.id,
    sender_name: user?.user_metadata?.fullname || 'Anonymous',
    price: card.value.price,
  })

  if (insertError) {
    toast.error('Could not send card.')
    console.error(insertError)
    return
  }

  // 4. Update user's wallet balance
  const newBalance = parseFloat(userRow.wallet_balance) - card.value.price

  const { error: balanceUpdateError } = await supabase
    .from('users')
    .update({ wallet_balance: newBalance })
    .eq('id', user.id)

  // 5. Log transaction
  const { error: transactionError } = await supabase.from('transactions').insert({
    user_id: user.id,
    amount: -card.value.price,
    type: 'withdrawal',
    description: `Card sent to ${recipient}`
  })

  if (balanceUpdateError || transactionError) {
    toast.error('Error updating balance or logging transaction. Please contact support.')
    console.error(balanceUpdateError || transactionError)
    return
  }

  // 6. Open WhatsApp
  const waLink = `https://wa.me/${phone.value}?text=🎉 You've received a card! View it here: https://limcard.vercel.app/card/${slug}`
  window.open(waLink, '_blank')

  // 7. Optional redirect to confirmation
  router.push(`/card/${slug}`)
}

</script>

<template>
   <router-link to="/" class="inline-flex items-center text-blue-400 mb-4 transition-colors">
          <i class="bi bi-arrow-left mr-2"></i> Back
        </router-link>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
       
        <h2 class="text-2xl font-bold">Send Your Card</h2>
        <p class="">You're almost there! 🎉</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-6 bg-red-50 text-red-700 rounded-lg m-4">
        {{ error }}
      </div>

      <!-- Main Content -->
      <div v-else-if="card" class="p-6">
        <!-- Card Preview -->
        <div class="mb-8 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <img 
            :src="`/img/cards/${card.image_name}`" 
            class="w-full h-48 object-cover"
            alt="Card preview"
          >
          <div class="p-4 bg-gray-50">
            <div class="text-sm text-gray-500 mb-1">To: {{ recipient }}</div>
            <p class="text-gray-700 italic">"{{ msg || 'Your special message' }}"</p>
          </div>
        </div>

       <h4 class="fw-bold">Price: ₦{{ card.price.toLocaleString() }}</h4>

      <input
        v-model="phone"
        type="tel"
        class="form-control my-3"
        placeholder="Enter WhatsApp number e.g. 2348012345678"
        required
      />

      <button
        v-if="phone"
        class="bg-green-500 mx-2 p-2 rounded mb-4"
        @click="sendCard"
      >
        <i class="bi bi-whatsapp me-2"></i>Send via WhatsApp
      </button>

      </div>
    </div>
  </div>
</template>