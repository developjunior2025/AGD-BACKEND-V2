import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const { method, originalUrl } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = httpContext.getResponse<Response>();
        const durationMs = Date.now() - start;
        this.logger.log(
          `${method} ${originalUrl} ${response.statusCode} +${durationMs}ms`,
        );
      }),
    );
  }
}
