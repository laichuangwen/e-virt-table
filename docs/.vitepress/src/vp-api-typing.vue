<script setup lang="ts">
import { Warning } from '@element-plus/icons-vue';

defineProps({
    type: String,
    details: String,
});
</script>

<template>
    <span class="inline-flex items-center">
        <code class="api-typing mr-1">
            {{ type }}
        </code>
        <ClientOnly>
            <ElTooltip v-if="details" effect="light" trigger="click">
                <ElButton text circle :icon="Warning" :aria-label="details" class="p-2 text-4" />
                <template #content>
                    <slot>
                        <div class="m-1" style="max-width: 600px">
                            <code
                                style="color: var(--code-tooltip-color); background-color: var(--code-tooltip-bg-color)"
                            >
                                {{ details }}
                            </code>
                        </div>
                    </slot>
                </template>
            </ElTooltip>
        </ClientOnly>
    </span>
</template>
