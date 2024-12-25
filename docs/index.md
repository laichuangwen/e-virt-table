---
home: true
---

<script setup lang="ts">
import { onMounted } from 'vue'
const base = import.meta.env.BASE_URL || '/' // 获取 base 配置
onMounted(() => {
  location.replace(`${base}zh/intro`)
})
</script>

