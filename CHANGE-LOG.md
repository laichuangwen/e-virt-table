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

V1.1.4
### Bug Fixes
- fix:修复右fixed阴影1px问题
- fix:更改选择器和填充器的绘画逻辑修复线条存在点问题
- feat:添加selection跨页选
- feat:添加数字类型type

---


V1.1.5
### Bug Fixes
- fix:添加selection缓存提升渲染速度
- fix:修复虚拟cell传row出错
- 更新文档

---

V1.1.6
### Bug Fixes
- fix:解决selection性能问题
- fix:优化编辑提示图标，合并单元格场景
- feat:添加placeholder
- fix:editType为none时阻止hoverIconClick进入编辑
- 更新文档

---

V1.1.7
### Bug Fixes
- fix:合并单元格不能有placeholder
- fix:修复offHeight的位置错位
- fix:同给个页面两个table键盘输入会错乱
- fix:默认选择器为启用
  
---

V1.1.8
### Bug Fixes
- fix:解决type为number时change方法中触发全局校验会递归

---

V1.1.9
### Bug Fixes
- fix:聚焦滚动问题
- fix:修复hover图标
---

V1.2.0
### Bug Fixes
- fix:BODY_CELL_STYLE_METHOD 无法作用在index列
---

V1.2.1
### Bug Fixes
- fix: 优化空数据处理逻辑，调整高度计算并重新触发空状态事件
- fix:优化svg图片加载性能
- fix:添加passive去除阻止滚动警告
- fix:过滤数据方法没刷新数据
---

V1.2.2
### Bug Fixes
- fix:beforePasteDataMethod中添加textArr参数
- feat:添加onPastedDataOverflow方法回调
---

V1.2.3
### Bug Fixes
feat: 支持使用 Shift + Tab 键向左移动焦点
feat: 支持使用 Tab 键在编辑状态下移动焦点
---

V1.2.4(废弃)
### Bug Fixes
feat: 添加css全局变量及暗黑主题切换
docs: 更新主题文档
---

V1.2.5
### Bug Fixes
fix: 修复css全局变量比config优先级
---

V1.2.6
### Bug Fixes
fix: 去除复制粘贴剪切阻止默认行为
---

V1.2.7
### Bug Fixes
fix:修复过滤数据后，编辑数据会错乱
---

V1.2.8
### Bug Fixes
fix: 修复tree溢出文本显示的错误
docs: 更新ENABLE_HISTORY默认值为false
docs: 更新tree文档
---

V1.2.9
### Bug Fixes
fix: 主题css字体样式失效
feat: body,footer文本颜色配置
---

V1.2.10
### Bug Fixes
fix: 浏览器修复部分缩放canvas字体会糊
---

V1.2.11
### Bug Fixes
fix: 废除ENABLE_RESERVE_SELECTION属性，默认支持跨页选
fix: 在handleContextMenu中添加preventDefault以防止默认右键菜单
feat: 添加列宽度的最小和最大限制
fix: 修复tree重新加载数据会恢复初始状态
fix: 修复列宽调整后双击错乱
feat: 添加获取高亮行功能并更新相关逻辑
---


V1.2.12
### Bug Fixes
fix: 优化多选清除
---

V1.2.13
### Bug Fixes
fix: 加载数据不清除提示
docs: 添加hover编辑图标文档例子
---

V1.2.14
### Bug Fixes
fix: 修复dom选中时不能复制
---

V1.2.15
### Bug Fixes
fix: 修复初始化列宽为null时滚动条计算错误
fix: 优化tooltip功能，添加表头tooltip
---

V1.2.16
### Bug Fixes
fix: 修复loadConfig，filterMethod会清除校验错误信息及已经改变值
fix: 修复tree校验错误时不回展开
---

V1.2.17
### Bug Fixes
refactor:重构校验器，剔除async-validator
fix: 添加config类型提示
---

V1.2.18
### Bug Fixes
fix: 解决选择和tree导致的内存泄漏 #73
feat: 添加选择器值类型支持，更新相关逻辑以处理displayText和value
---

V1.2.19
### Bug Fixes
feat: 优化批量设置值的方法，支持只读设置方法
feat: 添加清除可以编辑cell数据方法
---

V1.2.20
### Bug Fixes
fix: 废除批量设置值支持只读，变更为通过BEFORE_VALUE_CHANGE_METHOD进行更改，支持只读值更改
fix: 优化验证逻辑修复非必填时返回错误
---

V1.2.21
### Bug Fixes
fix: 修复校验器，非必填时自定义校验方法失效
---

V1.2.22
### Bug Fixes
feat: 添加tree-selection和selection-tree类型支持树形选择
feat: 添加COLUMNS_ALIGN，COLUMNS_VERTICAL_ALIGN 全局可控制
---


V1.2.23
### Bug Fixes
feat: 添加tree层级线
fix: 修复默认没有设置css变量时导致传递config空
docs: 更新文档
---

V1.2.24
### Bug Fixes
feat: 添加表头排序功能
docs: 更新文档
---

V1.2.25
### Bug Fixes

fix:修复合并单元格编辑时编辑不更改数据也会触发change事件

---

V1.2.26
### Bug Fixes

fix:修复添加排序功能导致validate失效问题

---

V1.2.27
### Bug Fixes

fix:修复合并单元格不能选中

---

V1.2.28
### Bug Fixes
feat: 支持多行显示
feat: 支持多行溢出截取
feat: 支持自适应行高
fix:优化排序图标位置算法

---

V1.2.29
### Bug Fixes
fix:修复多个dom自动行高没有生效
fix:优化自动行高dom会闪
feat:添加必填标识

---


V1.2.29
### Bug Fixes
fix:修复多个dom自动行高没有生效
fix:优化自动行高dom会闪
feat:添加必填标识

---

V1.2.30
### Bug Fixes
fix:添加多行文本缓存优化多行文本的性能

---

V1.2.31
### Bug Fixes
fix:修复title传数字会出现异常

---

V1.2.32
### Bug Fixes

feat:添加必填*配置颜色
fix:setLoading不生效
fix:#92动态修改调整行列无效
fix:修复设置maxLineClamp导致verticalAlign=bottom 计算错误
feat:可以调整checkbox的边框颜色,及拓展部分图标也可也控制颜色
fix:column.title没设置会出现undefined
fix:type='selection' title=‘’ 的列过窄会出现tooltip

---