import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import type { Request } from 'express';
import redisClient from '../utils/redisserver';

const MAX_REQUESTS = 5;
const WINDOW_SECONDS = 60;

export function RateLimitGuard(
  maxRequests = MAX_REQUESTS,
  windowSeconds = WINDOW_SECONDS,
): Type<CanActivate> {
  @Injectable()
  class RateLimitMixinGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const ip = request.ip ?? 'unknown';
      const key = `rate_limit:${ip}`;

      const current = await redisClient.incr(key);
      if (current === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        throw new HttpException(
          'Too many requests, please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return true;
    }
  }

  return mixin(RateLimitMixinGuard);
}
