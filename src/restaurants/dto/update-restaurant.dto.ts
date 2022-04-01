import { IsEmail, IsEmpty, IsEnum, IsOptional, IsPassportNumber, IsString } from "class-validator";
import { User } from "src/auth/schemas/user.schema";
import { Category } from "../schemas/restaurant.schema";

export class UpdateRestaurantDto {
    @IsOptional()
    @IsString()
    readonly name: string
    @IsOptional()
    @IsString()
    readonly description: string
    @IsOptional()
    @IsEmail({}, { message: 'Please enter correct email address' })
    readonly email: string
    @IsOptional()
    readonly phoneNo: number
    @IsOptional()
    @IsString()
    readonly address: string
    @IsOptional()
    @IsEnum(Category, { message: 'Please enter correct category' })
    readonly category: Category
    @IsOptional()
    readonly images?: object[]
    @IsEmpty({message: 'You cannot provide the user Id'})
    readonly user : User
}