# 前后端连通性测试指南

## 测试目标
验证前端 Cocos Creator 3D 与后端 Node.js + TSRPC 的 HTTP 和 WebSocket 通信是否正常。

## 前置条件
1. 后端服务已启动（参考后端 README）
2. 数据库已初始化（MongoDB + MySQL）
3. 前端项目已在 Cocos Creator 中打开

## 测试步骤

### 1. 启动后端服务
```bash
cd /workspace/server-backend
docker-compose up -d
npm install
npm run dev
```

### 2. 在 Cocos Creator 中运行前端
1. 打开 Cocos Creator 3.x
2. 打开 client-game 项目
3. 点击"运行"按钮

### 3. 测试 Hello World 通信
1. 在登录界面点击"Hello World 测试"按钮
2. 预期结果：显示"服务器响应：Hello, Cocos Creator 3D!"

### 4. 测试用户注册
1. 点击"切换到注册"按钮
2. 填写用户名、密码（至少 6 位）、邮箱（可选）
3. 点击"注册"按钮
4. 预期结果：显示"注册成功！请登录"

### 5. 测试用户登录
1. 输入刚注册的用户名和密码
2. 点击"登录"按钮
3. 预期结果：
   - 显示"登录成功！"
   - 自动连接 WebSocket
   - 1 秒后跳转到大厅场景

### 6. 测试 Token 存储
1. 登录后刷新浏览器页面
2. 预期结果：自动检测到已登录账户，尝试自动登录

### 7. 测试 WebSocket 心跳
1. 查看浏览器控制台日志
2. 预期结果：每 30 秒输出一次"心跳响应"

## 预期日志输出

### 成功登录的控制台日志
```
[Oops] 框架初始化完成
[Oops] 事件系统初始化完成
[Oops] 资源管理器初始化完成
[Oops] 场景管理器初始化完成
[Oops] UI 管理器初始化完成
[Login] 欢迎使用游戏大厅
[TSRPC] API 调用：user/login
[TSRPC] API 响应成功
[Login] 登录成功！
[TSRPC] WebSocket 连接成功
[TSRPC] 已启动 Token 定时刷新
[Oops] 切换场景：HallScene
```

### WebSocket 心跳日志
```
[TSRPC] 心跳响应：{ timestamp: 1234567890, serverTime: 1234567890 }
```

## 常见问题排查

### 1. 无法连接服务器
- 检查后端服务是否启动
- 检查 `.env` 文件中的服务器地址是否正确
- 检查防火墙设置

### 2. 注册/登录失败
- 检查数据库是否正常运行
- 查看后端日志是否有错误信息
- 确认用户名是否符合要求（长度、特殊字符等）

### 3. WebSocket 连接失败
- 检查 WebSocket 端口（默认 3001）是否开放
- 确认 Nginx 配置是否正确转发 WebSocket 请求

### 4. Token 无法保存
- 检查浏览器是否允许 localStorage
- 清除浏览器缓存后重试

## API 测试命令（可选）

### 使用 curl 测试注册
```bash
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456","email":"test@example.com"}'
```

### 使用 curl 测试登录
```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'
```

### 使用 curl 测试 Hello World
```bash
curl -X POST http://localhost:3000/api/system/hello \
  -H "Content-Type: application/json" \
  -d '{"name":"TestClient"}'
```

## 下一步
连通性测试通过后，继续开发：
1. 完善大厅场景 UI
2. 实现 3D 角色系统
3. 添加昼夜天气变化
4. 实现游戏接入功能
