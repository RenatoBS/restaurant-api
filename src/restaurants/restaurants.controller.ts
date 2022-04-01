import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './schemas/restaurant.schema';

@Controller('restaurants')
export class RestaurantsController {
    constructor(
        private restaurantsServices: RestaurantsService
    ) { }

    @Get()
    async getAllRestaurants(@Query() query: ExpressQuery): Promise<Restaurant[]> {
        return this.restaurantsServices.findAll(query)
    }

    @Get(':id')
    async getRestaurant(@Param('id') id: string): Promise<Restaurant> {
        return this.restaurantsServices.findById(id)
    }

    @Post()
    async createRestaurant(@Body() restaurant: CreateRestaurantDto): Promise<Restaurant> {
        return this.restaurantsServices.create(restaurant)
    }

    @Put(':id')
    async updateRestaurant(@Param('id') id: string, @Body() restaurant: UpdateRestaurantDto): Promise<Restaurant> {
        await this.restaurantsServices.findById(id)
        return this.restaurantsServices.updateById(id, restaurant)
    }

    @Delete(':id')
    async deleteRestaurant(@Param('id') id: string): Promise<{ deleted: Boolean }> {
        const restaurant = this.restaurantsServices.deleteById(id)
        if (!restaurant) return { deleted: true }
        else return { deleted: false }
    }
}
