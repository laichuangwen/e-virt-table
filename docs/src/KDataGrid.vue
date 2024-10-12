<template>
    <div class="jn-data-grid">
        <div ref="canvasRef" class="jn-data-grid-table"></div>
        <div ref="editor" class="jn-data-grid-editor">
            <el-date-picker v-if="editorType === 'month'" :style="popupSty" ref="month" v-model="value"
                class="jn-data-grid-editor-popup" :editable="false" type="month" placeholder="月份" format="YYYY-MM"
                value-format="YYYY-MM" @change="doneEdit" />
            <el-date-picker v-else-if="editorType === 'date'" :style="popupSty" ref="date" v-model="value"
                class="jn-data-grid-editor-popup" :editable="false" type="date" placeholder="日期" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" @change="doneEdit" />
            <el-date-picker v-else-if="editorType === 'datetime'" :style="popupSty" ref="datetime" v-model="value"
                class="jn-data-grid-editor-popup" :editable="false" type="datetime" placeholder="时间"
                format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" @change="doneEdit" />
            <div ref="contenteditable" v-else-if="editorType === 'contenteditable'"
                contenteditable="true" @keydown.tab.prevent @keydown.esc="doneEdit" />
            <div ref="text" v-else @keydown.enter="doneEdit" contenteditable="true" @keydown.tab.prevent
                @keydown.esc="doneEdit" />
        </div>
        <div class="jn-data-grid-overlayer" v-if="overlayerView" :style="overlayerView.style">
            <div :class="wrapper.class" v-for="wrapper in overlayerView.views" :style="wrapper.style"
                :key="wrapper.type">
                <div :style="view.style" v-for="view in wrapper.views" :key="view.key">
                    <div class="cell" v-for="(cell) in view.cells" :key="`${cell.rowKey}_${cell.key}`"
                        :style="cell.style">
                        <component v-if="typeof cell.render === 'function'" :is="cell.render(cell)"></component>
                        <template v-if="typeof cell.render === 'string'">
                            <slot :name="cell.render" v-bind="cell" :cell="cell"></slot>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="empty === 'empty'" class="jn-data-grid-empty" :style="`top: ${emptyTop}px`">
            <p>暂无数据</p>
        </div>

        <el-tooltip :visible="overlayerTooltip.show" :content="overlayerTooltip.text" placement="top">
            <div :style="overlayerTooltip.style"></div>
        </el-tooltip>
        <el-popover v-if="overlayerContextmenu.show" :hide-after="0" :popper-style="{ padding: '0px' }"
            :teleported="false" :show-arrow="false" :offset="0" :visible="overlayerContextmenu.show"
            placement="bottom-start">
            <template #reference>
                <div :style="overlayerContextmenu.style"></div>
            </template>
            <el-menu style="border-right: none;">
                <el-menu-item :index="item.value" v-for="item in overlayerContextmenu.list" :key="item.value"
                    @click="item.event">
                    <span>{{ item.label }}</span>
                </el-menu-item>
            </el-menu>
        </el-popover>
    </div>
</template>

