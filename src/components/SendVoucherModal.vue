<script setup>
import { ref, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import { useToast } from 'vue-toastification'

const props = defineProps({
  voucher: Object
})

const show = ref(false)
const searchQuery = ref('')
const userFound = ref(null)
const loadingUser = ref(false)
const sending = ref(false)
const toast = useToast()

const searchUser = async () => {
  if (!searchQuery.value.trim()) return
  loadingUser.value = true
  const { data, error } = await supabase
    .from('users')
    .select('id, fullname, email')
    .or(`email.ilike.%${searchQuery.value}%,fullname.ilike.%${searchQuery.value}%`)
    .limit(1)

  userFound.value = data?.[0] || null
  loadingUser.value = false
}

const sendVoucher = async () => {
  sending.value = true
  const { data: userData, error: userError } = await supabase.auth.getUser()
  const sender = userData?.user

  if (!sender) {
    toast.error("User not authenticated")
    sending.value = false
    return
  }

  // 1. Get sender's current wallet balance
  const { data: senderData, error: fetchUserError } = await supabase
    .from('users')
    .select('wallet_balance')
    .eq('id', sender.id)
    .single()

  if (fetchUserError || !senderData) {
    toast.error("Unable to fetch wallet balance")
    sending.value = false
    return
  }

  const balance = senderData.wallet_balance
  const voucherAmount = props.voucher.price

  // 2. Check if user has enough balance
  if (balance < voucherAmount) {
    toast.error("Insufficient wallet balance")
    sending.value = false
    return
  }

  // 3. Generate voucher code
  const generateCode = () => {
    return 'LC-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const code = generateCode()

  // 4. Run all 3 DB operations: update wallet, insert voucher, insert transaction
  const { error: walletError } = await supabase
    .from('users')
    .update({
      wallet_balance: balance - voucherAmount
    })
    .eq('id', sender.id)

  const { error: voucherError } = await supabase
    .from('sent_vouchers')
    .insert({
      code,
      price: voucherAmount,
      sender_id: sender.id,
      receiver_id: userFound.value.id
    })

  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: sender.id,
      amount: -voucherAmount,
      type: 'withdrawal',
      description: `Sent voucher to ${userFound.value.fullname} (₦${voucherAmount})`
    })

  if (walletError || voucherError || transactionError) {
    toast.error("Something went wrong while sending voucher")
    console.error({ walletError, voucherError, transactionError })
  } else {
    toast.success("Voucher sent!")
    show.value = false
  }

  sending.value = false
}

defineExpose({ show })
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
      <div class="p-6">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-bold text-gray-800">Send Voucher</h3>
          <button @click="show = false" class="text-gray-500 hover:text-gray-700">
            <i class="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <p class="text-gray-600 mb-4">
          You're sending <span class="font-bold text-primary-color">₦{{ voucher?.price?.toLocaleString() }}</span>
        </p>

        <div class="mb-4">
          <input
            v-model="searchQuery"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search user by email or username"
            @input="searchUser"
          />
        </div>

        <div v-if="loadingUser" class="flex justify-center py-4">
          <div class="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        </div>

        <div v-else-if="userFound" class="bg-gray-50 p-4 rounded-lg mb-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">{{ userFound.fullname || userFound.email }}</p>
            </div>
          </div>
          <button 
            @click="sendVoucher" 
            class="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
            :disabled="sending"
          >
            <span v-if="sending">
              <span class="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Sending...
            </span>
            <span v-else>
              Send Voucher
            </span>
          </button>
        </div>

        <div v-else-if="searchQuery" class="text-center py-4 text-gray-500">
          User not found
        </div>

    <i @click="show = false" class="bi bi-x-lg mt-3 text-danger fw-bold">close</i>

      </div>
    </div>
  </div>
</template>