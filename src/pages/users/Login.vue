<script setup>
import UserLayout from '@/layouts/UserLayout.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useToast } from 'vue-toastification'
import HCaptcha from '@hcaptcha/vue3-hcaptcha'

const captchaToken = ref('')
const captchaKey = ref(0)
const captchaRef = ref(null)
const email = ref('')
const password = ref('')
const router = useRouter()
const error = ref('')
const toast = useToast()

//captcha configuration
const resetCaptcha = () => {
  captchaKey.value += 1  // This forces the component to re-render (reset)
}

const onVerify = (token) => {
  captchaToken.value = token
}

const signIn = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
    options: {
      captchaToken: captchaToken.value, 
    }
  })

  if (captchaRef.value) {
    captchaRef.value.resetCaptcha() 
  }

  if (error) {
    toast.error(error.message)
  } else {
    toast.success('Sign in successful!')
  }

  if (error) {
    toast.error(error.message)
    return
  }

  router.push({ name: 'user-dashboard' })
}
</script>


<template>
  <UserLayout>
    <div class="min-h-screen flex items-center justify-center  p-4">
      <div class="w-full max-w-md">
        <!-- Added bg-white and shadow classes directly here -->
        <div class="bg-white shadow-xl overflow-hidden border border-gray-100" style="border-radius: 1rem;">
          <!-- Card Header -->
          <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-center">
            <h1 class="text-2xl font-bold text-white">Welcome Back</h1>
            <p class="primary-color mt-1">Sign in to your account</p>
          </div>

          <!-- Card Body -->
          <div class="p-8">
            <!-- Error Message -->
            <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-700" style="border-radius: 0.5rem;">
              {{ error }}
            </div>

            <!-- Form Fields -->
            <div class="mb-5">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                style="border-radius: 0.5rem;"
                required
              />
            </div>

            <div class="mb-5">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                style="border-radius: 0.5rem;"
                required
              />
            </div>

            <!-- Captcha -->
            <div class="mb-5">
               <HCaptcha
               key="captchaKey"
               sitekey="622c4146-bfb0-4648-8ad4-da12ab78d37c" 
               @verify="onVerify"
             />
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end mb-6">
              <router-link 
                to="/forgot-password" 
                class="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                Forgot password?
              </router-link>
            </div>

            <button
              @click="signIn"
              :disabled="isLoading"
              class="w-full py-3 px-4 bg-primary-color hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-md transition-all duration-300 flex items-center justify-center"
              style="border-radius: 0.5rem;"
              :class="{'opacity-75 cursor-not-allowed': isLoading}"
            >
              <span v-if="isLoading" class="inline-block mr-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </button>

            <!-- Social Login -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">or continue with</span>
              </div>
            </div>

            <button 
              type="button" 
              class="w-full flex items-center text-white bg-blue-600 justify-center px-4 py-2.5"
              style="border-radius: 0.5rem;"
            >
              <svg class="w-5 h-5 mr-2 text-[#3b5998]" fill="currentColor" viewBox="0 0 8 19">
                <path fill-rule="evenodd" d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z" clip-rule="evenodd"/>
              </svg>
              Sign in with Facebook
            </button>

            <!-- Sign Up Link -->
            <div class="mt-6 text-center text-sm text-gray-600">
              Don't have an account? 
              <router-link 
                to="/user/register" 
                class="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                Sign up
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<style>
@import url('https://fonts.cdnfonts.com/css/poppins');
.poppins {
  font-family: 'Poppins', sans-serif;
}
</style>