<script setup>
import UserAuth from '../../layouts/UserAuth.vue'
import { supabase } from '@/lib/supabase'
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import HomeCards from '../../components/HomeCards.vue'

const userProfile = ref(null)
const error = ref('')
const loading = ref(true)

const fetchUserProfile = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw authError || new Error('No user')

    const { data, error: profileError } = await supabase
      .from('users')
      .select('fullname, email, wallet_balance, phone')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    userProfile.value = { ...data, id: user.id }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<template>
  <UserAuth>

    <!-- cards  -->

<section class="container">

     <div v-if="error" class="alert alert-danger">{{ error }}</div>

       <div v-else-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary"></div>
       </div>

        <!-- card  -->
  <HomeCards />
    <!-- card  -->

     
     

</section>

  <!-- cards  -->
  </UserAuth>
</template>
