import { IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsOptional, IsPassportNumber, IsString } from "class-validator";
import { User } from "../../auth/schemas/user.schema";
import { Category } from "../schemas/restaurant.schema";

export class CreateRestaurantDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string
    @IsNotEmpty()
    @IsString() 
    readonly description: string
    @IsNotEmpty()
    @IsEmail({}, {message: 'Please enter correct email address'})
    readonly email: string
    @IsNotEmpty()
    readonly phoneNo: number
    @IsNotEmpty()
    @IsString()
    readonly address: string
    @IsNotEmpty()
    @IsEnum(Category, {message: 'Please enter correct category'})
    readonly category: Category
    @IsOptional()
    readonly images?: object[]
    @IsEmpty({message: 'You cannot provide the user Id'})
    readonly user : User
}