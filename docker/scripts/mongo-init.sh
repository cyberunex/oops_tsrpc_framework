#!/bin/bash
# MongoDB 初始化脚本

echo "Waiting for MongoDB to start..."
sleep 5

echo "Initializing MongoDB replica set..."
mongosh --host localhost --port 27017 -u admin -p 'GamePlatform2024!' --authenticationDatabase admin <<EOF
// 配置副本集
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
});

// 等待副本集初始化
sleep 5000;

// 创建游戏数据库
use game_platform;

// 创建集合
db.createCollection("game_resources");
db.createCollection("user_sessions");
db.createCollection("game_logs");
db.createCollection("chat_messages");
db.createCollection("leaderboards");
db.createCollection("analytics_events");

// 创建索引
db.game_resources.createIndex({ "type": 1, "category": 1 });
db.user_sessions.createIndex({ "userId": 1, "lastActive": -1 }, { expireAfterSeconds: 86400 });
db.game_logs.createIndex({ "timestamp": -1, "level": 1 });
db.chat_messages.createIndex({ "roomId": 1, "timestamp": -1 });
db.leaderboards.createIndex({ "gameId": 1, "score": -1 });
db.analytics_events.createIndex({ "eventType": 1, "timestamp": -1 });

print("MongoDB initialization completed successfully!");
EOF

echo "MongoDB initialization finished."
