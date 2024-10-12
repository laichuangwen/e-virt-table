<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
});

const decoded = computed(() => {
  return decodeURIComponent(props.source);
});
</script>

<template>
  <div class="example-source-wrapper">
    <div class="example-source" v-html="decoded" />
  </div>
</template>

<style scoped lang="scss">

.example-source{
    overflow-x: scroll;
    position: relative;
    background-color: var(--vp-code-block-bg) !important;
    padding: 1em;
}
</style>