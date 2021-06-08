import send from '@/config/MailConfig'
import moment from 'moment'
import jsonwebtoken from 'jsonwebtoken'
import config from '@/config'
import { checkCode } from '@/common/Utils'
import User from '@/model/User'

class LoginController {
  constructor() { }

  async login(ctx) {
    // 接收用户的数据
    // 返回token
    const { body } = ctx.request
    console.warn('login', body)
    let sid = body.sid
    let code = body.code
    // 验证图片验证码的时效性、正确性
    let result = await checkCode(sid, code)
    if (result) {
      // 验证用户账号密码是否正确
      let checkUserPasswd = false
      let user = await User.findOne({ username: body.username })
      if (user && user.password === body.password) {
        checkUserPasswd = true
      }
      // mongoDB查库
      if (checkUserPasswd) {
        // 验证通过，返回Token数据
        console.log('Hello login')
        let token = jsonwebtoken.sign({ _id: 'brian' }, config.JWT_SECRET, {
          expiresIn: '1d'
        })
        ctx.body = {
          code: 200,
          token: token
        }
      } else {
        // 用户名 密码验证失败，返回提示
        ctx.body = {
          code: 404,
          msg: '用户名或者密码错误'
        }
      }
    } else {
      // 图片验证码校验失败
      ctx.body = {
        code: 401,
        msg: '图片验证码不正确,请检查！'
      }
    }
  }
}

export default new LoginController()
