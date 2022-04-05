import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Restaurant } from 'src/restaurants/schemas/restaurant.schema';
import { Meal } from './schemas/meal.schema';

@Injectable()
export class MealService {

    constructor(
        @InjectModel(Meal.name) private mealModel: mongoose.Model<Meal>,
        @InjectModel(Restaurant.name) private restaurantModel: mongoose.Model<Restaurant>
    ) { }

    async findAll(): Promise<Meal[]> {
        const meals = await this.mealModel.find();
        return meals
    }

    async findByRestaurant(id: string): Promise<Meal[]> {
        const meals = await this.mealModel.find({ restaurant: id });
        return meals
    }

    async create(meal: Meal, user: User): Promise<Meal> {
        const data = Object.assign(meal, { user: user._id })
        const mealCreated = await this.mealModel.create(data)
        const restaurant = await this.restaurantModel.findById(meal.restaurant)
        if (!restaurant) throw new NotFoundException('Restaurant not found with this Id.')
        if (restaurant.user.toString() !== user._id.toString()) throw new ForbiddenException('You can not add meal to this restaurant')
        restaurant.menu.push(mealCreated._id)
        await this.restaurantModel.findByIdAndUpdate(restaurant._id, restaurant, {
            new: true,
            runValidators: true
        })
        return mealCreated
    }

    async findById(id: string): Promise<Meal> {
        const isValidId = mongoose.isValidObjectId(id)
        if (!isValidId) throw new BadRequestException('Wrong mongose id error')
        const meal = await this.mealModel.findById(id)
        if (!meal) throw new NotFoundException('Meal not found with this Id.')
        return meal
    }

    async updateById(id: string, meal: Meal): Promise<Meal> {
        return await this.mealModel.findByIdAndUpdate(id, meal, {
            new: true,
            runValidators: true
        })
    }

    arrayRemove(arr, value) { 
        return arr.filter(function(ele){ 
            return ele != value; 
        });
    }
    async deleteById(id: string): Promise<{ deleted: Boolean }> {
        const meal = await this.mealModel.findById(id)
        let restaurant = await this.restaurantModel.findById(meal.restaurant)
        restaurant.menu = this.arrayRemove(restaurant.menu, id)
        await this.restaurantModel.findByIdAndUpdate(restaurant._id, restaurant, {
            new: true,
            runValidators: true
        })
        const result = await this.mealModel.findByIdAndDelete(id)
        if (result) return { deleted: true }
        else return { deleted: false }
    }
}
