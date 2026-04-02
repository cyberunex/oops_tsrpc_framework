import { ApiCall } from "tsrpc";
import { ReqRegister, ResRegister } from "../../../shared/protocols/user/AuthApi";
import { userService } from "../../service/user.service";
import { ErrorCode, getErrorMessage } from "../common/ErrorCode";
import logger from "../../config/logger";

/**
 * 用户注册 API
 */
export default async function (call: ApiCall<ReqRegister, ResRegister>) {
  const { username, email, password, nickname } = call.req;

  // 参数验证
  if (!username || username.length < 3 || username.length > 50) {
    call.error(getErrorMessage(ErrorCode.PARAM_ERROR) + ': 用户名长度应为 3-50 个字符');
    return;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    call.error(getErrorMessage(ErrorCode.PARAM_ERROR) + ': 邮箱格式不正确');
    return;
  }

  if (!password || password.length < 6) {
    call.error(getErrorMessage(ErrorCode.PARAM_ERROR) + ': 密码长度至少为 6 个字符');
    return;
  }

  try {
    // 注册用户
    const result = await userService.register(username, email, password, nickname);

    if (typeof result === 'number') {
      // 返回错误码
      call.error(getErrorMessage(result));
      return;
    }

    // 生成 Token
    const tokens = userService.generateToken({ userId: result.userId, username: result.username });

    // 创建会话
    const ipAddress = call.callerInfo?.ip || '';
    const userAgent = call.callerInfo?.userAgent || '';
    await userService.createSession(result.userId, tokens.token, tokens.refreshToken, ipAddress, userAgent);

    // 记录日志
    await userService.logAction(result.userId, 'register', `User registered from ${ipAddress}`);

    logger.info(`User registered: ${username} (${result.userId})`);

    // 返回成功
    call.succ({
      userId: result.userId,
      username: result.username,
      token: tokens.token,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    logger.error('Register error:', error);
    call.error(getErrorMessage(ErrorCode.UNKNOWN_ERROR));
  }
}
