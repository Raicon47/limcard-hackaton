<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

</script>

<template>

  <router-link to="/" class=""><h1 class="text-center primary-color mt-5 fw-bold">
   <span class="self-center text-2xl font-semibold whitespace-nowrap crimson primary-color">Mylimcard</span>
  </h1></router-link>

 <div class="container col-md-5 mx-auto my-3 text-center">
     <main>
         <slot />
     </main>
    
  </div>
</template>
