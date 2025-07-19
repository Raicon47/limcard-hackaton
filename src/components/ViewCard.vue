<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'

let jsPDF, html2canvas

const route = useRoute()
const slug = route.params.slug

const cardMessage = ref(null)
const loading = ref(true)
const error = ref(null)
const flipped = ref(false)

const loadLibraries = async () => {
  const jspdfModule = await import('jspdf')
  const html2canvasModule = await import('html2canvas')
  jsPDF = jspdfModule.jsPDF
  html2canvas = html2canvasModule.default
}

const fetchCard = async () => {
  const { data, error: err } = await supabase
    .from('card_messages')
    .select('*, cards(*)')
    .eq('slug', slug)
    .single()

  if (err) {
    error.value = 'Card not found'
  } else {
    cardMessage.value = data
    await nextTick()
    // triggerConfetti() // 💥
  }

  loading.value = false
}

const flipCard = () => {
  flipped.value = !flipped.value
}

const downloadPDF = async () => {
  const pdf = new jsPDF()
  const cardEl = document.querySelector('.card')

  // Temporarily flip to back before download
  flipped.value = true
  await new Promise(r => setTimeout(r, 800))

  const canvas = await html2canvas(cardEl)
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 180, 120)
  pdf.save('card.pdf')

  flipped.value = false
}

//confetti
const cheerAudio = new Audio('/sounds/cheer.mp3')

const flipAndCelebrate = () => {
  flipped.value = true // Flip the card

  // Trigger confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  })

  // Play cheer sound
  cheerAudio.currentTime = 0
  cheerAudio.play().catch(err => {
    console.warn('Auto-play failed:', err)
  })
}

onMounted(async () => {
  await loadLibraries()
  await fetchCard()
  await flipAndCelebrate()
})

</script>

<template>
  <div v-if="loading" class="text-center my-5">
    <div class="spinner-border text-light" role="status"></div>
  </div>

  <div v-else-if="error" class="alert alert-danger my-5 text-center">
    {{ error }}
  </div>

  <div v-else class="card-page">
    <!-- <button class="download-btn" @click="downloadPDF">📄 Download PDF</button> -->
   <router-link class="download-btn text-decoration-none" to="/">Reply {{ cardMessage.sender_name }}</router-link>


    <div class="card-container">
      <div class="card" :class="{ flipped }">
        <div class="card-face card-front" :style="{ backgroundImage: `url(/img/cards/${cardMessage.cards.image_name})` }"></div>
        <div class="card-face card-back">
          <div class="note-content">
            {{ cardMessage.message }}
          </div>
          <div class="sender-info mb-5">
            From: {{ cardMessage.sender_name }}
          </div>
          <h1>🎉</h1>
        </div>
      </div>
    </div>

    <button v-if="!flipped" @click="flipAndCelebrate" class="read-note-btn">Read Note 💌</button>
    <button v-else class="back-btn visible" @click="flipCard">Back to Card 🎂</button>
  </div>
</template>

<style scoped>
/* Example fallback styles */
.card-page {
 position: relative;
  min-height: 100vh;
  padding: 100px 20px 150px; /* top padding for button, bottom for flip buttons */
  background: linear-gradient(135deg, #e6570a, #b100e8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  overflow-x: hidden;
  color: #fff;
}

.download-btn,
.read-note-btn,
.back-btn {
  z-index: 20;
  position: absolute;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-weight: bold;
  cursor: pointer;
  background: linear-gradient(to right, #e6570a, #b100e8);
  color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.download-btn {
  top: 20px;
  right: 20px;
}

.read-note-btn {
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
}

.back-btn {
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  pointer-events: none;
}

.back-btn.visible {
  opacity: 1;
  pointer-events: auto;
}

.card-container {
  perspective: 1000px;
  width: 90%;
  max-width: 600px;
  height: 400px;
  margin: auto;
}

.card {
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s;
  position: relative;
  cursor: pointer;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  backface-visibility: hidden;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  background-color: #ede4ad;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.card-front {
  background-size: cover;
  background-position: center;
}

.card-back {
  transform: rotateY(180deg);
  flex-direction: column;
  padding: 20px;
  color: #b100e8;
}

.note-content {
  font-size: 18px;
  margin-bottom: 20px;
}

.sender-info {
  color: #e6570a;
  font-weight: bold;
}

</style>
