<script setup>
import { ref, onMounted} from 'vue'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar.vue'
import HomeCards from '@/components/HomeCards.vue'
import Footer from '@/components/Footer.vue'
import Newsletter from '@/components/Newsletter.vue'
import Statistics from '@/components/Home/Statistics.vue'
import Team from '@/components/Home/Team.vue'
import Featured from '../components/Home/Featured.vue'

const messages = ref([])
const newMessage = ref('')
//movies
const loading = ref(null)
const error = ref(null)

const fetchMessages = async () => {
  const { data, error } = await supabase.from('messages').select('*')
  if (data) messages.value = data
}

const submit = async () => {
  if (!newMessage.value) return
  const { error } = await supabase.from('messages').insert({ content: newMessage.value })
  if (!error) {
    newMessage.value = ''
    fetchMessages()
  }
}

onMounted(fetchMessages)

</script>

<template>
<Navbar />


<section id="banner" class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
        <h1 class="crimson mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-9xl text-white">Digitizing heartfelt moments, one card at a time with Limcard</h1>
        <p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 text-white">Celebrate special moments with your loved ones by sending personalized digital cards for birthdays, anniversaries, graduations, and more...</p>
       
    </div>
</section>


   <!-- card  -->
   <section class="my-5">
      <HomeCards />
</section>
    <!-- card  -->
     

<section>
  <Statistics />
</section>

<section>
  <Featured />
</section>


<section>
  <Newsletter />
</section>

<Team />

<Footer />

</template>

<style scoped>
#banner {
  background-image:linear-gradient(rgba(0, 0, 0, 0.5), rgba(4, 0, 0, 0.5)), url('/img/bg-1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>