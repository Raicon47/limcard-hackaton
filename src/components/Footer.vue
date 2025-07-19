<script setup>
import { ref } from 'vue'

const newsletterEmail = ref('')
const subscribed = ref(false)

const subscribe = () => {
  if (!newsletterEmail.value) return

  subscribed.value = true
  setTimeout(() => {
    subscribed.value = false
    newsletterEmail.value = ''
  }, 4000)
}
</script>

<template>
  <footer class="bg-indigo-900 text-white px-6 py-12 font-[Poppins]">
    <div class="max-w-5xl mx-auto text-center space-y-6 animate-fadeIn">
      <!-- Logo and Tagline -->
      <div>
        <h2 class="text-4xl font-extrabold tracking-wide uppercase ">
          MYLIMCARD
        </h2>
        <p class="text-lg secondary-color mt-2 italic">Digitizing heartfelt moments, one card at a time.</p>
      </div>

      <!-- Newsletter -->
      <div class="flex flex-col sm:flex-row justify-center items-center gap-2">
        <input
          v-model="newsletterEmail"
          type="email"
          placeholder="enter email to vibe"
          class="w-full sm:w-72 px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-md"
        />
        <button
          @click="subscribe"
          class="bg-pink-600 px-6 py-2 rounded-lg font-semibold transition-all shadow-lg"
        >
          💌 I'm in
        </button>
      </div>

      <!-- Confirmation -->
      <div v-if="subscribed" class="text-green-400 font-medium transition-all duration-300">
        🚀 You’re on the list — we see you!
      </div>

      <!-- Social Links (fake for now) -->
      <div class="flex justify-center gap-5 text-xl mt-4">
        <a href="#" class="hover:text-pink-400 transition"><i class="fab fa-instagram"></i></a>
        <a href="#" class="hover:text-yellow-400 transition"><i class="fab fa-twitter"></i></a>
        <a href="#" class="hover:text-blue-400 transition"><i class="fab fa-facebook"></i></a>
        <a href="#" class="hover:text-green-400 transition"><i class="fab fa-whatsapp"></i></a>
      </div>

      <!-- Footer Bottom -->
      <div class="border-t border-gray-700 pt-6 text-sm text-gray-400">
        <p>&copy; {{ new Date().getFullYear() }} <strong>MYLIMCARD</strong> ✨ All vibes reserved.</p>
        <p class="mt-1">Made with ❤️ in Nigeria</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');

.animate-fadeIn {
  animation: fadeInUp 0.8s ease-in-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
