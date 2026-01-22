# 差异检测配置模式

## 目录

1. [显式列模式](#1-显式列模式)
2. [数值比较模式](#2-数值比较模式)
3. [状态标记模式](#3-状态标记模式)
4. [混合模式](#4-混合模式)

---

## 1. 显式列模式

适用于 Excel 中有明确的错误/异常描述列。

### 配置

```typescript
const ERROR_COLUMNS = ['错误信息', '异常说明', '差异原因', '问题描述'];

const extractIssues = (data: Record<string, unknown>[]): Issue[] => {
  // 查找第一个存在的错误列
  let errorCol: string | null = null;
  if (data.length > 0) {
    const columns = Object.keys(data[0]);
    for (const col of ERROR_COLUMNS) {
      if (columns.includes(col)) {
        errorCol = col;
        break;
      }
    }
  }

  if (!errorCol) return [];

  // 提取非空错误行
  return data
    .filter(row => row[errorCol] !== undefined && row[errorCol] !== null && row[errorCol] !== '')
    .map(row => ({
      ...row,
      异常信息: row[errorCol]
    }));
};
```

### 适用场景

- 评分报告（错误信息列）
- 审计报告（问题描述列）
- 检查清单（备注/异常列）

---

## 2. 数值比较模式

适用于需要比较标准值和实际值的场景。

### 配置

```typescript
interface CompareConfig {
  standardCol: string;  // 标准值列名
  actualCol: string;    // 实际值列名
  threshold: number;    // 差异阈值（绝对值或百分比）
  thresholdType: 'absolute' | 'percentage';
}

const config: CompareConfig = {
  standardCol: '标准值',
  actualCol: '实际值',
  threshold: 0.05,
  thresholdType: 'percentage'
};

const extractIssues = (data: Record<string, unknown>[], config: CompareConfig): Issue[] => {
  return data.filter(row => {
    const standard = Number(row[config.standardCol]);
    const actual = Number(row[config.actualCol]);

    if (isNaN(standard) || isNaN(actual)) return false;

    const diff = Math.abs(standard - actual);

    if (config.thresholdType === 'percentage') {
      return standard !== 0 && (diff / Math.abs(standard)) > config.threshold;
    }
    return diff > config.threshold;
  }).map(row => ({
    ...row,
    异常信息: `差异: ${row[config.standardCol]} vs ${row[config.actualCol]}`
  }));
};
```

### 适用场景

- 质检报告（测量值 vs 标准值）
- 财务对账（应收 vs 实收）
- 库存盘点（账面 vs 实际）

---

## 3. 状态标记模式

适用于有明确状态列标记合格/不合格的场景。

### 配置

```typescript
interface StatusConfig {
  statusCol: string;           // 状态列名
  errorValues: string[];       // 视为异常的值
  caseSensitive?: boolean;     // 是否区分大小写
}

const config: StatusConfig = {
  statusCol: '检验结果',
  errorValues: ['不合格', 'NG', 'FAIL', '异常', '未通过'],
  caseSensitive: false
};

const extractIssues = (data: Record<string, unknown>[], config: StatusConfig): Issue[] => {
  return data.filter(row => {
    let status = String(row[config.statusCol] || '');
    const errorVals = config.errorValues;

    if (!config.caseSensitive) {
      status = status.toLowerCase();
      return errorVals.some(v => v.toLowerCase() === status);
    }
    return errorVals.includes(status);
  }).map(row => ({
    ...row,
    异常信息: `状态: ${row[config.statusCol]}`
  }));
};
```

### 适用场景

- 质检报告（合格/不合格）
- 考试成绩（通过/未通过）
- 任务清单（完成/未完成）

---

## 4. 混合模式

组合多种检测方式，满足复杂场景。

### 配置

```typescript
interface MixedConfig {
  explicitColumns?: string[];
  compareConfig?: CompareConfig;
  statusConfig?: StatusConfig;
}

const extractIssues = (data: Record<string, unknown>[], config: MixedConfig): Issue[] => {
  const issues: Issue[] = [];
  const seen = new Set<number>();

  // 优先级 1：显式列
  if (config.explicitColumns) {
    const explicit = extractByExplicitColumn(data, config.explicitColumns);
    explicit.forEach((issue, idx) => {
      issues.push(issue);
      seen.add(idx);
    });
  }

  // 优先级 2：数值比较
  if (config.compareConfig) {
    const compared = extractByCompare(data, config.compareConfig);
    compared.forEach((issue, idx) => {
      if (!seen.has(idx)) {
        issues.push(issue);
        seen.add(idx);
      }
    });
  }

  // 优先级 3：状态标记
  if (config.statusConfig) {
    const status = extractByStatus(data, config.statusConfig);
    status.forEach((issue, idx) => {
      if (!seen.has(idx)) {
        issues.push(issue);
      }
    });
  }

  return issues;
};
```

### 适用场景

- 综合质检报告（有错误描述 + 数值偏差 + 状态标记）
- 复杂审计报告
