---
home: true
---

<script setup lang="ts">
import { useRouter } from 'vitepress'

const base = import.meta.env.BASE_URL || '/' // 获取 base 配置
const router = useRouter()
router.go(`${base}zh/intro`)
</script>

