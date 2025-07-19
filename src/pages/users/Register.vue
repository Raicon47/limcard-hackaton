<script setup>
import UserLayout from '@/layouts/UserLayout.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useToast } from 'vue-toastification'
import HCaptcha from '@hcaptcha/vue3-hcaptcha'

const captchaToken = ref('')
const captchaRef = ref(null)
const captchaKey = ref(0)
const fullname = ref('')
const email = ref('')
const password = ref('')
const phone = ref('')
const state = ref('')
const router = useRouter()
const error = ref('')
const isLoading = ref(false)
const toast = useToast()

const resetCaptcha = () => {
  captchaKey.value += 1  // This forces the component to re-render (reset)
}

//captcha configuration
const onVerify = (token) => {
  captchaToken.value = token
}

//signup with email and password
const signUp = async () => {
  try {
    // 1. Auth signup
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        captchaToken: captchaToken.value, 
        data: {
          type: 'user',
          fullname: fullname.value
        },
      }
    });

      // ✅ Reset hCaptcha (do NOT call .resetCaptcha())
      captchaKey.value++
       captchaToken.value = ''

    if (authError) throw authError;

    // 2. Insert directly into users table
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        fullname: fullname.value,
        email: email.value,
        phone: phone.value,
        state: state.value,
        wallet_balance: 0,
        created_at: new Date().toISOString()
      });

    if (dbError) throw dbError;

    toast.success("Signup successful! Please check your email for verification.")
    router.push({ name: 'user-dashboard' });

   } catch (err) {
    console.error('Full error object:', err);
    toast.error('Registration failed. Please try again.');
    
    // Specific error for RLS violations
    if (err.code === '42501') {
      error.value = 'Registration could not be completed due to security settings. Please contact support.';
    }
  }
}


//signup with facebook
const signInWithFacebook = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: 'http://localhost:5173/dashboard'
    }
  })

  if (error) {
    console.error('OAuth login error:', error.message)
  }
}

</script>

<template>
  <UserLayout>
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-white shadow-xl overflow-hidden border border-gray-100" style="border-radius: 1rem;">
          <!-- Card Header -->
          <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-center">
            <h1 class="text-2xl font-bold text-white">Create Account</h1>
            <p class="primary-color mt-1">Join our community today</p>
          </div>

          <!-- Card Body -->
          <div class="p-8">
            <!-- Error Message -->
            <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-700" style="border-radius: 0.5rem;">
              {{ error }}
            </div>

            <!-- Form Fields -->
            <div class="mb-4">
              <label for="fullname" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                v-model="fullname"
                type="text"
                placeholder="John Doe"
                class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                style="border-radius: 0.5rem;"
                required
              />
            </div>

            <div class="mb-4">
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

            <div class="mb-4">
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                v-model="phone"
                type="text"
                placeholder="+234 123 4567"
                class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                style="border-radius: 0.5rem;"
                required
              />
            </div>

            <div class="mb-4">
              <label for="state" class="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                v-model="state"
                type="text"
                placeholder="Lagos"
                class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                style="border-radius: 0.5rem;"
                required
              />
            </div>

            <div class="mb-4">
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

            <!-- Submit Button -->
            <button
              @click="signUp"
              :disabled="isLoading"
              class="w-full py-3 px-4 bg-primary-color text-white font-medium shadow-md flex items-center justify-center"
              style="border-radius: 0.5rem;"
              :class="{'opacity-75 cursor-not-allowed': isLoading}"
            >
              <span v-if="isLoading" class="inline-block mr-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading ? 'Creating account...' : 'Create Account' }}
            </button>

            <!-- Social Login Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">or sign up with</span>
              </div>
            </div>

            <!-- Facebook Login -->
            <button 
              @click="signInWithFacebook"
              type="button" 
              class="w-full flex items-center text-white bg-blue-600 justify-center px-4 py-2.5"
              style="border-radius: 0.5rem;"
            >
              <svg class="w-5 h-5 mr-2 text-[#3b5998]" fill="currentColor" viewBox="0 0 8 19">
                <path fill-rule="evenodd" d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z" clip-rule="evenodd"/>
              </svg>
              Continue with Facebook
            </button>

            <!-- Login Link -->
            <div class="mt-6 text-center text-sm text-gray-600">
              Already have an account? 
              <router-link 
                to="/user/login" 
                class="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                Sign in
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
