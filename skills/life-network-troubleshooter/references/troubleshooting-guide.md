# Network Troubleshooting Guide

网络故障排查参考手册。

## 常见错误代码

| 代码 | 含义 | 排查步骤 |
|------|------|----------|
| 0x204 | 网络不可达 | 1. Ping 测试 2. 静态 IP 3. 防火墙 |
| 0x205 | 连接超时 | Ping → 端口检查 → RDP 设置 |
| Host is down | 主机离线 | 检查网线、网卡、IP 配置 |

## 场景 1: Windows 远程桌面网线直连

### 症状
```
无法连接到远程 PC。请确保该 PC 已打开并连接到网络...
错误代码：0x204
```

### 排查流程

#### Step 1: Ping 测试
```bash
# Mac 端
ping 172.25.25.1

# 结果分析
# - Request timeout: IP 不通
# - Host is down: 无路由或主机离线
# - 正常响应: 网络层连通
```

#### Step 2: 静态 IP 配置
Windows (管理员 PowerShell):
```powershell
# 1. 查找网卡索引
Get-NetAdapter | Where-Object {$_.Status -eq "Up"}

# 2. 删除旧配置
Remove-NetIPAddress -InterfaceIndex 12 -Confirm:$false

# 3. 配置静态 IP
New-NetIPAddress -InterfaceIndex 12 -IPAddress 172.25.25.1 -PrefixLength 24
```

Mac:
```bash
# 系统设置 -> 网络 -> 以太网 -> 手动
IP: 172.25.25.2
子网掩码: 255.255.255.0
路由器: 空
```

#### Step 3: 防火墙配置
```powershell
# 检查网络类型
Get-NetConnectionProfile

# 改为专用网络
Set-NetConnectionProfile -InterfaceIndex 12 -NetworkCategory Private
```

#### Step 4: RDP 验证
```bash
# Mac 端检查端口
nc -z -v 172.25.25.1 3389
```

## 场景 2: APIPA 地址问题

### 症状
获取到 169.254.x.x 地址，Ping 不通

### 解决方案
```powershell
# 强制使用静态 IP
New-NetIPAddress -InterfaceIndex <idx> -IPAddress 172.25.25.1 -PrefixLength 24
```

推荐网段：
- 172.25.25.x (冷门，避免冲突)
- 10.10.10.x (A 类私有)
- 192.168.99.x (避免与常见网段冲突)

## 场景 3: RDP 连接但黑屏

### 解决方案
```bash
# RDP 客户端设置
1. 关闭硬件加速
2. 降低分辨率
3. 调整颜色深度
```

## 快速检查清单

- [ ] 网线连接正常
- [ ] 双端静态 IP 同一网段
- [ ] Ping 连通
- [ ] Windows 网络类型为 Private
- [ ] RDP 端口 3389 开放
- [ ] 远程桌面功能已启用

## 常用命令速查

| 场景 | 命令 |
|------|------|
| Ping 测试 | `ping <ip>` |
| 端口检查 | `nc -z -v <ip> 3389` |
| 网卡列表 | `Get-NetAdapter` |
| IP 配置 | `Get-NetIPAddress` |
| 网络类型 | `Get-NetConnectionProfile` |
| RDP 状态 | `Get-Service TermService` |
