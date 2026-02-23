import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { CollectionNormalized } from '@iiif/presentation-3-normalized'
import { useVault } from '@/lib/useVault.ts'
import { useImageHelper } from '@/lib/useImageHelper.ts'


const vault = useVault()

const { createImageThumbnail } = useImageHelper(vault)

export interface TabletStoreItem {
  id: string
  label: any
  thumbnail: any | null
  metadata: { [key: string]: any }
}

export const useCollectionStore = defineStore('items', () => {
  const items = ref<TabletStoreItem[]>([])

  /* methods */
  async function loadCollection(collectionUrl: string) {
    return vault.loadCollectionObject(collectionUrl).then( (collection: CollectionNormalized | undefined) => {
      const ret: TabletStoreItem[] = []
      if (collection && collection?.items && collection.items.length > 0) {
        collection.items.forEach((item: any) => {
          const entry = {
            id: item.id,
            label: item.label,
            thumbnail: item?.thumbnail?.[0] ? createImageThumbnail(item.thumbnail[0]) : null,
            metadata: {
            }
          }
          ret.push(entry)
        })
      }
      items.value = ret
    })
  }

  function getItem(id: string) {
    return items.value.find((item: any) => item.id === id)
  }

  return {
    items,
    loadCollection,
    getItem,
  }
})
