import { ApiCall } from "tsrpc";
import { ReqLogin, ResLogin } from "../../../shared/protocols/user/AuthApi";
import { userService } from "../../service/user.service";
import { ErrorCode, getErrorMessage } from "../common/ErrorCode";
import logger from "../../config/logger";

/**
 * 用户登录 API
 */
export default async function (call: ApiCall<ReqLogin, ResLogin>) {
  const { username, password } = call.req;

  // 参数验证
  if (!username || !password) {
    call.error(getErrorMessage(ErrorCode.PARAM_ERROR) + ': 用户名和密码不能为空');
    return;
  }

  try {
    // 获取客户端信息
    const ipAddress = call.callerInfo?.ip || '';
    const userAgent = call.callerInfo?.userAgent || '';

    // 登录用户
    const result = await userService.login(username, password, ipAddress, userAgent);

    if (typeof result === 'number') {
      // 返回错误码
      call.error(getErrorMessage(result));
      return;
    }

    logger.info(`User logged in: ${username} (${result.user.userId})`);

    // 返回成功
    call.succ({
      userId: result.user.userId,
      username: result.user.username,
      nickname: result.user.nickname,
      avatarUrl: result.user.avatarUrl || '',
      level: result.user.level,
      points: result.user.points,
      goldCoins: result.user.goldCoins,
      token: result.tokens.token,
      refreshToken: result.tokens.refreshToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    call.error(getErrorMessage(ErrorCode.UNKNOWN_ERROR));
  }
}
