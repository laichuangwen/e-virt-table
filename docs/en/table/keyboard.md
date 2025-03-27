# Keyboard Events

-   `config.ENABLE_KEYBOARD` set to `true` enables keyboard events. it is enabled by default.

## Config

| Parameter       | Description     | Type    | Default |
| --------------- | --------------- | ------- | ------- |
| ENABLE_KEYBOARD | Enable keyboard | boolean | true    |
| ENABLE_COPY     | Enable copy     | boolean | true    |
| ENABLE_PASTER   | Enable paste    | boolean | true    |

## Supported Operations

| Description                          | Windows                          | Mac                       |
| ------------------------------------ | -------------------------------- | ------------------------- |
| Copy cell content                    | `Ctrl + C`                       | `Command + C`             |
| Paste (supports Excel format)        | `Ctrl + V`                       | `Command + V`             |
| Cut cell content                     | `Ctrl + X`                       | `Command + X`             |
| Delete cell content                  | `Delete` or `Backspace`          | `Delete` or `Fn + Delete` |
| Move selected cell up                | `↑`                              | `↑`                       |
| Move selected cell down              | `↓`                              | `↓`                       |
| Move selected cell left              | `←`                              | `←`                       |
| Move selected cell right             | `→`                              | `→`                       |
| Start or finish editing              | `Enter`                          | `Enter`                   |
| Cancel editing                       | `Esc`                            | `Esc`                     |
| Commit and move to the next line     | `Enter`                          | `Enter`                   |
| Commit and move to the previous line | `Shift+Enter`                    | `Shift+Enter`             |
| Line break in input box              | `Ctrl+Enter`                     | `Command+Enter`           |
| Undo                                 | `Ctrl + Z`                       | `Command + Z`             |
| Redo                                 | `Ctrl + Y` or `Ctrl + Shift + Z` | `Command + Shift + Z`     |

## Enable

-   `config.ENABLE_KEYBOARD` set to `true` is enabled by default.

::: demo

keyboard/enable
h:320px
:::

## Disable

-   `config.ENABLE_KEYBOARD` set to `false`.

::: demo
keyboard/disabled
h:320px
:::
