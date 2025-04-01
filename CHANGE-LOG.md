Vx.x.x(TPL)
-   Breaking Changes
-   Feature
-   Bug Fixes
-   Performance Improvements
-   Style changes
-   Dependencies Changes

V1.0.1
### Bug Fixes
- 修复调整位置时滚动位置错位
### Feature
- 添加footer可固定导表头下方

---

V1.0.2
### Bug Fixes
- 修复搜索过滤后无法选中复制粘贴
- 修复多选滚动后点击表头选中会错选问题

---

V1.0.3
### Bug Fixes
- 修复边框溢出及滚动条偏移问题
---

V1.0.4
### Bug Fixes
- 添加合并单元格数据关联及内置合并单元格工具类
- 拓展editorType可为none
- 拓展设置选择器之前的回调
- 拓展设置选中和填充之前的回调
---

V1.0.5
### Bug Fixes
- 修复移动端滚动条无法移动
- 修复滚动条iframe场景下抬起事件不触发导致的bug
- 修复选择器添加背景色样式不生效
- 修复editorType为none时选择器不会触发选中
- 修复配置svg不生效
- 文档更新
---

V1.0.6
### Bug Fixes
- 修复loadData后立刻scrollto性能问题
- 修复loadData后立刻scrollto没有效果
- 添加编辑器批量设置值方法
- 修复容器宽高发生变化，表格没有触发更新宽高
---

V1.0.7
### Bug Fixes
- 废弃
---

V1.0.8
### Bug Fixes
- 废弃
---

V1.0.9
### Bug Fixes
- 更改enter变成下一个，而不会是进入编辑状态
- 剔除isTrsut及文档
- 修复点击容器外选中不失去焦点
- 修复修复loadData后立刻scrollto性能问题
- 修复V1.0.8版本
---

V1.1.0
### Bug Fixes
- fix:调整按下esc键取消编辑
- fix:修复插槽情况下点击编辑需要点击两次
- fix:添加shift+enter向上移动并提交操作
- fix:更改enter向下移动并提交操作，而不是进入编辑
---

V1.1.1
### Bug Fixes
- fix:调整isTarget逻辑
- fix:修复文本编辑器点击外层不会清除选中
- feat:添加部分校验方法
- feat:change事件添加旧值
- feat:添加主动清除编辑器和选择器
---

V1.1.2
### Bug Fixes
- fix:修复文本编辑器点击外层,没有选中一直回调
---

V1.1.3
### Bug Fixes
- fix:修复滚动条hover失效问题
- fix:修复Tooltip移到内容也会hide
- docs:更新文档
- 解决iframe下点击容器外不失焦
- fix:移动表头宽度和移动行高到滚动条的边界处理
- fix:单选ENABLE_SELECTOR_SINGLE下shift快捷选中也能多选
---