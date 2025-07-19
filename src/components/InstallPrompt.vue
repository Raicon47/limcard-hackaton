<script setup>
import { ref, onMounted } from 'vue'

const deferredPrompt = ref(null)
const showPrompt = ref(false)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    showPrompt.value = true
  })
})

const installApp = async () => {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const result = await deferredPrompt.value.userChoice
  if (result.outcome === 'accepted') {
    console.log('User accepted the install prompt')
  } else {
    console.log('User dismissed the install prompt')
  }
  showPrompt.value = false
}

const dismissPrompt = () => {
  showPrompt.value = false
}

onMounted(() => {
  console.log("InstallPrompt component mounted")
  
  // Simulate the install prompt for testing
  // showPrompt.value = true

  window.addEventListener('beforeinstallprompt', (e) => {
    console.log("beforeinstallprompt event captured")
    e.preventDefault()
    deferredPrompt.value = e
    showPrompt.value = true
  })
})

</script>

<template>
  <div v-if="showPrompt" class="install-banner">
    <span>📲 Install <strong>Limcard</strong> on your device</span>
    <div class="actions">
      <button @click="installApp">Install</button>
      <button @click="dismissPrompt">Maybe Later</button>
    </div>
  </div>
</template>

<style scoped>
.install-banner {
  position: fixed;
  bottom: 10px;
  left: 10px;
  right: 10px;
  background: #ede4ad;
  color: white;
  padding: 5px 10px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.install-banner .actions {
  display: flex;
  gap: 10px;
}

.install-banner button {
  background: white;
  color: #1e90ff;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
</style>
