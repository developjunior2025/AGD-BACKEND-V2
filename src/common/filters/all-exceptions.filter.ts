import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

const INTERNAL_SERVER_ERROR_CODE: number = HttpStatus.INTERNAL_SERVER_ERROR;

interface ErrorBody {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const statusCode: number = isHttpException
      ? exception.getStatus()
      : INTERNAL_SERVER_ERROR_CODE;

    const body: ErrorBody = isHttpException
      ? this.fromHttpException(exception, statusCode, request.url)
      : this.fromUnknown(exception, statusCode, request.url);

    if (statusCode >= INTERNAL_SERVER_ERROR_CODE) {
      this.logger.error(
        `${request.method} ${request.url} -> ${statusCode}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(statusCode).json(body);
  }

  private fromHttpException(
    exception: HttpException,
    statusCode: number,
    path: string,
  ): ErrorBody {
    const payload = exception.getResponse();
    const message =
      typeof payload === 'string'
        ? payload
        : ((payload as { message?: string | string[] }).message ??
          exception.message);
    const error =
      typeof payload === 'object' && payload !== null && 'error' in payload
        ? String((payload as { error?: string }).error)
        : exception.name;

    return {
      statusCode,
      timestamp: new Date().toISOString(),
      path,
      message,
      error,
    };
  }

  private fromUnknown(
    exception: unknown,
    statusCode: number,
    path: string,
  ): ErrorBody {
    return {
      statusCode,
      timestamp: new Date().toISOString(),
      path,
      message: 'Internal server error',
      error: exception instanceof Error ? exception.name : 'Error',
    };
  }
}
