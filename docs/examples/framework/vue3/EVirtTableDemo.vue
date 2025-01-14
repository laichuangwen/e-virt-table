<script lang="ts" setup>
import { faker, tr } from '@faker-js/faker';
import dayjs from 'dayjs';
import EVirtTable, { Column, ConfigType } from 'e-virt-table';
import EVirtTableVue from './EVirtTableVue.vue';
import { ref } from 'vue';
const editorTypes = ['text', 'select', 'date'];
let columns = ref<Column[]>([
    {
        type: 'index',
        key: 'index',
        width: 60,
        title: '',
        operation: true,
    },
    {
        title: 'name',
        key: 'name',
        readonly: true,
    },
    {
        title: 'avatar',
        key: 'avatar',
        readonly: true,
        overflowTooltipShow: false,
        render: 'avatar',
    },
    {
        title: 'image',
        key: 'image',
        readonly: true,
        overflowTooltipShow: false,
        render: 'image',
    },
    {
        title: 'customType',
        key: 'customType',
        readonly: true,
    },
    {
        title: 'custom',
        key: 'custom',
        width: 120,
    },
    {
        title: 'select',
        key: 'select',
        editorType: 'select',
        editorProps: {
            filterable: true,
            options: [
                { label: 'male', value: 'male' },
                { label: 'female', value: 'female' },
            ],
        },
    },
    {
        title: 'cascader',
        key: 'cascader',
        editorType: 'cascader',
        editorProps: {
            filterable: true,
            options: [
                {
                    label: 'Level0',
                    value: 0,
                    children: [
                        { label: 'Level0-4', value: 4 },
                        { label: 'Level0-5', value: 5 },
                        { label: 'Level0-6', value: 6 },
                    ],
                },
                { label: 'Level1', value: 1 },
                { label: 'Level2', value: 2 },
                { label: 'Level3', value: 3 },
            ],
        },
    },
    {
        title: 'number',
        key: 'number',
        editorType: 'number',
        align: 'right',
    },
    {
        title: 'years',
        key: 'years',
        editorType: 'date',
        editorProps: {
            type: 'year',
            valueFormat: 'YYYY',
        },
    },
    {
        title: 'month',
        key: 'month',
        editorType: 'date',
        editorProps: {
            type: 'month',
            valueFormat: 'YYYY-MM',
        },
    },
    {
        title: 'week',
        key: 'week',
        editorType: 'date',
        editorProps: {
            type: 'week',
            format: 'ww',
            valueFormat: 'ww',
        },
        formatter: (cell) => {
            return `${cell.value}周`;
        },
    },
    {
        title: 'date',
        key: 'date',
        editorType: 'date',
    },
    {
        title: 'time',
        key: 'time',
        editorType: 'time',
    },
]);
const users = faker.helpers.multiple(
    () => {
        return {
            name: faker.person.fullName(), // 生成随机名字
            avatar: faker.image.avatar(), // 生成随机头像
            image: faker.image.url(), // 生成随机头像
            customType: editorTypes[faker.number.int({ min: 0, max: editorTypes.length - 1 })], // 生成随机编辑器类型
            select: faker.person.sex(), // 生成随机性别
            number: faker.number.int({ min: 24, max: 66 }), // 生成随机性别
            date: dayjs(faker.date.recent()).format('YYYY-MM-DD'), // 生成随机Date
            years: dayjs(faker.date.anytime()).format('YYYY'), // 生成随机Date
            month: dayjs(faker.date.anytime()).format('YYYY-MM'), // 生成随机Date
            week: dayjs(faker.date.anytime()).format('ww'), // 生成随机Date
            time: dayjs(faker.date.anytime()).format('HH:mm:ss'), // 生成随机Date
            cascader: faker.number.int({ min: 1, max: 4 }), // 生成随机部门
        };
    },
    {
        count: 5000,
    },
);
const config: ConfigType = {
    ENABLE_AUTOFILL: true,
    ENABLE_SELECTOR: true,
    ENABLE_HISTORY: true,
    ENABLE_KEYBOARD: true,
    ENABLE_CONTEXT_MENU: true,
    HEIGHT: 500,
    BODY_CELL_EDITOR_METHOD: ({ column, row }) => {
        if (column.key === 'custom') {
            if (row.customType === 'select') {
                return {
                    type: 'select',
                    props: {
                        filterable: true,
                        options: [
                            {
                                label: '行编辑器',
                                value: '行编辑器',
                            },
                            {
                                label: '行编辑器1',
                                value: '行编辑器1',
                            },
                        ],
                    },
                };
            } else if (row.customType === 'date') {
                return {
                    type: 'date',
                    props: {
                        type: 'date',
                        valueFormat: 'YYYY-MM-DD',
                    },
                };
            }
        }
    },
};
function change(data) {
    console.log(data);
}
let evirtTable: EVirtTable | null = null;
function ready(grid: EVirtTable) {
    evirtTable = grid;
}
const disabled = ref(true);
function setDisabled(value) {
    evirtTable?.loadConfig({
        ...config,
        DISABLED: !value,
    });
}
setTimeout(() => {
    columns.value = columns.value.map((column) => {
        if (column.key === 'custom') {
            return {
                ...column,
                readonly: true,
            };
        }
        return column;
    });
}, 1000);
</script>
<template>
    <div>
        <div>
            <el-switch v-model="disabled" inline-prompt active-text="编辑" inactive-text="只读" @change="setDisabled" />
        </div>
        <EVirtTableVue @ready="ready" :columns="columns" :data="users" :config="config" @change="change">
            <template #avatar="{ row }">
                <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center">
                    <el-avatar :src="row.avatar" style="width: 20px; height: 20px" />
                </div>
            </template>
            <template #image="{ row }">
                <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center">
                    <el-image
                        :src="row.image"
                        preview-teleported
                        :preview-src-list="[row.image]"
                        style="width: 20px; height: 20px"
                    />
                </div>
            </template>
        </EVirtTableVue>
    </div>
</template>
