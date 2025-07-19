<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const email = ref('');
const error = ref('');
const success = ref(false);

let messageTimer = null;

const submitEmail = async () => {
    // Clear any existing timer
  clearTimeout(messageTimer);
  try {
    const { data, error: supabaseError } = await supabase
      .from('newsletter')
      .insert([{ email: email.value }]);

    if (supabaseError) throw supabaseError;
    
    success.value = true;
    email.value = ''; // Reset form
     messageTimer = setTimeout(() => {
      success.value = false;
    }, 2000);
  } catch (err) {
    error.value = 'Failed to subscribe. Please try again.';
  }
};
</script>

<template>
    
<div class="bg-gray-300 p-3 my-4">
  <form @submit.prevent="submitEmail" class="max-w-sm mx-auto my-10"> 
  <label for="email" class="block mb-2 text-sm font-medium text-gray-700">Join our weekly newsletter</label>
  <input 
  v-model="email" 
  type="email" 
  required
  aria-describedby="helper-text-explanation" 
  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
  placeholder="name@mylimcard.com">
   <button type="submit" class="bg-primary-color p-2 text-white rounded mt-1">Subscribe</button>
    <p v-if="error">{{ error }}</p>
    <p v-if="success" class="primary-color">Thanks for subscribing!</p>

  <p class="mt-2 text-sm text-gray-700">Get weekly updates as we build and intergate more features into Limcard</p>
</form>
</div>

</template>