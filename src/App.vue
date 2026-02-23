<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'

// import ui helpers
import Menubar from 'primevue/menubar'

import Drawer from 'primevue/drawer'
import Button from 'primevue/button'

// import stores
import { useCollectionStore } from '@/stores/collectionStore.ts'
import { useInstanceState } from '@/stores/instanceState.ts'
import { useNamedEntityStore } from '@/stores/namedEntityStore'
import { useAppState } from '@/stores/appState.ts'

// import child components
import SearchPanel, { type CollectionPanelItem } from '@/components/SearchPanel.vue'
import { ManifestViewer, ImageViewerToggle } from '@ghentcdh/cune-iiif-orm-viewer'
import ToggleIcon from '@/components/helpers/ToggleIcon.vue'

import { MosaicContext, Mosaic, type MosaicNode, type MosaicItem } from '@ghentcdh/vue-mosaic'
import { getFirstLocalizedValue } from '@/lib/LocalizationHelper.ts'

const verbose = ref(true)
const tabletsVisible = ref(false)

// init stores
const collectionStore = useCollectionStore()
const projectState = useInstanceState()
// const namedEntityStore = useNamedEntityStore()
const appState = useAppState()

const tabletManifest = import.meta.env.VITE_TABLET_MANIFEST

const onTabletClick = (id: string) => {
  verbose.value && console.log('APP: tablet click', id)
  addTabletToMosaic(id)
  // projectState.openTabletInstance(id)
}

const menuBarItems = ref([
  {
    separator: true
  }
])

// vue mosaic
const mosaicItems = ref<MosaicItem[]>([])

let root = shallowRef<MosaicNode>({})

// load named entities
// namedEntityStore.loadNamedEntities()

// load tablets
collectionStore.loadCollection(tabletManifest).then(() => {
  projectState.openViewerInstance(collectionStore.items[0].id, appState.verboseViewer)
  projectState.openViewerInstance(collectionStore.items[0].id, appState.verboseViewer)

  const instances = projectState.getViewerInstances()

  root.value = {
    direction: 'row',
    first: {
      id: instances[0].instanceId,
      title: getFirstLocalizedValue(
        collectionStore.getItem(instances[0].manifestId).label,
        appState.language
      )
    },
    second: {
      id: instances[1].instanceId,
      title: getFirstLocalizedValue(
        collectionStore.getItem(instances[1].manifestId).label,
        appState.language
      )
    },
    splitPercentage: 60
  }
})

// collection items
const collectionItems = computed(() => {
  if (collectionStore.items.length === 0) return []
  return collectionStore.items.map((item) => ({
    id: item.id,
    label: getFirstLocalizedValue(item.label, appState.language),
    thumbnail: item.thumbnail
  })) as CollectionPanelItem[]
})

const handleMosaicSaveChange = (updatedNode: MosaicNode | null) => {
  // Handle update on save
  console.log('update mosaic', updatedNode)
}

const handleMosaicRemoveItem = (node: MosaicNode | null) => {
  // Handle item removal
  console.log('remove mosaic', node)
  if (node) {
    projectState.closeViewerInstance(node.id)
  }
  console.log(root.value)
}

/**
 * Calculate the depth (height) of the tree
 */
const getTreeDepth = (node: MosaicNode | undefined): number => {
  if (!node || !node.direction) return 0
  return (
    1 + Math.max(getTreeDepth(node.first as MosaicNode), getTreeDepth(node.second as MosaicNode))
  )
}

/**
 * Find the best location to insert a new tablet
 * Returns the parent node and whether to insert on 'first' or 'second' side
 */
interface InsertionPoint {
  parent: MosaicNode | null
  side: 'first' | 'second'
  shouldSplitVertically: boolean
  horizontalCount: number
}

// This function is currently not used but kept for reference/future optimization
const findBestInsertionPoint = (
  node: MosaicNode | undefined,
  maxHorizontal: number = 3
): InsertionPoint => {
  if (!node || !node.direction) {
    // Leaf node - this is where we insert
    return {
      parent: null,
      side: 'first',
      shouldSplitVertically: false,
      horizontalCount: 1
    }
  }

  const horizontalCount = countHorizontalItems(node)

  // If we have 3 or more horizontal items, split vertically (add below)
  if (horizontalCount >= maxHorizontal && node.direction === 'row') {
    return {
      parent: node,
      side: 'second',
      shouldSplitVertically: true,
      horizontalCount
    }
  }

  // If less than 3, try to add horizontally on the deepest side
  const firstDepth = getTreeDepth(node.first as MosaicNode)
  const secondDepth = getTreeDepth(node.second as MosaicNode)

  // Recurse into the deeper subtree
  if (firstDepth >= secondDepth) {
    return findBestInsertionPoint(node.first as MosaicNode, maxHorizontal)
  } else {
    return findBestInsertionPoint(node.second as MosaicNode, maxHorizontal)
  }
}

