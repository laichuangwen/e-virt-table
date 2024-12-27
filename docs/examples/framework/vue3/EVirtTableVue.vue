<script lang="ts" setup>
import EVirtTable from 'e-virt-table';
import { ref, onMounted } from 'vue';
const eVirtTableRef = ref(null);
const eVirtTableEditorRef = ref(null);
onMounted(() => {
    if (!eVirtTableRef.value) {
        return;
    }
    const columns = [
        { key: 'id', title: 'ID', width: 50 },
        { key: 'name', title: 'Name', width: 200 },
        { key: 'age', title: 'Age', width: 100 },
    ];
    // const eVirtTable = new EVirtTable(eVirtTableRef.value, {
    //     columns,
    //     data: [
    //         { id: 1, name: 'John Doe', age: 25 },
    //         { id: 2, name: 'Jane Doe', age: 22 },
    //     ],
    // });
});
</script>
<template>
    <div ref="eVirtTableRef">
        <div ref="eVirtTableEditorRef"></div>
        <div ref="eVirtTableEditorRef"></div>
    </div>
</template>
