# 主题样式

-   可根据颜色配置定制自己的主题

## light
  
::: demo 默认是light主题 

theme/light
h:500px
:::


## dark

::: demo 通过config传入自定义颜色配置实现暗黑主题(比css变量更优先)

theme/dark
h:500px
:::

## 更多
- 上面只是个简单的配置例子，config里还有更多的颜色配置


## dark css 变量(推荐V1.2.5版本后可用)
- 内部通过MutationObserver监听html的class变化进行更新config变量的值
- 注意:config传入自定义颜色配置比css优先等级高
``` css
:root {
    --evt-color-white: #fff;
    --evt-color-black: #000000;
    --evt-color-primary: rgb(82, 146, 247);
    --evt-text-color-primary: #333;
    --evt-text-color-regular: #666;
    --evt-text-color-secondary: #999;
    --evt-box-shadow: 0 2px 12px 0 #0000001a;
    --evt-editor-bg-color: #fff;
    --evt-editor-text-color: #333;
    --evt-border-color: #e1e6eb;
    --evt-body-bg-color: #fff;
    --evt-stripe-color: #fafafa;
    --evt-placeholder-color: #cdd0dc;
    --evt-header-bg-color: #f8faff;
    --evt-body-bg-color: #fff;
    --evt-header-text-color: #1d2129;
    --evt-loading-icon-color: #4e5969;
    --evt-expand-icon-color: #4e5969;
    --evt-shrink-icon-color: #4e5969;
    --evt-error-tip-icon-color: red;
    --evt-cell-hover-icon-bg-color: #fff;
    --evt-cell-hover-icon-border-color: #dde0ea;
    --evt-scroller-color: #dee0e3;
    --evt-scroller-track-color: #fff;
    --evt-scroller-focus-color: #bbbec4;
    --evt-select-border-color: var(--evt-color-primary);
    --evt-select-area-color: rgba(82, 146, 247, 0.1);
    --evt-select-row-col-bg-color: transparent;
    --evt-autofill-point-border-color: #fff;
    --evt-edit-bg-color: #fcf6ed;
    --evt-checkbox-color: var(--evt-color-primary);
    --evt-readonly-color: #fff;
    --evt-readonly-text-color: #4e5969;
    --evt-error-tip-color: #ed3f14;
    --evt-footer-bg-color: #fafafa;
    --evt-highlight-hover-row-color: rgba(186, 203, 231, 0.1);
    --evt-highlight-selected-row-color: rgba(82, 146, 247, 0.1);
    --evt-tooltip-bg-color: #303133;
    --evt-tooltip-text-color: #fff;
    --evt-resize-row-line-color: #e1e6eb;
    --evt-resize-column-line-color: #e1e6eb;
}
.dark {
    --evt-border-color: #363637;
    --evt-header-bg-color: #141414;
    --evt-body-bg-color: #141414;
    --evt-header-text-color: #a3a6ad;
    --evt-scroller-color: #414243;
    --evt-scroller-track-color: #141414;
    --evt-scroller-focus-color: #a3a6ad;
    --evt-edit-bg-color: #141414;
    --evt-readonly-text-color: #cfd3dc;
    --evt-footer-bg-color: #262727;
    --evt-autofill-point-border-color: #fff;
    --evt-editor-bg-color: #434343;
    --evt-editor-text-color: #cfd3dc;
}
```