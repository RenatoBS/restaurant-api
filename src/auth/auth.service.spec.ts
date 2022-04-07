import { getModelToken } from "@nestjs/mongoose"
import { Test, TestingModule } from "@nestjs/testing"
import { AuthService } from "./auth.service"
import { User, UserRoles } from "./schemas/user.schema"
import { Model } from 'mongoose'
import { JwtModule } from "@nestjs/jwt"
import * as bcrypt from 'bcryptjs'
import APIFeatures from "../utils/apiFeatures.utils"
import { ConflictException, UnauthorizedException } from "@nestjs/common"

const mockAuthService = {
    create: jest.fn(),
    findOne: jest.fn(),

}

const mockUser =
{
    "_id": "624c999ef331cc4797e19871",
    "email": "renato@nail.com",
    "role": UserRoles.USER,
    "password": "hashedPass",
    "name": "Renato"
}

const token = 'jwtToken'

describe('AuthService', () => {
    let service: AuthService
    let model: Model<User>
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                JwtModule.register({
                    secret: '!S3cr3tK3y!',
                    signOptions: { expiresIn: '1d' }
                })],
            providers: [
                AuthService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockAuthService
                }
            ]
        }).compile()

        service = module.get<AuthService>(AuthService)
        model = module.get<Model<User>>(getModelToken(User.name))
    })
    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('singUp', () => {
        it('should register a new user', async () => {
            jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('testHash')
            jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockUser))
            jest.spyOn(APIFeatures, 'assignJwtToken').mockResolvedValueOnce(token)
            const result = await service.signUp({
                "email": "renato@nail.com",
                "password": "12345678",
                "name": "Renato"
            })
            expect(bcrypt.hash).toHaveBeenCalled()
            expect(result.token).toEqual(token)
        })
        it('should throw duplicate email entered', async () => {
            jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.reject({ code: 11000 }))
            const signUpDto = {
                "email": "renato@nail.com",
                "password": "12345678",
                "name": "Renato"
            }
            await expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException)
        })
    })
    describe('login', () => {
        const loginDto = {
            email: 'ghulam1@gmail.com',
            password: '12345678',
        };

        it('should login user and return the token', async () => {
            jest.spyOn(model, 'findOne').mockImplementationOnce(
                () => ({
                    select: jest.fn().mockResolvedValueOnce(mockUser),
                } as any),
            );
            jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
            jest.spyOn(APIFeatures, 'assignJwtToken').mockResolvedValueOnce(token);
            const result = await service.login(loginDto);
            expect(result.token).toEqual(token);
        });

        it('should throw invalid email error', async () => {
            jest.spyOn(model, 'findOne').mockImplementationOnce(
                () => ({
                    select: jest.fn().mockResolvedValueOnce(null),
                } as any),
            );
            expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw invalid password error', async () => {
            jest.spyOn(model, 'findOne').mockImplementationOnce(
                () => ({
                    select: jest.fn().mockResolvedValueOnce(mockUser),
                } as any),
            );
            jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);
            expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });
});