/**
 * Count horizontal items in a row
 */
const countHorizontalItems = (node: MosaicNode | undefined): number => {
  if (!node || !node.direction) return 1 // leaf node
  if (node.direction === 'column') return countHorizontalItems(node.first) // column doesn't add to count, check first child
  // row direction - sum both sides
  return (
    countHorizontalItems(node.first as MosaicNode) + countHorizontalItems(node.second as MosaicNode)
  )
}

/**
 * Find the row with the least horizontal items (most space)
 * Returns the node at the top of that row
 */
const findRowWithMostSpace = (node: MosaicNode | undefined): MosaicNode | undefined => {
  if (!node || !node.direction) {
    return node // leaf node, return it
  }

  if (node.direction === 'row') {
    // This is a horizontal row. Check if it has space
    const horizontalCount = countHorizontalItems(node)
    if (horizontalCount < 3) {
      // This row has space, return it
      return node
    }
    // Row is full, look below (in column children)
    if (node.second) {
      const belowSpace = findRowWithMostSpace(node.second as MosaicNode)
      if (belowSpace) return belowSpace
    }
  }

  if (node.direction === 'column') {
    // Column: recurse into second child (below)
    if (node.second) {
      return findRowWithMostSpace(node.second as MosaicNode)
    }
  }

  return undefined
}

/**
 * Count the number of columns at the top level of the mosaic
 * A leaf = 1 column
 * A row = first columns + second columns
 * A column = first columns (ignore second)
 */
const countTopLevelColumns = (node: MosaicNode | undefined): number => {
  if (!node || !node.direction) return 1 // leaf node = 1 column
  if (node.direction === 'column') return countTopLevelColumns(node.first) // column doesn't add columns, check first
  // row direction - sum columns from both sides
  return (
    countTopLevelColumns(node.first as MosaicNode) + countTopLevelColumns(node.second as MosaicNode)
  )
}

/**
 * Extend a row to the right by one more column
 * This adds a new tablet to the rightmost position in the row
 */
const extendRowRight = (node: MosaicNode, newTablet: MosaicNode): MosaicNode => {
  appState.verboseMosaic && console.log(`extendRowRight called`)

  // If this node is a leaf, create a new row with it and the new tablet
  if (!node.direction) {
    return {
      direction: 'row',
      first: node,
      second: newTablet,
      splitPercentage: 50
    }
  }

  // If this is a row, we want to extend the right side
  if (node.direction === 'row') {
    return {
      ...node,
      second: extendRowRight(node.second as MosaicNode, newTablet)
    }
  }

  // If this is a column, go to the first child (stay in the top-level row)
  if (node.direction === 'column') {
    return {
      ...node,
      first: extendRowRight(node.first as MosaicNode, newTablet)
    }
  }

  return node
}

/**
 * Find the largest leaf in the tree and replace it with a column split
 */
const findAndSplitLargestLeaf = (node: MosaicNode, newTablet: MosaicNode): MosaicNode => {
  appState.verboseMosaic && console.log(`findAndSplitLargestLeaf called`)

  if (!node.direction) {
    // This is a leaf, split it vertically
    return {
      direction: 'column',
      first: node,
      second: newTablet,
      splitPercentage: 50
    }
  }

  // For both row and column, find which child is larger
  // We estimate size by counting leaves
  const countLeaves = (n: MosaicNode | undefined): number => {
    if (!n || !n.direction) return 1
    return countLeaves(n.first as MosaicNode) + countLeaves(n.second as MosaicNode)
  }

  const firstLeaves = countLeaves(node.first as MosaicNode)
  const secondLeaves = countLeaves(node.second as MosaicNode)

  appState.verboseMosaic &&
    console.log(`  firstLeaves=${firstLeaves}, secondLeaves=${secondLeaves}`)

  if (firstLeaves >= secondLeaves) {
    // Split the first child
    return {
      ...node,
      first: findAndSplitLargestLeaf(node.first as MosaicNode, newTablet)
    }
  } else {
    // Split the second child
    return {
      ...node,
      second: findAndSplitLargestLeaf(node.second as MosaicNode, newTablet)
    }
  }
}

