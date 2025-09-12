<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from "vue";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { html } from "@codemirror/lang-html";
import { EditorState } from "@codemirror/state";

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
});

const editorRef = ref<HTMLDivElement>();
let editorView: EditorView | null = null;

const decoded = computed(() => {
  return decodeURIComponent(props.source);
});

onMounted(async () => {
  await nextTick();
  if (editorRef.value) {
    editorView = new EditorView({
      state: EditorState.create({
        doc: decoded.value,
        extensions: [
          basicSetup,
          html(),
        ],
      }),
      parent: editorRef.value,
    });
  }
});
</script>

<template>
  <div class="example-source-wrapper">
    <div ref="editorRef" class="example-source"></div>
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