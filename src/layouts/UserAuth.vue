<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const logout = async () => {
  await supabase.auth.signOut()
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="bg-white shadow-md">
    <!-- Navigation -->
    <div class="container mx-auto px-4">
      <nav class="flex items-center justify-between py-3">
        <!-- Logo/Brand -->
        <router-link 
          to="/user/dashboard" 
          class="text-xl font-bold text-gray-700 hover:text-red-600 transition-colors"
          :class="{ 'text-red-600': route.path === '/user/dashboard' }"
        >
          LIMCARD
        </router-link>

        <!-- Navigation Links -->
        <div class="hidden md:flex space-x-6">
          <router-link 
            to="/cards" 
            class="text-gray-600 hover:text-red-600 transition-colors px-2 py-1"
            :class="{ 'text-red-600 font-medium': route.path === '/user/cards' }"
          >
            Cards
          </router-link>
          <router-link 
            to="/user/wallet" 
            class="text-gray-600 hover:text-red-600 transition-colors px-2 py-1"
            :class="{ 'text-red-600 font-medium': route.path === '/user/wallet' }"
          >
            Wallet
          </router-link>
        </div>

        <!-- Mobile Menu Button (hidden on desktop) -->
        <button class="md:hidden text-gray-600 focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <!-- Logout Button -->
        <button 
          @click="logout"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md text-sm transition-colors"
        >
          Logout
        </button>
      </nav>
    </div>
  </div>

  <!-- Main Content -->
  <div class="container mx-auto px-4 py-6">
    <main>
      <slot />
    </main>
  </div>
</template>