<script lang="ts" setup>
import { ElDatePicker, ElInputNumber, ElSelectV2, ElCascader, ElTimePicker } from 'element-plus';
import Cell from 'e-virt-table/dist/lib/Cell';
import EVirtTable, { Column, ConfigType, OverlayerContainer } from 'e-virt-table';
import { ref, onMounted, h, nextTick, computed, useAttrs, watch } from 'vue';
import { EventCallback } from 'e-virt-table/dist/lib/EventBus';
type EDITOR_TYPE = 'text' | 'select' | 'date' | 'number' | 'time' | 'cascader';
const emit = defineEmits<{
    (e: 'change', value: any[]): void; // 需要默认实现change，不能动态绑定
    (e: 'ready', value: EVirtTable): void;
}>();
const props = defineProps({
    columns: {
        type: Array as () => Column[],
        required: true,
        default: () => [],
    },
    data: {
        type: Array as () => any[],
        required: true,
        default: () => [],
    },
    footerData: {
        type: Array as () => any[],
        required: false,
        default: () => [],
    },
    config: {
        type: Object as () => ConfigType,
        default: () => ({}),
    },
    loading: {
        type: Boolean,
        default: false,
    },
});
// watch(
//     props.data,
//     (newValue) => {
//         eVirtTable?.loadData(newValue);
//     },
// );
watch(
    () => props.columns,
    (newValue) => {
        eVirtTable?.loadColumns(newValue);
    },
    { deep: true },
);
// watch(
//     props.footerData,
//     (newValue) => {
//         eVirtTable?.loadFooterData(newValue);
//     },
// );
let eVirtTable: EVirtTable | null = null;
const attrs = useAttrs();
const eVirtTableRef = ref(null);
const eVirtTableEditorRef = ref(null);
const eVirtTableEmptyRef = ref(null);
const eVirtTableOverlayerRef = ref(null);
const editorCell = ref<Cell>();
const editorType = ref<EDITOR_TYPE>('text');
const eVirtTableEditorSelectRef = ref<InstanceType<typeof ElSelectV2> | null>(null);
const selectValue = ref(null);
const eVirtTableEditorCascaderRef = ref<InstanceType<typeof ElCascader> | null>(null);
const cascaderValue = ref(null);
const eVirtTableEditorNumberRef = ref<InstanceType<typeof ElInputNumber> | null>(null);
const numberValue = ref();
const eVirtTableEditorDateRef = ref<InstanceType<typeof ElDatePicker> | null>(null);
const dateValue = ref('');
const eVirtTableEditorTimeRef = ref<InstanceType<typeof ElTimePicker> | null>(null);
const timeValue = ref('');
const overlayerView = ref<OverlayerContainer>({
    views: [],
});
// 编辑器样式
const editorStyle = computed(() => {
    const cell = editorCell.value;
    if (!cell) {
        return {};
    }
    return {
        width: `${cell.width}px`,
        height: `${cell.height}px`,
    };
});
onMounted(() => {
    if (!eVirtTableRef.value) {
        return;
    }
    eVirtTable = new EVirtTable(eVirtTableRef.value, {
        config: props.config,
        columns: props.columns,
        data: props.data,
        emptyElement: eVirtTableEmptyRef.value || undefined,
        overlayerElement: eVirtTableOverlayerRef.value || undefined,
        editorElement: eVirtTableEditorRef.value || undefined,
    });
    // 动态绑定事件
    Object.keys(attrs).forEach((key) => {
        const func = attrs[key];
        if (typeof func === 'function' && key.startsWith('on')) {
            const _eventName = key.charAt(2).toLowerCase() + key.slice(3); // 去掉 'on' 前缀 只将 'on' 后第一个字母转换为小写
            eVirtTable?.on(_eventName, func as EventCallback);
        }
    });
    eVirtTable.on('change', (value) => {
        emit('change', value);
    });
    eVirtTable.on('overlayerChange', (overlayer: OverlayerContainer) => {
        overlayerView.value = overlayer;
    });
    eVirtTable.on('startEdit', (cell) => {
        editorCell.value = cell;
        editorType.value = cell.editorType;
        // 内部已经处理了文本类型的编辑
        if (editorType.value === 'text') {
            return;
        }
        if (editorType.value === 'select') {
            nextTick(() => {
                selectValue.value = cell.value;
                eVirtTableEditorSelectRef.value?.focus();
            });
            return;
        }
        if (editorType.value === 'cascader') {
            nextTick(() => {
                cascaderValue.value = cell.value;
                eVirtTableEditorCascaderRef.value?.togglePopperVisible(true);
            });
            return;
        }
        if (editorType.value === 'date') {
            nextTick(() => {
                dateValue.value = cell.value;
                const dateRef = eVirtTableEditorDateRef.value as any;
                dateRef?.focus();
            });
            return;
        }
        if (editorType.value === 'time') {
            nextTick(() => {
                timeValue.value = cell.value;
                const timeRef = eVirtTableEditorTimeRef.value as any;
                timeRef?.focus();
            });
            return;
        }
        if (editorType.value === 'number') {
            nextTick(() => {
                numberValue.value = cell.value;
                eVirtTableEditorNumberRef.value?.focus();
            });
            return;
        }
    });
    eVirtTable.on('doneEdit', () => {
        editorType.value = 'text';
    });
    emit('ready', eVirtTable);
});
function saveCellValue(value) {
    if (!eVirtTable || !editorCell.value) {
        return;
    }
    const { rowKey, key } = editorCell.value;
    eVirtTable?.setItemValueByEditor(rowKey, key, value);
}
</script>
<template>
    <div ref="eVirtTableRef" v-loading="loading">
        <div ref="eVirtTableEditorRef">
            <!-- 自定义编辑器 -->
            <el-select-v2
                ref="eVirtTableEditorSelectRef"
                class="e-virt-table-editor-select"
                v-if="editorType === 'select'"
                v-model="selectValue"
                :automatic-dropdown="true"
                clearable
                :style="editorStyle"
                v-bind="editorCell?.editorProps"
                @change="saveCellValue"
            />
            <el-cascader
                ref="eVirtTableEditorCascaderRef"
                class="e-virt-table-editor-cascader"
                v-if="editorType === 'cascader'"
                v-model="cascaderValue"
                clearable
                :style="editorStyle"
                v-bind="editorCell?.editorProps"
                @change="saveCellValue"
            />
            <el-date-picker
                ref="eVirtTableEditorDateRef"
                class="e-virt-table-editor-date"
                v-if="editorType === 'date'"
                v-model="dateValue"
                value-format="YYYY-MM-DD"
                type="date"
                :style="editorStyle"
                v-bind="editorCell?.editorProps"
                @change="saveCellValue"
            />
            <el-time-picker
                ref="eVirtTableEditorTimeRef"
                class="e-virt-table-editor-time"
                v-if="editorType === 'time'"
                v-model="timeValue"
                :style="editorStyle"
                value-format="HH:mm:ss"
                v-bind="editorCell?.editorProps"
                @change="saveCellValue"
            />
            <el-input-number
                ref="eVirtTableEditorNumberRef"
                class="e-virt-table-editor-number"
                v-if="editorType === 'number'"
                v-model="numberValue"
                :style="editorStyle"
                :controls="false"
                v-bind="editorCell?.editorProps"
                @change="saveCellValue"
            />
        </div>
        <div ref="eVirtTableEmptyRef">
            <!-- 自定义空数据 -->
            <el-empty description="空数据" />
        </div>
        <div ref="eVirtTableOverlayerRef">
            <!-- 自定覆盖层 -->
            <div
                :class="wrapper.class"
                v-for="wrapper in overlayerView.views"
                :style="wrapper.style"
                :key="wrapper.type"
            >
                <div :style="view.style" v-for="view in wrapper.views" :key="view.key">
                    <div
                        class="cell"
                        v-for="cell in view.cells"
                        :key="`${cell.rowKey}_${cell.key}`"
                        :style="cell.style"
                    >
                        <component v-if="typeof cell.render === 'function'" :is="cell.render(cell)"></component>
                        <template v-if="typeof cell.render === 'string'">
                            <slot :name="cell.render" v-bind="cell" :cell="cell"></slot>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.e-virt-table-editor-select {
    border: none;
    .el-select__wrapper {
        box-shadow: none;
        border: none;
    }
}
.e-virt-table-editor-cascader {
    border: none;
    .el-input__wrapper {
        box-shadow: none !important;
        border: none !important;
    }
}
.e-virt-table-editor-date {
    border: none;
    .el-input__wrapper {
        box-shadow: none;
        border: none;
    }
}
.e-virt-table-editor-time {
    border: none;
    .el-input__wrapper {
        box-shadow: none;
        border: none;
    }
}
.e-virt-table-editor-number {
    border: none;
    .el-input__wrapper {
        box-shadow: none;
        border: none;
    }
    .el-input__inner {
        text-align: right;
    }
}
</style>
