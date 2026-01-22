# AI 分析提示词模板

## 目录

1. [通用模板](#1-通用模板)
2. [场景化模板](#2-场景化模板)
3. [调用配置](#3-调用配置)
4. [错误处理](#4-错误处理)

---

## 1. 通用模板

### 基础摘要模板

```typescript
const buildPrompt = (entity: string, totalCount: number, issueCount: number, issueStats: string) => `
你是一个数据分析助手。请根据以下差异统计，提取1~5条核心问题，简要说明（不超过100字）。

实体：${entity}
总记录数：${totalCount}
差异数量：${issueCount}

差异类型统计：
${issueStats}

请直接列出核心问题，格式如"1. xxx 2. xxx"，不要有任何前缀或客套话。
`;
```

### 差异统计生成

```typescript
const generateStats = (issues: Issue[]): string => {
  const typeCount: Record<string, number> = {};

  issues.forEach(issue => {
    const type = String(issue['异常信息'] || '未知');
    typeCount[type] = (typeCount[type] || 0) + 1;
  });

  return Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])  // 按数量降序
    .map(([type, count]) => `- ${type}: ${count}条`)
    .join('\n');
};
```

---

## 2. 场景化模板

### 评分报告分析

```typescript
const SCORING_PROMPT = (entity: string, total: number, issues: number, stats: string) => `
你是建筑工程赛事申诉反馈客服。请根据以下选手的评分异常统计，从中提取1~5条最核心的问题，简要说明（不超过100字）。

选手：${entity}
总评分项数：${total}
异常数量：${issues}

异常类型统计：
${stats}

请直接列出核心问题，格式如"1. xxx 2. xxx"，不要有任何前缀或客套话。
`;
```

### 质检报告分析

```typescript
const QC_PROMPT = (entity: string, total: number, issues: number, stats: string) => `
你是质量管理专家。请根据以下产品质检异常统计，总结主要质量问题和改进建议（不超过100字）。

产品批号：${entity}
总检测项：${total}
异常项数：${issues}

异常分布：
${stats}

请直接给出分析结论，格式如"主要问题: 1. xxx 建议: 1. xxx"。
`;
```

### 财务对账分析

```typescript
const FINANCE_PROMPT = (entity: string, total: number, issues: number, stats: string) => `
你是财务审计专家。请根据以下对账差异统计，总结差异原因和风险点（不超过100字）。

客户/科目：${entity}
总对账项：${total}
差异项数：${issues}

差异类型：
${stats}

请直接给出分析，格式如"差异原因: 1. xxx 风险提示: xxx"。
`;
```

---

## 3. 调用配置

### API 配置

```typescript
interface AIConfig {
  apiUrl: string;
  model: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  batchSize: number;
}

const defaultConfig: AIConfig = {
  apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
  model: 'deepseek-ai/DeepSeek-V3',
  apiKey: '',  // 从 localStorage 读取
  maxTokens: 200,
  temperature: 0.3,
  timeout: 30000,
  batchSize: 3
};
```

### 调用函数

```typescript
const callAI = async (prompt: string, config: AIConfig): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content?.trim() || '生成失败';
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};
```

### 批量调用

```typescript
const batchCallAI = async (
  items: { entity: string; prompt: string }[],
  config: AIConfig,
  onProgress: (completed: number, total: number) => void
): Promise<Map<string, string>> => {
  const results = new Map<string, string>();
  const { batchSize } = config;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async item => {
        try {
          const summary = await callAI(item.prompt, config);
          return { entity: item.entity, summary, success: true };
        } catch (err) {
          return { entity: item.entity, summary: `失败: ${(err as Error).message}`, success: false };
        }
      })
    );

    batchResults.forEach(r => results.set(r.entity, r.summary));
    onProgress(Math.min(i + batchSize, items.length), items.length);
  }

  return results;
};
```

---

## 4. 错误处理

### 错误解析

```typescript
const parseError = async (response: Response): Promise<string> => {
  const status = response.status;
  let errMsg = '';

  try {
    const data = await response.json();
    errMsg = data.error?.message || data.message || '';
  } catch {}

  // 常见错误映射
  if (status === 401) return 'API Key 无效';
  if (status === 402 || errMsg.includes('insufficient') || errMsg.includes('余额')) {
    return '账户余额不足';
  }
  if (status === 429 || errMsg.includes('rate') || errMsg.includes('limit')) {
    return '请求过于频繁，请稍后重试';
  }
  if (status === 502 || status === 503) {
    return '服务暂时不可用';
  }

  return errMsg || `HTTP ${status}`;
};
```

### 超时处理

```typescript
const handleError = (err: Error): string => {
  if (err.name === 'AbortError') {
    return '请求超时';
  }
  if (err.message.includes('fetch') || err.message.includes('network')) {
    return '网络连接失败';
  }
  return err.message;
};
```

### UI 显示

```typescript
// 在表格中区分成功和失败
<td className={summary.startsWith('失败:') ? 'text-red-500' : 'text-gray-600'}>
  {summary}
</td>
```
