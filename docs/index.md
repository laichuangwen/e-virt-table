<!--@include: ./zh/index.md-->
<script setup lang="ts">
import { onMounted } from 'vue'
const base = import.meta.env.BASE_URL || '/' // 获取 base 配置
onMounted(() => {
    const pathParts = location.pathname.split('/').filter(Boolean); // 分割路径
    if(pathParts.lenght){
      const lang = pathParts[0];
      location.replace(`${base}${lang}/`)
    }else{
      location.replace(`${base}zh/`)
    }
})
</script>
