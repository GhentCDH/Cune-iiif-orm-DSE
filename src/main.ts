import './assets/style.scss'

import 'cune-iiif-orm-viewer/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import Aura from "@primevue/themes/aura";

import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'

import 'primeicons/primeicons.css'

import InlineSvg from 'vue-inline-svg';

const app = createApp(App)

app.use(createPinia())
app.component('InlineSvg', InlineSvg)

app.use(PrimeVue, {
  // unstyled: true,
  // theme: 'none',
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark',
      cssLayer: {
        name: 'primevue', //any name you want. will be referenced on app.css
        order: 'tailwind-base, primeui, tailwind-utilities'
      }
    }
  }
})

app.mount('#app')
