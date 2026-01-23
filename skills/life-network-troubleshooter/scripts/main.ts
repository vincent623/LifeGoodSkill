#!/usr/bin/env bun

interface DiagnosisResult {
  timestamp: string;
  target: string;
  status: "success" | "failed" | "partial";
  checks: {
    ping?: { reachable: boolean; latency?: number; loss?: number };
    dns?: { resolved?: string };
    ports?: { open: string[]; closed: string[] };
    tcp?: { reachable: boolean };
  };
  recommendations: string[];
}

function getTimestamp(): string {
  return new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
}

async function pingHost(ip: string): Promise<{ reachable: boolean; latency: number; loss: number }> {
  try {
    const proc = Bun.spawn(["ping", "-c", "4", ip], { timeout: 10000 });
    const output = await new Response(proc.stdout).text();
    await proc.exited;

    const lossMatch = output.match(/(\d+)% packet loss/);
    const latencyMatch = output.match(/= \/(\d+\.\d+)\//);

    const loss = lossMatch ? parseInt(lossMatch[1]) : 100;
    const latency = latencyMatch ? parseFloat(latencyMatch[1]) : 0;

    return { reachable: loss < 100, latency, loss };
  } catch {
    return { reachable: false, latency: 0, loss: 100 };
  }
}

async function checkDNS(hostname: string): Promise<string | undefined> {
  try {
    const proc = Bun.spawn(["nslookup", hostname], { timeout: 5000 });
    const output = await new Response(proc.stdout).text();
    await proc.exited;

    const match = output.match(/Address: ([\d.]+)/);
    return match?.[1];
  } catch {
    return undefined;
  }
}

async function checkPort(ip: string, port: number): Promise<boolean> {
  try {
    const proc = Bun.spawn(["nc", "-z", "-w", "2", ip, port.toString()], { timeout: 5000 });
    await proc.exited;
    return proc.exitCode === 0;
  } catch {
    return false;
  }
}

async function checkTCP(ip: string, port: number): Promise<boolean> {
  try {
    const proc = Bun.spawn(["nc", "-z", "-w", "2", ip, port.toString()], { timeout: 5000 });
    await proc.exited;
    return proc.exitCode === 0;
  } catch {
    return false;
  }
}

function generateReport(result: DiagnosisResult, outputFile: string) {
  const statusEmoji = result.status === "success" ? "✅" : result.status === "partial" ? "⚠️" : "❌";

  const content = `# 网络诊断报告

${statusEmoji} **时间**: ${result.timestamp}
${statusEmoji} **目标**: ${result.target}
${statusEmoji} **状态**: ${result.status === "success" ? "全部通过" : result.status === "partial" ? "部分问题" : "诊断失败"}

---

## 一、Ping 测试

| 指标 | 结果 |
|------|------|
| 连通性 | ${result.checks.ping?.reachable ? "✅ 可达" : "❌ 不可达"} |
| 延迟 | ${result.checks.ping?.latency?.toFixed(2) || "N/A"} ms |
| 丢包率 | ${result.checks.ping?.loss || 0}% |

${!result.checks.ping?.reachable ? `
### 🔧 解决方案

**可能原因：**
1. IP 地址不正确或主机离线
2. 网线连接故障
3. 需要配置静态 IP（直连环境）
4. 防火墙拦截 ICMP

**排查命令：**
\`\`\`bash
# 检查本地网络接口
ifconfig

# 查看路由表
netstat -rn

# 测试不同端口
nc -zv <ip> 80
\`\`\`
` : ""}

---

## 二、DNS 解析

| 指标 | 结果 |
|------|------|
| 解析结果 | ${result.checks.dns?.resolved || "❌ 解析失败"} |

${!result.checks.dns?.resolved && result.target.includes(".") && !result.target.match(/^\d+\.\d+\.\d+\.\d+$/) ? `
### 🔧 解决方案

\`\`\`bash
# 刷新 DNS 缓存 (Mac)
sudo dscacheutil -flushcache

# 使用 Google DNS
nslookup <domain> 8.8.8.8
\`\`\`
` : ""}

---

## 三、端口测试

| 端口 | 状态 |
|------|------|
${result.checks.ports?.open.map(p => `| ${p} | ✅ 开放 |`).join("\n") || ""}
${result.checks.ports?.closed.map(p => `| ${p} | ❌ 关闭 |`).join("\n") || ""}

---

## 四、建议

${result.recommendations.length > 0 ? result.recommendations.map(r => `- ${r}`).join("\n") : "✅ 网络诊断全部通过，无需额外操作"}

---

## 五、快速检查清单

- [ ] ${result.checks.ping?.reachable ? "✅" : "☐"} Ping 连通
- [ ] ${result.checks.ports?.open.length ? "✅" : "☐"} 关键端口开放
- [ ] ☑️ 检查防火墙设置
- [ ] ☑️ 验证目标服务运行状态
`;

  Bun.write(outputFile, content);
  console.log(`\n📄 诊断报告已保存: ${outputFile}`);
}

async function diagnose(target: string, output: string, ports: number[]) {
  console.log("=".repeat(60));
  console.log("Network Troubleshooter - 网络故障自动排查");
  console.log("=".repeat(60));
  console.log(`\n🎯 目标: ${target}`);
  console.log("🔍 正在诊断...\n");

  const isIP = target.match(/^\d+\.\d+\.\d+\.\d+$/);
  const [ping, portResults] = await Promise.all([
    pingHost(target),
    Promise.all(ports.map(async p => ({ port: p, open: await checkPort(target, p) }))),
  ]);

  console.log(`Ping: ${ping.reachable ? "✅ 可达" : "❌ 不可达"} (${ping.latency?.toFixed(2) || 0}ms)`);

  const openPorts = portResults.filter(r => r.open).map(r => r.port.toString());
  const closedPorts = portResults.filter(r => !r.open).map(r => r.port.toString());

  if (openPorts.length > 0) console.log(`开放端口: ${openPorts.join(", ")}`);
  if (closedPorts.length > 0) console.log(`关闭端口: ${closedPorts.join(", ")}`);

  const status = ping.reachable ? "success" : "failed";

  const recommendations: string[] = [];
  if (!ping.reachable) {
    recommendations.push("检查目标 IP 是否正确，确认主机在线");
    recommendations.push("直连环境需配置静态 IP");
  } else {
    recommendations.push("网络连通正常");
  }

  if (openPorts.length > 0) {
    recommendations.push(`服务运行中: ${openPorts.join(", ")}`);
  }

  const result: DiagnosisResult = {
    timestamp: getTimestamp(),
    target,
    status,
    checks: {
      ping: { ...ping },
      ports: { open: openPorts, closed: closedPorts },
    },
    recommendations,
  };

  generateReport(result, output);
}

async function main() {
  const args = process.argv.slice(2);
  let target = "8.8.8.8";
  let output = "network-diagnosis-report.md";
  let ports = "22,80,443".split(",").map(Number);

  for (const arg of args) {
    if (arg.startsWith("--target=")) target = arg.split("=")[1];
    else if (arg.startsWith("--output=")) output = arg.split("=")[1];
    else if (arg.startsWith("--ports=")) ports = arg.split("=")[1].split(",").map(Number);
  }

  await diagnose(target, output, ports);
}

main();