<script lang="ts">
import { DataGrid } from '@jn-data-grid/core';
import type { EventCallback, OverlayerContainer, OverlayerTooltip, OverlayerContextmenu, FilterMethod } from '@jn-data-grid/core';
export default {
    props: {
        columns: {
            type: Array,
            default() {
                return [];
            },
        },
        config: {
            type: Object,
            default() {
                return {};
            },
        },
        data: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    data() {
        return {
            grid: null as DataGrid | null,
            overlayerView: null as OverlayerContainer | null,
            empty: '',
            emptyTop: 0,
            editorType: 'text',
            popWidth: 0,
            popHeight: 0,
            value: null,
            overlayerTooltip: {
                show: false,
                text: '',
                style: {
                    display: 'none',
                },
            } as OverlayerTooltip,
            overlayerContextmenu: {
                show: false,
                list: [],
                style: {
                    display: 'none',
                },
            } as OverlayerContextmenu,
        };
    },
    computed: {
        slots() {
            return Object.keys(this.$slots);
        },
        CSS_PREFIX() {
            return this.grid?.config?.CSS_PREFIX;
        },
        EMPTY_BOTTOM() {
            const { EMPTY_BODY_HEIGHT = 0, SCROLLER_TRACK_SIZE = 0 } = this.grid?.config || {};
            return (EMPTY_BODY_HEIGHT + SCROLLER_TRACK_SIZE) / 2;
        },
        popupSty(): { width: string, height: string } {
            return {
                width: `${this.popWidth}px`,
                height: `${this.popHeight}px`,
            };
        },
    },
    mounted() {
        this.init();
    },
    beforeDestroy() {
        this.grid?.destroy();
    },
    methods: {
        destroy() {
            this.grid?.destroy();
        },
        init() {
            this.$nextTick(() => {
                const target = this.$refs.canvasRef as HTMLDivElement;
                this.grid = new DataGrid(target, {
                    data: this.data,
                    columns: this.columns,
                });
                // 动态绑定事件
                Object.keys(this.$attrs).forEach((key) => {
                    const value = this.$attrs[key];
                    if (typeof value === 'function') {
                        const eventName = value.name; // 获取事件名称
                        this.grid?.on(eventName, value as EventCallback);
                    }
                });
                this.grid.on('emptyChange', ({ isEmpty, headerHeight, height }) => {
                    this.empty = isEmpty;
                    this.emptyTop = headerHeight + height / 2;
                });
                this.grid.on('startEdit', (cell) => {
                    this.editorType = cell.type;
                    const {
                        clientX = 0,
                        clientY = 0,
                        width = 0,
                        height = 0,
                        padding = 0,
                    } = cell?.getClient() || {};
                    this.$nextTick(() => {
                        const value = cell.getValue();
                        const editor = this.$refs.editor as HTMLDivElement;
                        editor.style.left = `${clientX}px`;
                        editor.style.top = `${clientY}px`;
                        if (['month', 'date', 'datetime'].includes(this.editorType)) {
                            const el = this.$refs[this.editorType] as HTMLDivElement
                            el?.focus();
                            this.popWidth = width;
                            this.popHeight = height;
                            this.value = value;
                        } else if (['contenteditable'].includes(this.editorType)) { 
                            const text = this.$refs.contenteditable as HTMLDivElement;
                            text.style.minWidth = `${width}px`;
                            text.style.minHeight = `${height}px`;
                            text.style.padding = `${padding}px`;
                            if (value !== null) {
                                text.innerHTML = value;
                                console.log('text.innerText', value);
                                
                            }
                            text.focus();
                            const selection = window.getSelection(); // 创建selection
                            selection?.selectAllChildren(text); // 清除选区并选择指定节点的所有子节点
                            selection?.collapseToEnd(); // 光标移至最后
                        }else {
                            const text = this.$refs.text as HTMLDivElement;
                            text.style.minWidth = `${width}px`;
                            text.style.minHeight = `${height}px`;
                            text.style.padding = `${padding}px`;
                            if (value !== null) {
                                text.innerText = value;
                            }
                            text.focus();
                            const selection = window.getSelection(); // 创建selection
                            selection?.selectAllChildren(text); // 清除选区并选择指定节点的所有子节点
                            selection?.collapseToEnd(); // 光标移至最后
                        }
                    })

                })
                this.grid.on('doneEdit', (cell) => {
                    this.$nextTick(() => {
                        const { rowKey, key } = cell;
                        const value = cell.getValue();
                        if (['month', 'date', 'datetime'].includes(this.editorType)) {
                            this.grid?.database.setItemValue(rowKey, key, this.value, true, true, true);
                        } else if (['contenteditable'].includes(this.editorType)) {
                            const text = this.$refs.contenteditable as HTMLDivElement;
                            // !(text.textContent === '' && value === null)剔除点击编辑后未修改会把null变为''的情况
                            if (text.innerHTML !== value && !(text.innerHTML === '' && value === null)) {
                                this.grid?.database.setItemValue(rowKey, key, text.innerHTML, true, true, true);
                            }
                            text.innerHTML = '';
                        } else {
                            const text = this.$refs.text as HTMLDivElement;
                            // !(text.textContent === '' && value === null)剔除点击编辑后未修改会把null变为''的情况
                            if (text.textContent !== value && !(text.textContent === '' && value === null)) {
                                this.grid?.database.setItemValue(rowKey, key, text.textContent, true, true, true);
                            }
                            text.textContent = null;
                        }
                        const editor = this.$refs.editor as HTMLDivElement;
                        if (editor) {
                            editor.style.left = `${-10000}px`;
                            editor.style.top = `${-10000}px`;
                        }
                    })
                })
                this.grid.on('overlayerChange', (overlayer: OverlayerContainer) => {
                    this.overlayerView = overlayer
                });
                this.grid.on('overlayerTooltipChange', ({
                    text,
                    cell,
                    show
                }) => {
                    if (show) {
                        const x = cell.getClientX();
                        const y = cell.getClientY();
                        const width = cell.width;
                        this.overlayerTooltip = {
                            show: true,
                            text,
                            style: {
                                position: 'absolute',
                                width: `${width}px`,
                                height: `${1}px`, // 只用于占位，不显示赋值高度会导致tooltip闪烁
                                left: `${x}px`,
                                top: `${y}px`,
                            },
                        };
                    } else {
                        this.overlayerTooltip = {
                            show: false,
                            text,
                            style: {
                                display: 'none',
                            },
                        };
                    }
                });
                this.grid.on('overflowContextmenuChange', ({
                    list,
                    clientX,
                    clientY,
                    show
                }) => {
                    if (show) {
                        // 加个延时
                        setTimeout(() => {
                            this.overlayerContextmenu = {
                                show: true,
                                list,
                                style: {
                                    position: 'absolute',
                                    width: `${200}px`,
                                    background: '#fff',
                                    boxShadow: '0px 0px 12px rgba(0,0,0,0.12)',
                                    borderRight: 'none',
                                    left: `${clientX}px`,
                                    top: `${clientY}px`,
                                },
                            };
                        }, 0);
                    } else {
                        this.overlayerContextmenu = {
                            show: false,
                            list: [],
                            style: {
                                display: 'none',
                                left: `${-99999}px`,
                                top: `${-99999}px`,
                            },
                        };
                    }
                });
            })
        },
        doneEdit() {
            this.grid?.editor.doneEdit();
        },
        loadColumns(columns: any[]) {
            this.grid?.loadColumns(columns);
        },
        loadData(data: any[]) {
            this.grid?.loadData(data);
        },
        loadFooterData(data: any[]) {
            this.grid?.loadFooterData(data);
        },
        filterMethod(func: FilterMethod) {
            this.grid?.filterMethod(func);
        },
        loadConfig(config: any) {
            this.grid?.loadConfig(config);
        },
        getChangedData() {
            return this.grid?.getChangedData();
        },
        getChangedRows() {
            return this.grid?.getChangedRows();
        },
        validate() {
            return this.grid?.validate();
        },
        clearValidate() {
            return this.grid?.clearValidate();
        },
        getValidations() {
            return this.grid?.getValidations();
        },
        getSelectionRows() {
            return this.grid?.getSelectionRows();
        },
        toggleRowSelection(row: any) {
            this.grid?.toggleRowSelection(row);
        },
        setSelectionByRows(rows: any[], selected: boolean) {
            this.grid?.setSelectionByRows(rows, selected);
        },
        clearSelection() {
            this.grid?.clearSelection();
        },
    },
};
</script>

<style lang="css">
.jn-data-grid {
    --el-menu-item-height: 40px;
    --el-menu-active-color: '#303133';
    overflow: hidden;
    position: relative;
    width: auto;
}

.jn-data-grid-table {
    overflow: hidden;
    width: 100%;
}

.jn-data-grid-editor {
    position: absolute;
    top: -10000px;
    left: -10000px;
    text-align: left;
    line-height: 0;
    z-index: 100;
    overflow: hidden;
    background-color: #fff;
    border: 2px solid rgb(82, 146, 247);
    box-sizing: border-box;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 6px 16px;
    pointer-events: auto;
    display: flex;
    align-items: center;
}

.jn-data-grid-editor div[contenteditable="true"] {
    width: 100%;
    box-sizing: border-box;
    padding: 8px;
    outline: none;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
    font-weight: 400;
    font-size: 12px;
    color: inherit;
    white-space: normal;
    word-wrap: break-word;
    word-break: break-all;
    line-height: 18px;
    margin: 0;
    background: #fff;
    cursor: text;
}

.jn-data-grid-editor-popup input[type="text"] {
    border: none;
    outline: none;
    border-radius: 0;
}

.jn-data-grid-editor-popup .el-input__wrapper {
    border: none !important;
    box-shadow: none !important;
}

.jn-data-grid-overlayer {
    position: absolute;
    top: 0px;
    left: 0px;
}

.jn-data-grid-empty {
    font-size: 14px;
    color: #666;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
</style>
