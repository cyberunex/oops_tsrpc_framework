/**
 * 全局错误码定义
 */
export enum ErrorCode {
  // 通用错误 (1-999)
  SUCCESS = 0,
  UNKNOWN_ERROR = 1,
  PARAM_ERROR = 2,
  NOT_FOUND = 3,
  PERMISSION_DENIED = 4,
  RATE_LIMIT_EXCEEDED = 5,

  // 认证错误 (1000-1999)
  TOKEN_INVALID = 1000,
  TOKEN_EXPIRED = 1001,
  TOKEN_MISSING = 1002,
  LOGIN_FAILED = 1003,
  PASSWORD_ERROR = 1004,
  USER_NOT_FOUND = 1005,
  USER_DISABLED = 1006,
  USER_ALREADY_EXISTS = 1007,
  EMAIL_ALREADY_EXISTS = 1008,
  USERNAME_ALREADY_EXISTS = 1009,

  // 用户错误 (2000-2999)
  USER_LEVEL_INSUFFICIENT = 2000,
  USER_POINTS_INSUFFICIENT = 2001,
  USER_GOLD_INSUFFICIENT = 2002,

  // 好友错误 (3000-3999)
  FRIEND_REQUEST_EXISTS = 3000,
  FRIEND_ALREADY = 3001,
  FRIEND_NOT_FOUND = 3002,
  FRIEND_BLOCKED = 3003,

  // 群组错误 (4000-4999)
  GROUP_NOT_FOUND = 4000,
  GROUP_FULL = 4001,
  GROUP_PERMISSION_DENIED = 4002,
  GROUP_ALREADY_JOINED = 4003,

  // 物品错误 (5000-5999)
  ITEM_NOT_FOUND = 5000,
  ITEM_INSUFFICIENT = 5001,
  ITEM_NOT_TRADEABLE = 5002,
  INVENTORY_FULL = 5003,

  // 游戏错误 (6000-6999)
  GAME_NOT_FOUND = 6000,
  GAME_NOT_STARTED = 6001,
  GAME_ALREADY_ENDED = 6002,
  GAME_INVALID_RESULT = 6003,

  // 数据库错误 (7000-7999)
  DB_ERROR = 7000,
  DB_CONNECTION_FAILED = 7001,
  DB_QUERY_FAILED = 7002,

  // 缓存错误 (8000-8999)
  CACHE_ERROR = 8000,
  CACHE_CONNECTION_FAILED = 8001,
}

/**
 * 错误码对应的消息
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.SUCCESS]: '成功',
  [ErrorCode.UNKNOWN_ERROR]: '未知错误',
  [ErrorCode.PARAM_ERROR]: '参数错误',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.PERMISSION_DENIED]: '权限不足',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: '请求频率超限',

  [ErrorCode.TOKEN_INVALID]: 'Token 无效',
  [ErrorCode.TOKEN_EXPIRED]: 'Token 已过期',
  [ErrorCode.TOKEN_MISSING]: '缺少 Token',
  [ErrorCode.LOGIN_FAILED]: '登录失败',
  [ErrorCode.PASSWORD_ERROR]: '密码错误',
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.USER_DISABLED]: '用户已被禁用',
  [ErrorCode.USER_ALREADY_EXISTS]: '用户已存在',
  [ErrorCode.EMAIL_ALREADY_EXISTS]: '邮箱已被注册',
  [ErrorCode.USERNAME_ALREADY_EXISTS]: '用户名已被注册',

  [ErrorCode.USER_LEVEL_INSUFFICIENT]: '用户等级不足',
  [ErrorCode.USER_POINTS_INSUFFICIENT]: '积分不足',
  [ErrorCode.USER_GOLD_INSUFFICIENT]: '金币不足',

  [ErrorCode.FRIEND_REQUEST_EXISTS]: '好友请求已存在',
  [ErrorCode.FRIEND_ALREADY]: '已是好友',
  [ErrorCode.FRIEND_NOT_FOUND]: '好友不存在',
  [ErrorCode.FRIEND_BLOCKED]: '已被屏蔽',

  [ErrorCode.GROUP_NOT_FOUND]: '群组不存在',
  [ErrorCode.GROUP_FULL]: '群组已满',
  [ErrorCode.GROUP_PERMISSION_DENIED]: '群组权限不足',
  [ErrorCode.GROUP_ALREADY_JOINED]: '已加入该群组',

  [ErrorCode.ITEM_NOT_FOUND]: '物品不存在',
  [ErrorCode.ITEM_INSUFFICIENT]: '物品数量不足',
  [ErrorCode.ITEM_NOT_TRADEABLE]: '物品不可交易',
  [ErrorCode.INVENTORY_FULL]: '背包已满',

  [ErrorCode.GAME_NOT_FOUND]: '游戏不存在',
  [ErrorCode.GAME_NOT_STARTED]: '游戏未开始',
  [ErrorCode.GAME_ALREADY_ENDED]: '游戏已结束',
  [ErrorCode.GAME_INVALID_RESULT]: '无效的游戏结果',

  [ErrorCode.DB_ERROR]: '数据库错误',
  [ErrorCode.DB_CONNECTION_FAILED]: '数据库连接失败',
  [ErrorCode.DB_QUERY_FAILED]: '数据库查询失败',

  [ErrorCode.CACHE_ERROR]: '缓存错误',
  [ErrorCode.CACHE_CONNECTION_FAILED]: '缓存连接失败',
};

/**
 * 获取错误消息
 */
export function getErrorMessage(code: ErrorCode): string {
  return ErrorMessages[code] || '未知错误';
}
