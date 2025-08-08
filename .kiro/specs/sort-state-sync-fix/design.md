# Design Document

## Overview

本设计文档解决外部调用 `setSortQueryData` 后排序图标状态循环被打乱的问题。问题的根本原因是 `setSortQueryData` 方法直接设置了后端排序状态，但没有考虑到点击图标时的状态循环逻辑需要基于当前实际状态进行转换。

当前的问题流程：

1. 外部调用 `setSortQueryData([{field: 'phone', direction: 'desc'}])`
2. `backendSortState` 被设置为 `desc` 状态
3. 用户点击排序图标
4. `handleSortClick` 方法获取当前状态，发现是 `desc`
5. 按照循环逻辑，`desc` 应该转换为 `none`
6. 但实际可能出现状态不同步的情况

## Architecture

### 当前架构分析

```
外部API调用 -> setSortQueryData() -> backendSortState.set() -> emit('draw')
用户点击图标 -> handleSortClick() -> getBackendSortState() -> setBackendSortState()
```

### 问题识别

1. **状态设置不一致**: `setSortQueryData` 直接设置状态，可能与内部状态管理逻辑不一致
2. **时间戳处理**: `setSortQueryData` 使用数组索引作为时间戳，可能与点击操作的时间戳冲突
3. **状态同步**: 外部设置状态后，内部状态循环逻辑没有正确同步

## Components and Interfaces

### 修改的组件

#### 1. Database.ts

-   **setSortQueryData 方法**: 需要确保正确设置时间戳和状态
-   **getBackendSortState 方法**: 确保返回正确的当前状态
-   **setBackendSortState 方法**: 保持现有逻辑不变

#### 2. Header.ts

-   **handleSortClick 方法**: 确保基于正确的当前状态进行状态转换

### 接口保持不变

现有的公共接口保持不变：

-   `setSortQueryData(sortData: { field: string, direction: 'asc' | 'desc' }[])`
-   `getBackendSortState(key: string)`
-   `setBackendSortState(key: string, direction: 'asc' | 'desc' | 'none')`

## Data Models

### 排序状态数据结构

```typescript
interface SortState {
    direction: 'asc' | 'desc' | 'none';
    timestamp: number;
}

// 后端排序状态映射
private backendSortState: Map<string, SortState>
```

### 状态转换规则

```typescript
// 状态循环: none -> asc -> desc -> none
const getNextDirection = (current: 'asc' | 'desc' | 'none'): 'asc' | 'desc' | 'none' => {
    switch (current) {
        case 'none':
            return 'asc';
        case 'asc':
            return 'desc';
        case 'desc':
            return 'none';
        default:
            return 'asc';
    }
};
```

## Error Handling

### 错误场景处理

1. **无效的排序方向**: 如果外部传入无效的 direction 值，应该忽略该字段
2. **字段不存在**: 如果设置的字段在列配置中不存在，应该记录警告但不中断执行
3. **状态不一致**: 如果检测到状态不一致，应该以最新设置的状态为准

### 错误恢复策略

-   对于无效输入，使用默认值 'none'
-   对于状态冲突，以时间戳较新的状态为准
-   提供调试信息帮助开发者定位问题

## Testing Strategy

### 单元测试

1. **setSortQueryData 方法测试**

    - 测试设置单个字段排序状态
    - 测试设置多个字段排序状态
    - 测试清空现有状态后设置新状态
    - 测试时间戳正确设置

2. **handleSortClick 方法测试**

    - 测试从 none 状态点击后转换为 asc
    - 测试从 asc 状态点击后转换为 desc
    - 测试从 desc 状态点击后转换为 none
    - 测试外部设置状态后点击的正确转换

3. **状态同步测试**
    - 测试外部设置状态后图标显示正确
    - 测试外部设置状态后点击循环正确
    - 测试多次外部设置和点击操作的状态一致性

### 集成测试

1. **端到端排序流程测试**

    - 模拟外部 API 调用设置排序状态
    - 验证图标显示状态
    - 模拟用户点击图标
    - 验证状态正确转换和图标更新

2. **多列排序测试**
    - 测试多列同时设置排序状态
    - 测试点击不同列的排序图标
    - 验证各列状态独立正确

### 回归测试

确保修复不影响现有功能：

-   前端排序功能正常
-   后端排序查询事件正常触发
-   排序图标显示正常
-   多列排序功能正常
