# Theme Styles

- You can customize your own theme based on color configuration

## light
  
::: demo The default theme is light

theme/light
h:500px
:::

## dark

::: demo Implement dark theme by passing custom color configuration through config

theme/dark
h:500px
:::

## More
- The above is just a simple configuration example, there are more color configurations in the config


## dark css variable (recommended to be available after V1.2.5)
- Internally, MutationObserver is used to monitor the class changes of HTML to update the value of the config variable
- Note: Custom color configuration passed in config has a higher priority than css
``` css
:root {
    --evt-header-font: '12px normal Arial';
    --evt-body-font: '12px normal Arial';
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
