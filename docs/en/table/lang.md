# Locale

e-virt-table ships with built-in Chinese and English text. The default locale is `zh-CN`. Use `useLocale` to switch global or per-instance language configuration.

## Methods

| Method | Description | Parameters |
| --- | --- | --- |
| EVirtTable.useLocale | Set the global default locale for newly created instances | `LangConfig` |
| useLocale | Set the locale for the current instance, overrides the global config | `LangConfig` |

> After switching locale, call `doLayout()` to refresh UI that depends on text, such as empty state and context menus.

## Built-in Locales

The repository provides Chinese and English locale files that you can copy or maintain in your project:

| Locale | File |
| --- | --- |
| Simplified Chinese | [`src/lang/zh-CN.ts`](https://github.com/laichuangwen/e-virt-table/blob/main/src/lang/zh-CN.ts) |
| English | [`src/lang/en-US.ts`](https://github.com/laichuangwen/e-virt-table/blob/main/src/lang/en-US.ts) |

## Usage

### Global Config

Set before creating tables. All instances share this locale (instance-level `useLocale` can override it):

```ts
import EVirtTable from 'e-virt-table';
import enUS from './lang/en-US'; // copy locale files from the repository

EVirtTable.useLocale(enUS);

const grid = new EVirtTable(target, { data, columns });
```

### Instance Config

Affects only the current table instance:

```ts
import zhCN from './lang/zh-CN';

grid.useLocale(zhCN);
grid.doLayout();
```

### Custom Locale

`LangConfig` is a key-value object. Extend or override built-in locale fields as needed:

```ts
import zhCN from './lang/zh-CN';

const customLang = {
    ...zhCN,
    emptyText: 'No records',
    copy: 'Copy content',
};

grid.useLocale(customLang);
grid.doLayout();
```

## Built-in Keys

| Key | Description |
| --- | --- |
| emptyText | Empty data message |
| loadingText | Loading message |
| copy / cut / paste | Context menu: copy, cut, paste |
| clearSelected | Context menu: clear selected content |
| fixedLeft / fixedRight / fixedNone | Header context menu: column pinning |
| hide / visible / resetHeader | Header context menu: hide, show, reset default |
| numberErrorTip | Number input validation message |
| invalidNumber | Invalid number message |
| numberTruncated | Number precision truncation message, supports `{precision}` |
| numberMin / numberMax | Number range messages, supports `{min}` / `{max}` |
| stringMaxlength | String length truncation message, supports `{maxlength}` |
| mergeCellNoFill / mergeCellNoCopy / mergeCellNoPaste | Merged cell operation restriction messages |
| batchSetItemValueError | Batch assignment error message |

## Locale Switching

Use the buttons below to switch between Chinese and English. You can try:

- Empty data text (click "Toggle Empty Data")
- Cell context menu
- Header context menu

::: demo

lang/base
h:360px
:::
