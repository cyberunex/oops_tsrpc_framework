// 用户注册协议
export interface ReqRegister {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

export interface ResRegister {
  userId: number;
  username: string;
  token: string;
  refreshToken: string;
}

// 用户登录协议
export interface ReqLogin {
  username: string;
  password: string;
}

export interface ResLogin {
  userId: number;
  username: string;
  nickname: string;
  avatarUrl: string;
  level: number;
  points: number;
  goldCoins: number;
  token: string;
  refreshToken: string;
}

// Token 刷新协议
export interface ReqRefreshToken {
  refreshToken: string;
}

export interface ResRefreshToken {
  token: string;
  refreshToken: string;
}

// 获取用户信息协议
export interface ReqGetUserInfo {
  userId?: number;
}

export interface ResGetUserInfo {
  userId: number;
  username: string;
  nickname: string;
  avatarUrl: string;
  gender: number;
  level: number;
  experience: number;
  points: number;
  goldCoins: number;
  status: number;
  lastLoginTime?: Date;
}

// 更新用户资料协议
export interface ReqUpdateProfile {
  nickname?: string;
  avatarUrl?: string;
  gender?: number;
}

export interface ResUpdateProfile {
  success: boolean;
}

// 修改密码协议
export interface ReqChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface ResChangePassword {
  success: boolean;
}

// 登出协议
export interface ReqLogout {
  // 无需参数
}

export interface ResLogout {
  success: boolean;
}
