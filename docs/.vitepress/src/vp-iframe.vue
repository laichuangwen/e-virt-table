<script lang="ts" setup>
import { computed } from 'vue';
const baseUrl = import.meta.env.BASE_URL;

interface Props {
    src: string;
}
const iframeSrc = computed(() => `${baseUrl}/${props.src}`);
const props = defineProps<Props>();
</script>

<template>
    <iframe :src="iframeSrc"></iframe>
</template>

<style scoped>
iframe {
    display: block;
}
</style>
