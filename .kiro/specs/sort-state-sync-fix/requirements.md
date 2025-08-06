# Requirements Document

## Introduction

修复外部调用 `setSortQueryData` 后排序图标状态循环被打乱的问题。当外部设置了排序状态后，点击图标的循环逻辑没有正确同步，导致状态跳转不符合预期。例如，当外部设置为"下"（desc）状态，但点击图标后仍然变成了"下"而不是预期的"无"状态。

## Requirements

### Requirement 1

**User Story:** 作为开发者，我希望外部调用 `setSortQueryData` 设置排序状态后，点击排序图标能够正确按照循环顺序切换状态，以确保用户交互的一致性。

#### Acceptance Criteria

1. WHEN 外部调用 `setSortQueryData` 设置排序状态为 'asc' THEN 点击排序图标 SHALL 切换到 'desc' 状态
2. WHEN 外部调用 `setSortQueryData` 设置排序状态为 'desc' THEN 点击排序图标 SHALL 切换到 'none' 状态  
3. WHEN 外部调用 `setSortQueryData` 设置排序状态为空或不包含该字段 THEN 点击排序图标 SHALL 切换到 'asc' 状态

### Requirement 2

**User Story:** 作为开发者，我希望排序状态的循环逻辑保持一致，无论是通过点击图标还是外部API设置的状态，都应该遵循相同的状态转换规则。

#### Acceptance Criteria

1. WHEN 任何方式设置排序状态后 THEN 后续的点击操作 SHALL 基于当前实际状态进行正确的状态转换
2. WHEN 外部设置排序状态后 THEN 图标显示 SHALL 与实际状态保持同步
3. WHEN 点击排序图标时 THEN 状态转换 SHALL 遵循 none -> asc -> desc -> none 的循环顺序

### Requirement 3

**User Story:** 作为用户，我希望排序图标的视觉状态与实际的排序行为保持一致，避免混淆。

#### Acceptance Criteria

1. WHEN 排序状态为 'asc' THEN 图标 SHALL 显示升序状态
2. WHEN 排序状态为 'desc' THEN 图标 SHALL 显示降序状态
3. WHEN 排序状态为 'none' THEN 图标 SHALL 显示未排序状态
4. WHEN 外部设置排序状态后 THEN 图标状态 SHALL 立即更新以反映新状态