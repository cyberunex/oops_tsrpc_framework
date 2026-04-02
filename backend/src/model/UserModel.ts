import mongoose from 'mongoose';

/**
 * 用户会话 Schema - 存储在 MongoDB 中
 */
const UserSessionSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // TTL 索引，自动过期
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 创建复合索引
UserSessionSchema.index({ userId: 1, createdAt: -1 });

export const UserSession = mongoose.model('UserSession', UserSessionSchema);

/**
 * 游戏日志 Schema
 */
const GameLogSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  level: {
    type: String,
    enum: ['error', 'warn', 'info', 'debug'],
    default: 'info',
    index: true,
  },
  action: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// 创建复合索引用于查询
GameLogSchema.index({ timestamp: -1, level: 1 });
GameLogSchema.index({ userId: 1, timestamp: -1 });

export const GameLog = mongoose.model('GameLog', GameLogSchema);

/**
 * 聊天消息 Schema
 */
const ChatMessageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  roomType: {
    type: String,
    enum: ['system', 'group', 'friend', 'global'],
    required: true,
  },
  senderId: {
    type: Number,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'voice', 'video', 'system'],
    default: 'text',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

// 创建复合索引
ChatMessageSchema.index({ roomId: 1, timestamp: -1 });
ChatMessageSchema.index({ senderId: 1, timestamp: -1 });

export const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

/**
 * 排行榜 Schema
 */
const LeaderboardSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: Number,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  rank: {
    type: Number,
    default: 0,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// 创建复合索引用于排序
LeaderboardSchema.index({ gameId: 1, score: -1 });
LeaderboardSchema.index({ userId: 1, gameId: 1 });

export const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);

/**
 * 分析事件 Schema
 */
const AnalyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: Number,
    index: true,
  },
  sessionId: {
    type: String,
    index: true,
  },
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  platform: {
    type: String,
    default: 'web',
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// 创建复合索引
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
