# 键盘事件

-   `config.ENABLE_KEYBOARD`为`true`即开启键盘事件，只支持全部启用或全部禁用，默认是启用

## Config

| 参数            | 说明     | 类型    | 默认值 |
| --------------- | -------- | ------- | ------ |
| ENABLE_KEYBOARD | 启用键盘 | boolean | true   |
| ENABLE_COPY     | 启用复制 | boolean | true   |
| ENABLE_PASTER   | 启用粘贴 | boolean | true   |

## 支持操作

| 操作                        | Windows 快捷键                   | Mac 快捷键                |
| --------------------------- | -------------------------------- | ------------------------- |
| 复制区域单元格内容          | `Ctrl + C`                       | `Command + C`             |
| 粘贴（支持 excel 内容格式） | `Ctrl + V`                       | `Command + V`             |
| 剪切区域单元格内容          | `Ctrl + X`                       | `Command + X`             |
| 删除区域单元格内容          | `Delete` 或 `Backspace`          | `Delete` 或 `Fn + Delete` |
| 上移选中单元格              | `↑`                              | `↑`                       |
| 下移选中单元格              | `↓`                              | `↓`                       |
| 左移选中单元格              | `←`                              | `←`                       |
| 右移选中单元格              | `→`                              | `→`                       |
| 取消编辑                    | `Esc`                            | `Esc`                     |
| 结束输入并移动到下一行      | `Enter`                          | `Enter`                   |
| 结束输入并移动到上一行      | `Shift+Enter`                    | `Shift+Enter`             |
| 输入框换行                  | `Ctrl+Enter`                     | `Command+Enter`           |
| 撤销操作                    | `Ctrl + Z`                       | `Command + Z`             |
| 恢复操作                    | `Ctrl + Y` 或 `Ctrl + Shift + Z` | `Command + Shift + Z`     |

## 启用

-   `config.ENABLE_KEYBOARD`为`true`默认是启用的 

::: demo

keyboard/enable
h:320px
:::

## 禁用

-   `config.ENABLE_KEYBOARD`为`false` 

::: demo
keyboard/disabled
h:320px
:::
