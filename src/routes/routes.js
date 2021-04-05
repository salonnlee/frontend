import combineRoutes from 'koa-combine-routers'
import userRoutes from './userRouter'

const router = combineRoutes(
  userRoutes,
)

export default router