<script setup lang="ts">
import { computed } from 'vue';
import { useToggle, useClipboard } from '@vueuse/core';
import SourceCode from './vp-source-code.vue';
import { CaretRight, CaretBottom } from '@element-plus/icons-vue';
import { ElTooltip, ElIcon, ElMessage } from 'element-plus';
import IconCopy from './icon-copy.vue';
import IconTop from './icon-top.vue';
const [sourceVisible, toggleSourceVisible] = useToggle();

const props = defineProps<{
    title: string;
    source: string;
    rawSource: string;
}>();
const _title = computed(() => {
    return decodeURIComponent(props.title);
});
const { copy } = useClipboard({
    source: decodeURIComponent(props.rawSource),
    read: false,
});
const copyCode = async () => {
    try {
        await copy();
        ElMessage({
            message: '复制成功！',
            type: 'success',
        });
    } catch (e: any) {}
};
</script>
<template>
    <div class="show-code">
        <div class="source-title">
            <div class="title-wrapper" @click="toggleSourceVisible()">
                <ElIcon>
                    <CaretRight v-if="!sourceVisible"></CaretRight>
                    <CaretBottom v-else></CaretBottom>
                </ElIcon>
                <div>{{ _title }}</div>
            </div>
            <ElTooltip content="复制代码" :show-arrow="false">
                <ElIcon :size="16" class="op-btn" @click="copyCode">
                    <icon-copy></icon-copy>
                </ElIcon>
            </ElTooltip>
        </div>
        <div class="example">
            <SourceCode v-show="sourceVisible" :source="source" />
            <Transition name="el-fade-in-linear">
                <div v-show="sourceVisible" class="example-float-control" @click="toggleSourceVisible(false)">
                    <ElIcon :size="16">
                        <icon-top></icon-top>
                    </ElIcon>
                    <span>隐藏源码</span>
                </div>
            </Transition>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.show-code {
    margin: 10px;
}
.source-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 8px 0px;
    .op-btn {
        margin: 0 0.5rem;
        cursor: pointer;
        color: var(--vp-c-text-2);
        transition: 0.2s;
        &:hover {
            color: var(--vp-c-brand-light);
        }
    }
}
.title-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.example {
    border-radius: 4px;
    &-float-control {
        display: flex;
        align-items: center;
        justify-content: center;
        border-top: 1px solid var(--vp-c-divider);
        height: 44px;
        box-sizing: border-box;
        background-color: var(--vp-c-bg, #fff);
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        margin-top: -1px;
        color: var(--vp-c-brand);
        cursor: pointer;
        position: sticky;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10;

        span {
            font-size: 14px;
            margin-left: 10px;
        }

        &:hover {
            color: var(--vp-c-brand-light);
        }
    }
}
</style>
