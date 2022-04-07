import { ForbiddenException } from "@nestjs/common"
import { PassportModule } from "@nestjs/passport"
import { Test, TestingModule } from "@nestjs/testing"
import { UserRoles } from "../auth/schemas/user.schema"
import { RestaurantsController } from "./restaurants.controller"
import { RestaurantsService } from "./restaurants.service"


const mockImages = [
    {
        "ETag": "123",
        "Location": "https://google.com",
        "key": "restaurant/image1.jpeg",
        "Key": "restaurant/image1.jpeg",
        "Bucket": "restaurant-api-bucker"
    }
]
const files = [{
    fieldName: 'files',
    originalname: 'image1.jpeg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: "<Buffer ...>",
    size: 19128
}]

const newRestaurant =
{
    "name": "Retaurant",
    "description": "This is just a description",
    "email": "ghulam@gamil.com",
    "phoneNo": "9788246116",
    "category": "Fast Food",
    "address": "200 Olympic Dr, Stafford, VS, 22554"
}


const mockRestaurant =
{
    "_id": "624c99aff331cc4797e19875",
    "name": "Retaurant Location",
    "description": "This is just a description",
    "email": "ghulam@gamil.com",
    "phoneNo": 9788246116,
    "address": "200 Olympic Dr, Stafford, VS, 22554",
    "category": "Fast Food",
    "images": [],
    "location": {
        "type": "Point",
        "coordinates": [
            -77.376204,
            38.492151
        ],
        "formattedAddress": "200 Olympic Dr, Stafford, VA 22554-7763, US",
        "city": "Stafford",
        "state": "VA",
        "zipcode": "22554-7763",
        "country": "US"
    },
    "menu": [],
    "user": "624c999ef331cc4797e19871",
    "createdAt": "2022-04-05T19:34:07.751Z",
    "updatedAt": "2022-04-05T20:42:36.379Z",
}

const mockUser =
{
    "_id": "624c999ef331cc4797e19871",
    "email": "renato@nail.com",
    "password": "12345678",
    "role": UserRoles.USER
}

const mockRestaurantService = {
    findAll: jest.fn().mockResolvedValueOnce([mockRestaurant]),
    create: jest.fn(),
    findById: jest.fn().mockResolvedValueOnce(mockRestaurant),
    updateById: jest.fn(),
    deleteImages: jest.fn().mockResolvedValueOnce(true),
    deleteById: jest.fn().mockResolvedValueOnce({ deleted: true }),
    uploadImages: jest.fn()
}

describe('RestaurantController', () => {

    let controller: RestaurantsController
    let service: RestaurantsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
            controllers: [RestaurantsController],
            providers: [{
                provide: RestaurantsService,
                useValue: mockRestaurantService
            }]
        }).compile();
        controller = module.get<RestaurantsController>(RestaurantsController)
        service = module.get<RestaurantsService>(RestaurantsService)
    })
    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('getAllRestaurants', () => {
        it('should get all restaurants', async () => {
            const result = await controller.getAllRestaurants({ keyword: ' restaurant' })
            expect(service.findAll).toHaveBeenCalled()
            expect(result).toEqual([mockRestaurant])
        })
    })
    describe('createRestaurant', () => {
        it('should create a new restaurants', async () => {
            const newRestaurant =
            {
                "name": "Retaurant",
                "description": "This is just a description",
                "email": "ghulam@gamil.com",
                "phoneNo": "9788246116",
                "category": "Fast Food",
                "address": "200 Olympic Dr, Stafford, VS, 22554"
            }
            mockRestaurantService.create = jest.fn().mockResolvedValueOnce(mockRestaurant)
            const result = await controller.createRestaurant(
                newRestaurant as any,
                mockUser as any
            )
            expect(service.create).toHaveBeenCalled()
            expect(result).toEqual(mockRestaurant)
        })
    })
    describe('getRestaurant', () => {
        it('should return restaurant by id', async () => {
            const result = await controller.getRestaurant(mockRestaurant._id)
            expect(service.findById).toHaveBeenCalled()
            expect(result).toEqual(mockRestaurant)
        })
    })
    describe('updateRestaurant', () => {
        const restaurant = { ...mockRestaurant, name: "Updated name" }
        const updatedRestaurant = { name: "Updated name" }
        it('should update restaurant by id', async () => {
            mockRestaurantService.findById = jest.fn().mockResolvedValueOnce(mockRestaurant)
            mockRestaurantService.updateById = jest.fn().mockResolvedValueOnce(restaurant)
            const result = await controller.updateRestaurant(restaurant._id, updatedRestaurant as any, mockUser as any)
            expect(service.updateById).toHaveBeenCalled()
            expect(result.name).toEqual(updatedRestaurant.name)
        })
        it('should throw forbbiden error', async () => {
            mockRestaurantService.findById = jest.fn().mockResolvedValueOnce(restaurant)
            const user = { ...mockUser, _id: '624c99aff331cc4797e19875' }
            await expect(controller.updateRestaurant(
                restaurant._id,
                updatedRestaurant as any,
                user as any
            )).rejects.toThrow(ForbiddenException)
        })
    })
    describe('deleteRestaurant', () => {
        it('should delete restaurant by id', async () => {
            mockRestaurantService.findById = jest.fn().mockResolvedValueOnce(mockRestaurant)
            const result = await controller.deleteRestaurant(mockRestaurant._id, mockUser as any)
            expect(service.deleteById).toHaveBeenCalled()
            expect(result).toEqual({ deleted: true })
        })
        it('should not delete restaurant because images are not deleted', async () => {
            mockRestaurantService.findById = jest.fn().mockResolvedValueOnce(mockRestaurant)
            mockRestaurantService.deleteImages = jest.fn().mockResolvedValueOnce(false)
            const result = await controller.deleteRestaurant(mockRestaurant._id, mockUser as any)
            expect(result).toEqual({ deleted: false })
        })
        it('should throw forbbiden error', async () => {
            mockRestaurantService.findById = jest.fn().mockResolvedValueOnce(mockRestaurant)
            const user = { ...mockUser, _id: '624c99aff331cc4797e19875' }
            await expect(controller.deleteRestaurant(
                mockRestaurant._id,
                user as any
            )).rejects.toThrow(ForbiddenException)
        })
    })
    describe('updateFiles', () => {
        it('should update restaurant by id', async () => {
            const mockImages = [
                {
                    "ETag": "123",
                    "Location": "https://google.com",
                    "key": "restaurant/image1.jpeg",
                    "Key": "restaurant/image1.jpeg",
                    "Bucket": "restaurant-api-bucker"
                }
            ]
            const updatedRestaurant = { ...mockRestaurant, images: mockImages }
            const files = [{
                fieldName: 'files',
                originalname: 'image1.jpeg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                buffer: "<Buffer ...>",
                size: 19128
            }]

            mockRestaurantService.uploadImages = jest.fn().mockResolvedValueOnce(updatedRestaurant)
            const result = await controller.uploadFile(mockRestaurant._id, files as any)
            expect(service.uploadImages).toHaveBeenCalled()
            expect(result).toEqual(updatedRestaurant)

        })
    })
})