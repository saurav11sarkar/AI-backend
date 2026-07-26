import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RateLimitGuard } from 'src/app/middlewares/redlimit.guard';
import { AuthGuard } from 'src/app/middlewares/auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp')
  @ApiOperation({ summary: 'Send OTP' })
  @ApiBody({
    schema: {
      properties: { email: { type: 'string', example: 'user@example.com' } },
    },
  })
  @UseGuards(RateLimitGuard(), AuthGuard('user'))
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body('email') email: string) {
    const otp = await this.authService.sendOtp(email);
    return {
      message: 'OTP sent successfully',
      data: otp,
    };
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        otp: { type: 'string', example: '123456' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    const isVerified = await this.authService.verifyOtp(email, otp);
    return {
      message: 'OTP verified successfully',
      data: isVerified,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Register User' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createAuthDto: CreateAuthDto) {
    const result = await this.authService.register(createAuthDto);
    return {
      message: 'User registered successfully',
      data: result,
    };
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
