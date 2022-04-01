import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './schemas/restaurant.schema';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/schemas/user.schema';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('restaurants')
export class RestaurantsController {
    constructor(
        private restaurantsServices: RestaurantsService
    ) { }

    @Get()
    async getAllRestaurants(
        @Query() query: ExpressQuery,
    ): Promise<Restaurant[]> {
        return this.restaurantsServices.findAll(query)
    }

    @Get(':id')
    async getRestaurant(@Param('id') id: string): Promise<Restaurant> {
        return this.restaurantsServices.findById(id)
    }

    @Post()
    @UseGuards(AuthGuard(), RolesGuard)
    async createRestaurant(@Body() restaurant: CreateRestaurantDto, @CurrentUser() user: User
    ): Promise<Restaurant> {
        return this.restaurantsServices.create(restaurant, user)
    }

    @Put(':id')
    @UseGuards(AuthGuard(), RolesGuard)
    async updateRestaurant(@Param('id') id: string, @Body() restaurantDto: UpdateRestaurantDto, @CurrentUser() user: User): Promise<Restaurant> {
        const restaurant = await this.restaurantsServices.findById(id)
        console.log(user)
        if (restaurant.user.toString() !== user._id.toString()) throw new ForbiddenException('You can not update this restaurant')
        return this.restaurantsServices.updateById(id, restaurantDto)
    }

    @Delete(':id')
    @UseGuards(AuthGuard(), RolesGuard)
    async deleteRestaurant(@Param('id') id: string, @CurrentUser() user: User): Promise<{ deleted: Boolean }> {
        const restaurant = await this.restaurantsServices.findById(id)
        if (restaurant.user.toString() !== user._id.toString()) throw new ForbiddenException('You can not delete this restaurant')
        const isDeleted = await this.restaurantsServices.deleteImages(restaurant.images)
        if (isDeleted) {
            await this.restaurantsServices.deleteById(id)
            return { deleted: true }
        }
        else return { deleted: false }
    }

    @Put('upload/:id')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadFile(
        @Param('id') id: string,
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        await this.restaurantsServices.findById(id)
        const res = await this.restaurantsServices.uploadImages(id, files)
        return res
    }
}
