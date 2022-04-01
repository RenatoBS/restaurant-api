import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/singup.dto';
import { User } from './schemas/user.schema'

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService
    ) { }

    @Post('signup')
    singUp(
        @Body() signUpDto: SignUpDto
    ): Promise<any> {
        return this.authService.signUp(signUpDto)
    }
    @Get('login')
    login(
        @Body() loginDto: LoginDto
    ): Promise<any> {
        return this.authService.login(loginDto)
    }
}