const addTabletToMosaic = (manifestId: string) => {
  const instanceId = projectState.openViewerInstance(manifestId, appState.verboseViewer)

  appState.verboseMosaic && console.log('Adding tablet:', manifestId)
  appState.verboseMosaic && console.log('Root before:', root.value)

  if (!instanceId) return

  const rootValue = root.value
  if (!rootValue || !rootValue.direction) {
    // Root is empty or a single leaf node
    const currentItem = rootValue

    // Create a new tablet node
    const newTablet: MosaicNode = {
      id: instanceId,
      title: getFirstLocalizedValue(collectionStore.getItem(manifestId).label, appState.language)
    }

    if (!currentItem || !currentItem.id) {
      // Root is empty, just set it
      root.value = newTablet
    } else {
      // Root is a single tablet, split it horizontally
      root.value = {
        direction: 'row',
        first: currentItem,
        second: newTablet,
        splitPercentage: 50
      }
    }

    appState.verboseMosaic && console.log('Initialized root:', root.value)
    return
  }

  const newTablet: MosaicNode = {
    id: instanceId,
    title: getFirstLocalizedValue(collectionStore.getItem(manifestId).label, appState.language)
  }

  // Check how many columns are at the top level
  const topLevelColumns = countTopLevelColumns(rootValue)
  appState.verboseMosaic && console.log('Top level columns:', topLevelColumns)

  let result: MosaicNode
  if (topLevelColumns >= 3) {
    // Already 3+ columns at top level, wrap current structure in column and add new row below
    appState.verboseMosaic &&
      console.log('>=3 columns, wrapping in column and adding new row below')
    result = {
      direction: 'column',
      first: rootValue,
      second: newTablet,
      splitPercentage: 50
    }
  } else {
    // Less than 3 columns, extend the row to the right
    appState.verboseMosaic && console.log('<3 columns, extending row to the right')
    result = extendRowRight(rootValue, newTablet)
  }

  root.value = result
  appState.verboseMosaic && console.log('Root after:', root.value)

  // Log structure for debugging
  if (appState.verboseMosaic) {
    const logStructure = (node: MosaicNode | undefined, indent = '') => {
      if (!node) return
      if (!node.direction) {
        console.log(`${indent}└─ Leaf: ${node.id?.substring(0, 8)}...`)
      } else {
        console.log(`${indent}├─ ${node.direction.toUpperCase()}`)
        console.log(`${indent}│  first:`)
        logStructure(node.first as MosaicNode, `${indent}│    `)
        console.log(`${indent}│  second:`)
        logStructure(node.second as MosaicNode, `${indent}│    `)
      }
    }
    console.log('Tree structure after add:')
    logStructure(result)
  }
}

// init mosaic
</script>

<template>
  <section class="w-full h-full flex flex-col">
    <Drawer v-model:visible="tabletsVisible" header="Tablets" class="w-full md:!w-80 lg:!w-[20rem]">
      <SearchPanel :items="collectionItems" @click="onTabletClick" />
    </Drawer>
    <Menubar :model="menuBarItems" class="">
      <template #start>
        <h3>Cune-iiif-orm IIIF Collection Viewer</h3>
      </template>
      <template #item="{ item, props }">
        <a class="flex items-center" v-bind="props.action">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
      <template #end>
        <Button
          icon="pi pi-search"
          severity="success"
          rounded
          aria-label="Search"
          @click="tabletsVisible = !tabletsVisible"
        />
        <ToggleIcon
          icon="pi pi-day-sunny"
          aria-label="Toggle verbose"
          :value="verbose"
          @input="verbose = !verbose"
        />
      </template>
    </Menubar>

    <MosaicContext>
      <Mosaic
        v-model:root="root"
        inactive-target="#mosaic-inactive-items"
        @removedItem="handleMosaicRemoveItem"
      >
        <template #item="props">
          <ManifestViewer
            v-if="projectState.getViewerInstance(props.node.id)"
            :manifest-id="projectState.getViewerInstance(props.node.id)?.manifestId as string"
            :key="props.node.id"
            :viewer-state-id="projectState.getViewerInstance(props.node.id)?.viewerStateId"
            class="flex-1 overflow-hidden"
            :verbose="appState.verboseViewer"
          >
          </ManifestViewer>
        </template>
      </Mosaic>
    </MosaicContext>
  </section>
</template>

<style scoped>
h3 {
  font-weight: bold;
}
</style>

<style>
.mosaic-window-body {
  overflow: hidden;
  position: relative;

  & > div,
  & > div > div {
    height: 100%;
    overflow: hidden;
  }
}
</style>
