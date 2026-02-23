import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid';
import { useViewerState } from '@ghentcdh/cune-iiif-orm-viewer'

export interface ViewerInstance {
  instanceId: string,
  manifestId: string,
  viewerStateId: string
}

type ViewerInstances = Map<string, ViewerInstance>

export const useInstanceState = (storeId?: string) => defineStore(storeId ?? 'project-state', () => {
  // state
  const viewerInstances: Ref<ViewerInstances> = ref(new Map())

  // getters

  // methods
  const openViewerInstance = (manifestId: string, verbose: boolean = false): string => {
    const instanceId = uuidv4()
    const viewerStateId = uuidv4()
    const viewerState = useViewerState(viewerStateId) // eslint-disable-line @typescript-eslint/no-unused-vars
    viewerState.verbose = verbose

    viewerInstances.value.set(instanceId, { instanceId, manifestId, viewerStateId })

    return instanceId
  }

  const closeViewerInstance = (instanceId: string) => {
    // destroy stores
    const viewerInstance = viewerInstances.value.get(instanceId)
    if (viewerInstance) {
      const viewerState = useViewerState(viewerInstance.viewerStateId)
      viewerState.$dispose()
      // delete pinia.state.value[viewerState.$id] // remove from pinia state
    }
    viewerInstances.value.delete(instanceId)
  }

  const getViewerInstance = (instanceId: string): ViewerInstance | null => {
    return viewerInstances.value.get(instanceId) || null
  }

  const getViewerInstances = () => {
    return Array.from(viewerInstances.value.values())
  }

  // exports
  return {
    viewerInstances,
    getViewerInstance,
    getViewerInstances,
    openViewerInstance,
    closeViewerInstance,
  }
})()
