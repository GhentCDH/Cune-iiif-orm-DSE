import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid';
import { useViewerState } from '@ghentcdh/cune-iiif-orm-viewer'

export interface ViewerInstance {
  instanceId: string,
  manifestId: string,
  viewerStateId: string,
  syncViewport?: boolean,
}

type ViewerInstances = Map<string, ViewerInstance>
type ViewerStateCache = Map<string, ReturnType<typeof useViewerState>>

export const useInstanceState = (storeId?: string) => defineStore(storeId ?? 'project-state', () => {
  // state
  const viewerInstances: Ref<ViewerInstances> = ref(new Map())
  const viewerStateCache: ViewerStateCache = new Map()

  // getters

  // methods
  const openViewerInstance = (manifestId: string, verbose: boolean = false): string => {
    const instanceId = uuidv4()
    const viewerStateId = uuidv4()
    const viewerState = useViewerState(viewerStateId)
    viewerState.verbose = verbose

    viewerInstances.value.set(instanceId, { instanceId, manifestId, viewerStateId, syncViewport: false })
    viewerStateCache.set(instanceId, viewerState)

    return instanceId
  }

  const closeViewerInstance = (instanceId: string) => {
    // destroy stores
    const viewerInstance = viewerInstances.value.get(instanceId)
    if (viewerInstance) {
      const viewerState = viewerStateCache.get(instanceId)
      viewerState?.$dispose()
      viewerStateCache.delete(instanceId)
    }
    viewerInstances.value.delete(instanceId)
  }

  const getViewerInstance = (instanceId: string): ViewerInstance | null => {
    return viewerInstances.value.get(instanceId) || null
  }

  const getViewerInstances = () => {
    return Array.from(viewerInstances.value.values())
  }

  const getViewerState = (instanceId: string): ReturnType<typeof useViewerState> | null => {
    return viewerStateCache.get(instanceId) ?? null
  }

  const setSyncViewport = (instanceId: string, enabled: boolean) => {
    const instance = viewerInstances.value.get(instanceId)
    if (instance) {
      instance.syncViewport = enabled
    }
  }

  // exports
  return {
    viewerInstances,
    getViewerInstance,
    getViewerInstances,
    getViewerState,
    setSyncViewport,
    openViewerInstance,
    closeViewerInstance,
  }
})()
