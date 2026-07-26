import { HttpException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import redisClient from 'src/app/utils/redisserver';
import { emailQueue } from 'src/app/helper/queue/queue';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async sendOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`otp:${email}`, otp, 'EX', 60 * 1);

    return otp;
  }

  async verifyOtp(email: string, otp: string) {
    const storedOtp = await redisClient.get(`otp:${email}`);
    if (storedOtp !== otp) throw new Error('Invalid OTP');

    const expeirOtp = await redisClient.ttl(`otp:${email}`);
    if (expeirOtp < 0) throw new Error('OTP expired');

    await redisClient.del(`otp:${email}`);

    return true;
  }

  async register(createAuthDto: CreateAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: createAuthDto.email },
    });
    if (user) throw new HttpException('User already exists', 400);
    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
    const result = await this.prisma.user.create({
      data: { ...createAuthDto, password: hashedPassword },
    });

    // Don't block the response on the email API call — queue it and let
    // the worker (src/app/helper/queue/email.worker.ts) send it in the
    // background, with automatic retries if Resend fails.
    await emailQueue.add('send-email', {
      to: createAuthDto.email,
      subject: 'Registration successful',
      html: 'Registration successful',
    });

    return result;
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
