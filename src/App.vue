<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import InstallPrompt from '@/components/InstallPrompt.vue'

const bounce = ref(false)
const user = ref(null)
const router = useRouter()

// Fetch the user on mount
onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  user.value = data.user

  // Listen to auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null

    if (!session) {
      router.push('/') // redirect to login if signed out
    }
  })
})


const logout = async () => {
  await supabase.auth.signOut()
}
</script>

<template>
   <InstallPrompt />

  <router-view />


</template>

<style>
body {
  font-family: 'Inter', sans-serif;
}
.primary-color {
  color: #621ee9 !important;
}
.bg-primary-color {
  background-color: #621ee9 !important;
}
.secondary-color {
  color: rgb(250, 40, 75) !important;
}
.bg-secondary-color {
  background-color: rgb(250, 40, 75)!important;
}
/* fonts  */
.playfair {
font-family: 'Playfair Display', sans-serif;                                             
}
.lora {
 font-family: 'Lora', sans-serif;
}
.crimson {
 font-family: 'Crimson', sans-serif;
}
/* fonts  */
/* wishcards  */
.wishcard {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.wishcard:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}


/* gift icon  */
.gift-float {
  position: fixed;
  bottom: 30px;
  right: 40px;
  z-index: 9999;
  animation: bounce 1.2s infinite ease-in-out;
  cursor: pointer;
}

.gift-icon {
  font-size: 1.6rem; /* smaller size */
  color: #b100e8;     /* nice gift red */
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3));
}

/* Bounce animation */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}
</style>
