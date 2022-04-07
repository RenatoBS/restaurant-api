import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { RestaurantsService } from './restaurants.service'
import { Restaurant } from './schemas/restaurant.schema'
import { Model } from 'mongoose'
import { User, UserRoles } from '../auth/schemas/user.schema'
import APIFeatures from '../utils/apiFeatures.utils'
import { BadRequestException, NotFoundException } from '@nestjs/common'

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
  find: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}

describe('RestaurantService', () => {
  let service: RestaurantsService
  let model: Model<Restaurant>
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        {
          provide: getModelToken(Restaurant.name),
          useValue: mockRestaurantService
        }
      ]
    }).compile()
    service = module.get<RestaurantsService>(RestaurantsService)
    model = module.get<Model<Restaurant>>(getModelToken(Restaurant.name))
  })

  it('Should be defined', () => {
    expect(service).toBeDefined()
  })
    ,
    describe('findAll', () => {
      it('should get all restaurants', async () => {
        jest.spyOn(model, 'find').mockImplementationOnce(() => ({
          limit: () => ({
            skip: jest.fn().mockResolvedValue([mockRestaurant])
          })
        } as any))

        const restaurants = await service.findAll({ keyword: 'restaurant' })
        expect(restaurants).toEqual([mockRestaurant])
      })
    })

  describe('create', () => {
    const newRestaurant =
    {
      "name": "Retaurant",
      "description": "This is just a description",
      "email": "ghulam@gamil.com",
      "phoneNo": "9788246116",
      "category": "Fast Food",
      "address": "200 Olympic Dr, Stafford, VS, 22554"
    }
    it('Should create a new restaurant', async () => {
      jest.spyOn(APIFeatures, 'getRestaurantLocation').mockImplementation(() => Promise.resolve(mockRestaurant.location))
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockRestaurant))
      const result = await service.create(newRestaurant as any, mockUser as any)
      expect(result).toEqual(mockRestaurant)
    })
  })

  describe('findById', () => {
    it('should get restaurant by id', async () => {
      jest.spyOn(model, 'findById').mockResolvedValueOnce(mockRestaurant as any)
      const result = await service.findById(mockRestaurant._id)
      expect(result).toEqual(mockRestaurant)
    })
    it('should throw wrong moongose id error', async () => {
      await expect(service.findById('invalid id')).rejects.toThrow(BadRequestException)
    })
    it('should throw restaurant not founf error', async () => {
      const mockError = new NotFoundException('Restaurant not found')
      jest.spyOn(model, 'findById').mockRejectedValue(mockError)
      await expect(service.findById(mockRestaurant._id)).rejects.toThrow(NotFoundException)
    })
  })
  describe('updateById', () => {
    it('should update the restaurant', async () => {
      const restaurant = { ...mockRestaurant, name: "Updated name" }
      const updateRestaurant = { name: "Updated name" }
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(restaurant as any)
      const updatedRestaurant = await service.updateById(restaurant._id, updateRestaurant as any)
      expect(updatedRestaurant.name).toEqual(updateRestaurant.name)
    })
  })
  describe('deleteById', () => {
    it('should delete the restaurant', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValueOnce(mockRestaurant as any)
      const result = await service.deleteById(mockRestaurant._id)
      expect(result).toEqual(mockRestaurant)

    })
  })
  describe('uploadImages', () => {
    it('should upload restaurant images on S3 bucket', async () => {
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
      jest.spyOn(APIFeatures, 'upload').mockResolvedValueOnce(mockImages)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(updatedRestaurant as any)
      const files = [{
        fieldName: 'files',
        originalname: 'image1.jpeg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: "<Buffer ...>",
        size: 19128
      }]
      const result = await service.uploadImages(mockRestaurant._id, files)
      expect(result).toEqual(updatedRestaurant)
    })
  })
  describe('deleteImages', () => {
    it('should delete restaurant images from s3 bucket', async () => {
      const mockImages = [
        {
          "ETag": "123",
          "Location": "https://google.com",
          "key": "restaurant/image1.jpeg",
          "Key": "restaurant/image1.jpeg",
          "Bucket": "restaurant-api-bucker"
        }
      ]
      jest.spyOn(APIFeatures, 'deleteImages').mockResolvedValueOnce(true)
      const result = await service.deleteImages(mockImages)
      expect(result).toBe(true)
    })
  })
})