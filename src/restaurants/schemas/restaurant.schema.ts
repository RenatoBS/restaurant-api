import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { ObjectId } from 'mongoose'
import mongoose from 'mongoose'
import { User } from 'src/auth/schemas/user.schema'
import { Meal } from 'src/meal/schemas/meal.schema'

export enum Category {
    FAST_FOOD = 'Fast Food',
    CAFE = 'Cafe',
    FINE_DINNING = 'Fine Dinning',
}

@Schema({ timestamps: true })
export class Location {
    @Prop({ type: String, enum: ['Point'] })
    type: string
    @Prop({ index: '2dsphere' })
    coordinates: Number[]
    @Prop()
    formattedAddress: string
    @Prop()
    city: string
    @Prop()
    state: string
    @Prop()
    zipcode: string
    @Prop()
    country: string

}

@Schema({ timestamps: true })
export class Restaurant {

    @Prop()
    name: string

    @Prop()
    description: string

    @Prop()
    email: string

    @Prop()
    phoneNo: number

    @Prop()
    address: string

    @Prop()
    category: Category

    @Prop()
    images?: object[]

    @Prop({ type: Object, ref: 'Location' })
    location?: Location

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }])
    menu?: any[]

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant)