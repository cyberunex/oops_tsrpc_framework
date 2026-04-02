import { ApiCall } from "tsrpc";
import { ReqLogout, ResLogout } from "../../../shared/protocols/user/AuthApi";
import { userService } from "../../service/user.service";
import logger from "../../config/logger";

/**
 * 用户登出 API
 */
export default async function (call: ApiCall<ReqLogout, ResLogout>) {
  try {
    // 从请求头获取 token
    const token = call.callerInfo?.token || '';

    if (token) {
      // 删除会话
      await userService.deleteSession(token);
      logger.info(`User logged out with token: ${token.substring(0, 20)}...`);
    }

    call.succ({ success: true });
  } catch (error) {
    logger.error('Logout error:', error);
    call.succ({ success: false });
  }
}
