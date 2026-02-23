<template>
    <ToggleButton pt:label="hidden" pt:icon="relative mr-0" class="toggle-icon"></ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from 'primevue/togglebutton';
</script>

<style lang="scss">
.toggle-icon {
  @apply border-none p-0;
}
</style>