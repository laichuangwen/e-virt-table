<script setup lang="ts">
import { ref, computed } from 'vue';
import { useClipboard, useToggle } from '@vueuse/core';
import { ElMessage } from 'element-plus';
import IconCopy from './icon-copy.vue';
import IconCode from './icon-code.vue';
import IconFullscreen from './icon-fullscreen.vue';
import IconTop from './icon-top.vue';
import IconStart from './icon-start.vue';
import { ElTooltip, ElIcon, ElCollapseTransition } from 'element-plus';
import SourceCode from './vp-source-code.vue';
const [sourceVisible, toggleSourceVisible] = useToggle();

const props = defineProps<{
    width: string;
    height: string;
    source: string;
    path: string;
    rawSource: string;
    description: string;
}>();
const decodedRawSource = computed(() => {
    return decodeURIComponent(props.rawSource);
});
const { copy } = useClipboard({
    source: decodeURIComponent(props.rawSource),
    read: false,
});
const decodedDescription = computed(() => {
    return decodeURIComponent(props.description);
});
const development = computed(() => {
    return process.env.NODE_ENV === 'development';
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
const showcase = ref<HTMLElement | null>(null);
const enterFullscreen = () => {
    const element = showcase.value;
    if (!element) {
        return;
    }
    // 进入全屏模式的兼容处理
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
        // Firefox
        (element as any).mozRequestFullScreen();
    } else if ((element as any).webkitRequestFullscreen) {
        // Chrome, Safari, Opera
        (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
        // IE/Edge
        (element as any).msRequestFullscreen();
    }
};
const goCodepen = () => {
    const form = document.createElement('form');
    form.action = 'https://codepen.io/pen/define';
    form.method = 'POST';
    form.target = '_blank';
    form.style.display = 'none';
    const input = document.createElement('input');
    input.name = 'data';
    input.value = JSON.stringify({
        title: 'EVirtTable',
        html: decodeURIComponent(props.rawSource),
    });
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};
</script>

<template>
    <ClientOnly>
        <div text="sm" m="y-4" v-html="decodedDescription" />
        <div class="example">
            <div class="example-showcase" ref="showcase">
                <template v-if="development">
                    <iframe
                        :src="props.path"
                        :style="{
                            width: props.width,
                            height: props.height,
                        }"
                    />
                </template>
                <iframe
                    v-else
                    :srcdoc="decodedRawSource"
                    :style="{
                        width: props.width,
                        height: props.height,
                    }"
                />
            </div>
            <div class="op-btns">
                <ElTooltip content="全屏" :show-arrow="false">
                    <ElIcon :size="16" class="op-btn" @click="enterFullscreen">
                        <icon-fullscreen></icon-fullscreen>
                    </ElIcon>
                </ElTooltip>
                <ElTooltip content="复制代码" :show-arrow="false">
                    <ElIcon :size="16" class="op-btn" @click="copyCode">
                        <icon-copy></icon-copy>
                    </ElIcon>
                </ElTooltip>
                <ElTooltip content="查看源代码" :show-arrow="false">
                    <ElIcon :size="16" class="op-btn" @click="toggleSourceVisible()">
                        <icon-code></icon-code>
                    </ElIcon>
                </ElTooltip>
                <ElTooltip content="在线运行" :show-arrow="false">
                    <ElIcon :size="16" class="op-btn" @click="goCodepen()">
                        <icon-start></icon-start>
                    </ElIcon>
                </ElTooltip>
            </div>

            <ElCollapseTransition>
                <SourceCode v-show="sourceVisible" :source="source" />
            </ElCollapseTransition>

            <Transition name="el-fade-in-linear">
                <div v-show="sourceVisible" class="example-float-control" @click="toggleSourceVisible(false)">
                    <ElIcon :size="16">
                        <icon-top></icon-top>
                    </ElIcon>
                    <span>隐藏源码</span>
                </div>
            </Transition>
        </div>
    </ClientOnly>
</template>
<style>
iframe {
    border: none;
    width: 100%;
    height: 100%;
}
</style>
<style scoped lang="scss">
.m-0 {
    margin: 0;
}

.example-showcase {
    padding: 1.5rem;
    margin: 0.5px;
    background-color: #fff;
}
.example-showcase:fullscreen {
    padding: 0px;
    margin: 0px;
    background-color: #fff;
}

.example {
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;

    .op-btns {
        border-top: 1px solid var(--vp-c-divider);
        padding: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 2.5rem;

        .el-icon {
            &:hover {
                color: var(--vp-c-brand);
            }
        }

        .op-btn {
            margin: 0 0.5rem;
            cursor: pointer;
            color: var(--vp-c-text-2);
            transition: 0.2s;
        }
    }

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
