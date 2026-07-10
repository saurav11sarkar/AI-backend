import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt';
import config from 'src/app/config';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import buildWhereConditions from 'src/app/helper/buildWhereConditions';
import redisClient from 'src/app/utils/redisserver';
import { generateAiText } from 'src/app/helper/openAi';
import { generateGminiText } from 'src/app/helper/giminiAi';
import { langingmini } from 'src/app/helper/lanchingimini';
import { grokapi } from 'src/app/helper/grokapi';
import { runGroqLangchain } from 'src/app/helper/groqLangChain';
import { runLangchainGraph } from 'src/app/helper/lanchgrap';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (user)
      throw new HttpException('user already exists', HttpStatus.BAD_REQUEST);

    const hashPassword = await bcrypt.hash(
      createUserDto.password,
      Number(config.bcryptSaltRounds) || 10,
    );

    const result = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashPassword,
      },
    });

    const keys = await redisClient.keys('users:*');
    if (keys.length > 0) await redisClient.del(...keys);

    return result;
  }

  async getAllUser(params: IFilterParams, options: IOptions) {
    const cacheKey = `users:${JSON.stringify(params)}:${JSON.stringify(options)}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper(options);
    const whenCondition = buildWhereConditions(params, ['name', 'email']);

    const [result, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whenCondition,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.user.count({
        where: whenCondition,
      }),
    ]);

    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 300);

    const response = {
      data: result,
      meta: {
        total,
        page,
        limit,
      },
    };

    await redisClient.set(cacheKey, JSON.stringify(response), 'EX', 300);

    return response;
  }

  async postAiInput( input: string) {
    const result = await runLangchainGraph(input);
    return result;
  }
}
