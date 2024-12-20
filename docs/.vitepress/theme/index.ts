import DefaultTheme from 'vitepress/theme';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'prismjs/themes/prism-solarizedlight.css';
import VpDemo from '../src/vp-demo.vue';
import VpApiTyping from '../src/vp-api-typing.vue';
import './custom-style.css';
export default {
    ...DefaultTheme,
    enhanceApp: ({ app }) => {
        app.use(ElementPlus, {
            locale: zhCn,
        });
        app.component('Demo', VpDemo);
        app.component('ApiTyping', VpApiTyping);
    },
};
