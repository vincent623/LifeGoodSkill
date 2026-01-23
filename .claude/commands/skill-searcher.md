# Skill Searcher - 智能资源发现

搜索并推荐相关技能资源。

## Usage

```
/skill-searcher [intent] [--auto] [--search] [--install] [--adapt]
```

## Options

| Option | Description |
|--------|-------------|
| `intent` | 搜索意图描述，如 "文件整理" |
| `--auto` | 自动探索当前项目（默认开启） |
| `--search` | 执行多策略搜索 |
| `--install` | 安装 Top 3 推荐技能 |
| `--adapt` | 生成适应性改写计划 |

## Examples

```
/skill-searcher 文件整理 --search
/skill-searcher 搜索PDF处理 --search --install
/skill-searcher --auto --search --install --adapt
```

## Output

- 探索报告输出至 `skill-searcher-report.md`
- 搜索报告输出至 `skill-searcher-results.md`
