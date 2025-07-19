<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'

const transactionId = ref(null)
const txRef = ref(null)
const status = ref(null)
const message = ref('Verifying...')
const verified = ref(false)

const route = useRoute()

onMounted(async () => {
  transactionId.value = route.query.transaction_id
  txRef.value = route.query.tx_ref
  status.value = route.query.status

 window.history.replaceState({}, document.title, '/user/verify')

  if (!transactionId.value) {
    message.value = 'No transaction ID found.'
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()

    const response = await fetch('https://ruwhiqctiylpmysducqs.supabase.co/functions/v1/flutterwave-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
         'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ transaction_id: transactionId.value })
    })

    const result = await response.json()

    if (response.ok) {
      message.value = `✅ Wallet credited with ${new Intl.NumberFormat('en-NG', {
       style: 'currency',
          currency: 'NGN',
         minimumFractionDigits: 0
      }  ).format(result.credited)}`
      verified.value = true
    } else {
      message.value = `❌ Verification failed: ${result.error}`
    }
  } catch (err) {
    message.value = '❌ Error verifying transaction.'
    console.error(err)
  }
})
</script>

<template>
  <div class="container bg-light col-md-4 mx-auto text-center mt-5 p-5">
   <div class="card p-5 text-light bg-secondary-color">
     <h4 class="text-uppercase fw-bold text-light playfair">Payment Receipt</h4>
    <p><strong>Status:</strong> {{ status }}</p>
    <p><strong>Transaction ID:</strong> {{ transactionId }}</p>
    <p><strong>Transaction Ref:</strong> {{ txRef }}</p>
    <p class="mt-3">{{ message }}</p>


    <router-link to="/user/dashboard" class="btn btn-light mt-3">
      Go to Dashboard
    </router-link>
   </div>
  </div>
</template>
