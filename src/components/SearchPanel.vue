<template>
  <div class="collection-panel">
    <div
      v-for="collectionItem in sortedCollectionItems"
      :key="'collection-item-' + collectionItem.id"
      class="layer flex py-2 border px-2 cursor-pointer collection-item"
      @click="onClick(collectionItem.id)"
    >
      <div>
        <img :src="collectionItem.thumbnail" class="w-10" :alt="collectionItem.label" />
      </div>
      <div class="px-2 py-1 flex-1">
        <div class="pb-2">
          <h3 class="font-medium mb-2">{{ collectionItem.label }}</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, toValue } from 'vue'

export interface CollectionPanelItem {
  id: string
  label: string
  thumbnail: string
}

export type CollectionPanelItems = Array<CollectionPanelItem>

const props = withDefaults(
  defineProps<{
    items: CollectionPanelItems
  }>(),
  {
    items: () => []
  }
)

const { items } = toRefs(props)

const emit = defineEmits(['click'])

const sortedCollectionItems = computed(() => {
  const newItems = toValue(items.value)
  if (!newItems.length) return []
  return newItems.sort((a: CollectionPanelItem, b: CollectionPanelItem) => {
    const labelA = a.label.toLowerCase()
    const labelB = b.label.toLowerCase()
    return labelA.localeCompare(labelB)
  })
})

const onClick = (id: string) => {
  emit('click', id)
}
</script>

<style scoped>
.collection-item {
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.collection-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
}
</style>