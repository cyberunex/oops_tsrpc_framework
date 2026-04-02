import { ApiCall } from "tsrpc";
import { ReqGetUserInfo, ResGetUserInfo } from "../../../shared/protocols/user/AuthApi";
import { userService } from "../../service/user.service";
import { ErrorCode, getErrorMessage } from "../common/ErrorCode";
import logger from "../../config/logger";

/**
 * 获取用户信息 API
 */
export default async function (call: ApiCall<ReqGetUserInfo, ResGetUserInfo>) {
  try {
    // 如果未指定 userId，使用当前登录用户
    let userId = call.req.userId;

    if (!userId) {
      // 从 token 中获取用户 ID（需要通过中间件注入）
      const token = call.callerInfo?.token || '';
      if (!token) {
        call.error(getErrorMessage(ErrorCode.TOKEN_MISSING));
        return;
      }

      const payload = userService.verifyToken(token);
      if (!payload) {
        call.error(getErrorMessage(ErrorCode.TOKEN_INVALID));
        return;
      }

      userId = payload.userId;
    }

    // 获取用户信息
    const userInfo = await userService.getUserInfo(userId);

    if (typeof userInfo === 'number') {
      call.error(getErrorMessage(userInfo));
      return;
    }

    call.succ(userInfo);
  } catch (error) {
    logger.error('GetUserInfo error:', error);
    call.error(getErrorMessage(ErrorCode.UNKNOWN_ERROR));
  }
}
