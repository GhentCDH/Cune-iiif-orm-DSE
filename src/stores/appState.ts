import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppState = (storeId?: string) => defineStore(storeId ?? 'app-state', () => {
  // state
  const themeIsDark = ref(false)
  const language = ref('en')
  const verboseViewer = ref(false)
  const verboseMosaic = ref(true)

  // getters

  function reset() {
  }

  // exports
  return {
    themeIsDark,
    language,
    verboseViewer,
    verboseMosaic,
    reset,
  }
})()
