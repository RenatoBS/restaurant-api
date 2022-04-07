import { getModelToken } from "@nestjs/mongoose"
import { Test, TestingModule } from "@nestjs/testing"
import { JwtStrategy } from "./jwt.strategy"
import { User, UserRoles } from "./schemas/user.schema"
import { Model } from 'mongoose'
import { UnauthorizedException } from "@nestjs/common"

const mockUser =
{
  "_id": "624c999ef331cc4797e19871",
  "email": "renato@nail.com",
  "role": UserRoles.USER,
  "password": "hashedPass",
  "name": "Renato"
}

describe('JWTStrategy', () => {
  let jwtStrategy: JwtStrategy
  let model: Model<User>
  beforeEach(async () => {
    process.env.JWT_SECRET = '!S3cr3tK3y!'
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn()
          }
        }
      ]
    }).compile()

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy)
    model = module.get<Model<User>>(getModelToken(User.name))
  })
  afterEach(() => {
    delete process.env.JWT_SECRET
  })
  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined()
  })
  describe('validate', () => {
    it('should validate and return the user', async () => {
      jest.spyOn(model, 'findById').mockResolvedValueOnce(mockUser as any)
      const result = await jwtStrategy.validate({ id: mockUser._id })
      expect(model.findById).toHaveBeenCalledWith(mockUser._id)
      expect(result).toEqual(mockUser)
    })
    it('should throw Unauthorized Exception', async () => {
      jest.spyOn(model, 'findById').mockResolvedValueOnce(null)
      const result = jwtStrategy.validate({ id: mockUser._id })
      expect(result).rejects.toThrow(UnauthorizedException)
    })
  })
})