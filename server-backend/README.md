# 游戏大厅后端服务

基于 Node.js + TSRPC 的游戏大厅后端服务，支持 HTTP API 和 WebSocket 实时通信。

## 技术栈
- **运行时**: Node.js 18+
- **框架**: Express.js
- **RPC**: TSRPC
- **数据库**: MongoDB (用户数据), MySQL (事务数据)
- **缓存**: Redis
- **认证**: JWT

## 目录结构
```
server-backend/
├── src/
│   ├── api/           # API 实现
│   ├── websocket/     # WebSocket 处理
│   ├── services/      # 业务逻辑层
│   ├── models/        # 数据模型
│   ├── middleware/    # 中间件
│   ├── config/        # 配置文件
│   └── utils/         # 工具函数
├── proto/             # 协议定义
├── logs/              # 日志文件
├── .env               # 环境变量
├── package.json       # 依赖配置
└── tsconfig.json      # TypeScript 配置
```

## 快速开始

### 1. 启动 Docker 服务
```bash
docker-compose up -d
```

### 2. 安装依赖
```bash
npm install
```

### 3. 初始化数据库
```bash
# MySQL 初始化脚本在 docker/mysql/init.sql
# MongoDB 会自动创建集合
```

### 4. 启动开发服务器
```bash
npm run dev
```

### 5. 构建生产版本
```bash
npm run build
npm start
```

## API 接口

### 公开接口（无需认证）
- `POST /api/system/hello` - Hello World 测试
- `POST /api/user/register` - 用户注册
- `POST /api/user/login` - 用户登录

### 需要认证的接口
- `POST /api/user/info` - 获取用户信息
- `POST /api/user/refreshToken` - 刷新 Token
- `POST /api/user/logout` - 用户登出

## WebSocket 消息

- `heartbeat` - 心跳保活
- `message/chat` - 聊天消息

## 测试示例

### 使用 curl 测试 Hello World
```bash
curl -X POST http://localhost:3000/api/system/hello \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser"}'
```

### 测试用户注册
```bash
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456","email":"test@example.com"}'
```

### 测试用户登录
```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | HTTP 服务端口 | 3000 |
| WS_PORT | WebSocket 端口 | 3001 |
| JWT_SECRET | JWT 密钥 | - |
| MONGODB_URI | MongoDB 连接字符串 | mongodb://localhost:27017/game-hall |
| MYSQL_HOST | MySQL 主机 | localhost |
| REDIS_HOST | Redis 主机 | localhost |

## 下一步开发
1. 完善游戏接入 SDK
2. 实现好友和群组系统
3. 添加积分金币交易
4. 实现排行榜功能
5. 集成运营管理后台
