import { getDbConnection } from '../../utils'
import { insertBotUser, selectBotPremiumUser } from '../../utils/mysql-queries'
import { botUserPremiums, botUsers } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { premiumDelete, premiumPut } from '../../services/servers/web/routers/admin/methods'

const USER_ID = 900001
const USERNAME = '@premium_test_user'

const mockRes = () => {
  const res = {
    locals: {} as { logAction?: string },
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code
      return res
    },
    send(body?: unknown) {
      res.body = body
      return res
    },
  }
  return res
}

describe('Admin premium by username', () => {
  beforeEach(async () => {
    const db = await getDbConnection()
    await db.delete(botUserPremiums).where(eq(botUserPremiums.userId, USER_ID))
    await db.delete(botUsers).where(eq(botUsers.id, USER_ID))
    await insertBotUser(db, {
      id: USER_ID,
      user: USERNAME,
      timestamp: Math.floor(Date.now() / 1000),
    })
    await db.close()
  })

  afterAll(async () => {
    const db = await getDbConnection()
    await db.delete(botUserPremiums).where(eq(botUserPremiums.userId, USER_ID))
    await db.delete(botUsers).where(eq(botUsers.id, USER_ID))
    await db.close()
  })

  test('sets premium until the given date', async () => {
    const res = mockRes()
    await premiumPut(
      { body: { username: USERNAME, untilDate: '2027-01-15' } } as never,
      res as never,
      jest.fn(),
    )
    expect(res.statusCode).toBe(200)

    const db = await getDbConnection()
    const [premium] = await selectBotPremiumUser(db, USER_ID)
    await db.close()
    expect(premium).toBeDefined()
    expect(premium.untilTimestamp).toBe(Number(new Date('2027-01-15')) / 1000)
  })

  test('accepts a username without @', async () => {
    const res = mockRes()
    await premiumPut(
      { body: { username: 'premium_test_user', untilDate: '2027-06-01' } } as never,
      res as never,
      jest.fn(),
    )
    expect(res.statusCode).toBe(200)

    const db = await getDbConnection()
    const [premium] = await selectBotPremiumUser(db, USER_ID)
    await db.close()
    expect(premium).toBeDefined()
  })

  test('returns 404 when the user is unknown', async () => {
    const res = mockRes()
    await premiumPut(
      { body: { username: '@missing_user', untilDate: '2027-01-15' } } as never,
      res as never,
      jest.fn(),
    )
    expect(res.statusCode).toBe(404)
  })

  test('unsets premium', async () => {
    const setRes = mockRes()
    await premiumPut(
      { body: { username: USERNAME, untilDate: '2027-01-15' } } as never,
      setRes as never,
      jest.fn(),
    )
    expect(setRes.statusCode).toBe(200)

    const unsetRes = mockRes()
    await premiumDelete({ body: { username: USERNAME } } as never, unsetRes as never, jest.fn())
    expect(unsetRes.statusCode).toBe(200)

    const db = await getDbConnection()
    const premiums = await selectBotPremiumUser(db, USER_ID)
    await db.close()
    expect(premiums).toHaveLength(0)
  })
})
