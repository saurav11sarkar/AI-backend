import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import config from 'src/app/config';
import buildWhereConditions from 'src/app/helper/buildWhereConditions';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import { IFilterParams } from 'src/app/helper/pick';
import redisClient from 'src/app/utils/redisserver';
import { PrismaService } from 'src/prisma/prisma.service';
import { vectorStore } from '../../helper/googlevectordb';
import { uploadPdf } from '../../helper/pdfUploade';
import { llm } from '../../helper/rag';
import { CreateUserDto } from './dto/create-user.dto';

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

  async uploadPdf(file: Express.Multer.File) {
    if (!file)
      throw new HttpException('pdf file is required', HttpStatus.BAD_REQUEST);

    const result = await uploadPdf(file.buffer, file.originalname);

    return result;
  }

  async postAiInput(input: string) {
    const relevantDocs = await vectorStore.similaritySearch(input, 4);
    const context = relevantDocs.map((doc) => doc.pageContent).join('\n\n');

    const prompt = context
      ? `Answer the question using the context below. If the context doesn't contain the answer, say you don't know.\n\nContext:\n${context}\n\nQuestion: ${input}`
      : input;

    const result = await llm.invoke(prompt);

    return {
      content: result.content,
      tokenUse: result.usage_metadata?.total_tokens,
    };
  }
}
