import { ref, watch, type WatchStopHandle } from 'vue'
import { useInstanceState } from '@/stores/instanceState.ts'

export function useViewportSync(instanceState: ReturnType<typeof useInstanceState>) {
  const watchers = new Map<string, WatchStopHandle>()
  const syncing = ref(false)

  function watchInstance(instanceId: string) {
    if (watchers.has(instanceId)) return
    const viewerState = instanceState.getViewerState(instanceId)
    if (!viewerState) return

    const stop = watch(
      () => viewerState.viewPort,
      (newVP) => {
        if (syncing.value) return
        const instance = instanceState.getViewerInstance(instanceId)
        if (!instance?.syncViewport) return

        syncing.value = true
        instanceState.getViewerInstances()
          .filter(i =>
            i.instanceId !== instanceId &&
            i.manifestId === instance.manifestId &&
            i.syncViewport
          )
          .forEach(i => {
            const vs = instanceState.getViewerState(i.instanceId)
            if (!vs) return
            vs.setZoom(newVP.zoom)
            vs.setCenter(newVP.center.x, newVP.center.y)
            vs.setRotation(newVP.rotation)
          })
        syncing.value = false
      },
      { deep: true }
    )
    watchers.set(instanceId, stop)
  }

  function unwatchInstance(instanceId: string) {
    watchers.get(instanceId)?.()
    watchers.delete(instanceId)
  }

  return { watchInstance, unwatchInstance }
}
