import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Restaurant } from './schemas/restaurant.schema';
import * as mongoose from 'mongoose'
import { Query } from 'express-serve-static-core';
import APIFeatures from 'src/utils/apiFeatures.utils';

@Injectable()
export class RestaurantsService {

    constructor(
        @InjectModel(Restaurant.name) private restaurantModel: mongoose.Model<Restaurant>
    ) { }

    async findAll(query: Query): Promise<Restaurant[]> {
        const resPerPage = 2
        const currentPage = Number(query.page) || 1
        const skip = resPerPage * (currentPage - 1)
        const keyword = query.keyword ? {
            name: {
                $regex: query.keyword,
                $options: 'i'
            }
        } : {}
        const restaurants = await this.restaurantModel
            .find({ ...keyword })
            .limit(resPerPage)
            .skip(skip)

        return restaurants
    }

    async findById(id: string): Promise<Restaurant> {
        const isValidId = mongoose.isValidObjectId(id)
        if (!isValidId) throw new BadRequestException('Wrong moongose id error, please provide correct id.')
        const restaurant = await this.restaurantModel.findById(id)
        if (!restaurant) throw new NotFoundException('Restaurant not found.')
        return restaurant
    }

    async create(restaurantDTO: Restaurant): Promise<Restaurant> {
        const location = await APIFeatures.getRestaurantLocation(restaurantDTO.address)

        const data = Object.assign(restaurantDTO, { location })
        const restaurant = await this.restaurantModel.create(data)
        return restaurant
    }

    async updateById(id: string, restaurant: Restaurant): Promise<Restaurant> {
        return await this.restaurantModel.findByIdAndUpdate(id, restaurant, { new: true, runValidators: true })
    }

    async deleteById(id: string): Promise<Restaurant> {
        return await this.restaurantModel.findByIdAndDelete(id)
    }

    async uploadImages(id: string, files: any) {
        const images = await APIFeatures.upload(files)

        const restaurant = await this.restaurantModel.findByIdAndUpdate(id,
            {
                images: images as Object[]
            },
            {
                new: true,
                runValidators: true
            })
        return restaurant
    }

    async deleteImages(images) {
        if (images.length === 0) return true
        const res = await APIFeatures.deleteImages(images)
        return res
    }
}
