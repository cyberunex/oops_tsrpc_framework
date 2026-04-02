# 游戏大厅客户端 (Cocos Creator 3D)

## 项目简介
基于 Cocos Creator 3D 和 Oops Framework 的游戏大厅客户端，集成 TSRPC 通信框架，支持 HTTP 和 WebSocket 实时通信。

## 技术栈
- **游戏引擎**: Cocos Creator 3.x
- **框架**: Oops Framework
- **通信**: TSRPC Client
- **语言**: TypeScript

## 目录结构
```
client-game/
├── assets/
│   ├── scripts/
│   │   ├── framework/      # Oops Framework 集成
│   │   ├── network/        # TSRPC 通信封装
│   │   ├── manager/        # 管理器模块
│   │   └── ui/             # UI 控制器
│   ├── scenes/             # 场景文件
│   ├── ui/                 # UI 预制体
│   └── resources/          # 资源文件
├── settings/               # 项目设置
├── package.json            # 依赖配置
├── tsconfig.json           # TypeScript 配置
└── project.json            # Cocos 项目配置
```

## 功能模块

### 1. Oops Framework 集成
- 资源管理
- 场景管理
- UI 管理
- 事件系统

### 2. TSRPC 通信
- HTTP API 调用
- WebSocket 实时通信
- JWT Token 管理
- 心跳保活

### 3. 用户系统
- 注册/登录界面
- JWT 鉴权
- Token 自动刷新
- 本地存储管理

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
编辑 `.env` 文件，设置服务器地址：
```
SERVER_URL=http://localhost:3000
WS_URL=ws://localhost:3001
```

### 3. 在 Cocos Creator 中打开项目
1. 启动 Cocos Creator 3.x
2. 打开本项目目录
3. 等待资源导入完成

### 4. 运行测试
1. 确保后端服务已启动
2. 在 Cocos Creator 中点击"运行"按钮
3. 测试注册、登录功能
4. 测试 Hello World 通信

## 主要脚本说明

### TsrpcClient.ts
TSRPC 客户端封装，提供：
- `callApi()`: 调用 HTTP API
- `connectWebSocket()`: 连接 WebSocket
- `sendWsMessage()`: 发送 WebSocket 消息
- Token 管理和自动刷新

### LoginUI.ts
登录注册 UI 控制器，处理：
- 用户输入验证
- 注册/登录请求
- 通信测试
- 场景跳转

### StorageManager.ts
本地存储管理，提供：
- 用户设置保存
- 游戏进度保存
- 积分金币存储

### AutoLoginManager.ts
自动登录管理：
- Token 有效性检查
- 定时刷新 Token
- 自动登录流程

## 通信协议

### API 接口
- `user/register`: 用户注册
- `user/login`: 用户登录
- `user/info`: 获取用户信息
- `user/refreshToken`: 刷新 Token
- `system/hello`: Hello World 测试

### WebSocket 消息
- `heartbeat`: 心跳保活
- `message/chat`: 发送聊天消息
- `message/receive`: 接收聊天消息

## 注意事项
1. 首次打开项目需要安装 npm 依赖
2. 确保后端服务已启动并配置正确的地址
3. Token 过期时间为 30 分钟，会自动刷新
4. 本地存储使用浏览器 localStorage

## 下一步开发
1. 完善大厅场景
2. 实现 3D 角色系统
3. 添加好友和群组功能
4. 实现游戏接入 SDK
