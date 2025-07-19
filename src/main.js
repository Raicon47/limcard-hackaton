import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { registerSW } from 'virtual:pwa-register'

import "./style.css"


//whatsapp icon
  // var url = 'https://wati-integration-prod-service.clare.ai/v2/watiWidget.js?11626';
  //               var s = document.createElement('script');
  //               s.type = 'text/javascript';
  //               s.async = true;
  //               s.src = url;
  //               var options = {
  //               "enabled":true,
  //               "chatButtonSetting":{
  //                   "backgroundColor":"#b100e8",
  //                   "ctaText":"Chat with us",
  //                   "borderRadius":"25",
  //                   "marginLeft": "0",
  //                   "marginRight": "20",
  //                   "marginBottom": "20",
  //                   "ctaIconWATI":false,
  //                   "position":"left"
  //               },
  //               "brandSetting":{
  //                   "brandName":"Limcard",
  //                   "brandSubTitle":"undefined",
  //                   "brandImg":"https://limcard.vercel.app/img/logos/logo.png",
  //                   "welcomeText":"Hi there!\nHow can I help you?",
  //                   "messageText":"Hello, %0A I have a question about https://limcard.vercel.app/",
  //                   "backgroundColor":"#b100e8",
  //                   "ctaText":"Chat with us",
  //                   "borderRadius":"25",
  //                   "autoShow":false,
  //                   "phoneNumber":"2349162337902"
  //               }
  //               };
  //               s.onload = function() {
  //                   CreateWhatsappChatWidget(options);
  //               };
  //               var x = document.getElementsByTagName('script')[0];
  //               x.parentNode.insertBefore(s, x);
//whatsapp icon

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline')
  }
})

const app = createApp(App)

app.use(createPinia()) 
app.use(router)  
app.use(Toast, {
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true
})  

app.mount('#app')      
