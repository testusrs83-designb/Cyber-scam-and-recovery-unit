import { Test } from '@nestjs/testing'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/prisma/prisma.service'

describe('DB smoke test', () => {
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    prisma = moduleRef.get(PrismaService)
  })

  it('connects to the database', async () => {
    const res = await prisma.$queryRaw`SELECT 1 as result`
    expect(res).toBeDefined()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })
})
