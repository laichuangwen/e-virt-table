# 多语言

e-virt-table 内置中英文文案，默认语言为 `zh-CN`。可通过 `useLocale` 切换全局或实例级语言配置。

## Methods

| 方法名称 | 说明 | 参数 |
| --- | --- | --- |
| EVirtTable.useLocale | 设置全局默认语言，影响后续新建实例 | `LangConfig` |
| useLocale | 设置当前实例语言，优先级高于全局配置 | `LangConfig` |

> 切换语言后建议调用 `doLayout()` 刷新空数据、右键菜单等依赖文案的 UI。

## 内置语言包

仓库中提供了中英文语言包，可按需复制或自行维护：

| 语言 | 文件路径 |
| --- | --- |
| 简体中文 | [`src/lang/zh-CN.ts`](https://github.com/laichuangwen/e-virt-table/blob/main/src/lang/zh-CN.ts) |
| 英文 | [`src/lang/en-US.ts`](https://github.com/laichuangwen/e-virt-table/blob/main/src/lang/en-US.ts) |

## 使用方式

### 全局配置

在创建表格前设置，所有实例共享该语言（实例级 `useLocale` 可覆盖）：

```ts
import EVirtTable from 'e-virt-table';
import enUS from './lang/en-US'; // 从仓库语言包复制到项目中

EVirtTable.useLocale(enUS);

const grid = new EVirtTable(target, { data, columns });
```

### 实例配置

仅影响当前表格实例：

```ts
import zhCN from './lang/zh-CN';

grid.useLocale(zhCN);
grid.doLayout();
```

### 自定义语言

`LangConfig` 为键值对对象，可基于内置语言包扩展或覆盖部分字段：

```ts
import zhCN from './lang/zh-CN';

const customLang = {
    ...zhCN,
    emptyText: '没有记录',
    copy: '复制内容',
};

grid.useLocale(customLang);
grid.doLayout();
```

## 内置文案 Key

| Key | 说明 |
| --- | --- |
| emptyText | 空数据提示 |
| loadingText | 加载中提示 |
| copy / cut / paste | 右键菜单：复制、剪切、粘贴 |
| clearSelected | 右键菜单：清空选中内容 |
| fixedLeft / fixedRight / fixedNone | 表头右键：列固定 |
| hide / visible / resetHeader | 表头右键：隐藏、显示、恢复默认 |
| numberErrorTip | 数字输入校验提示 |
| invalidNumber | 非法数字提示 |
| numberTruncated | 数字精度截取提示，支持 `{precision}` |
| numberMin / numberMax | 数字范围提示，支持 `{min}` / `{max}` |
| stringMaxlength | 字符串长度截取提示，支持 `{maxlength}` |
| mergeCellNoFill / mergeCellNoCopy / mergeCellNoPaste | 合并单元格操作限制提示 |
| batchSetItemValueError | 批量赋值错误提示 |

## 多语言切换

点击下方按钮切换中英文，可体验：

- 空数据文案（点击「切换空数据」）
- 单元格右键菜单
- 表头右键菜单

::: demo

lang/base
h:360px
:::
