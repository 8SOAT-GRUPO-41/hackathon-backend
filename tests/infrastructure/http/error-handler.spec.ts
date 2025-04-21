import { HttpErrorHandler } from '@/infrastructure/http/error-handler';
import { HttpStatusCode } from '@/infrastructure/http/helper';
import {
  NotFoundError,
  ConflictError,
  InvalidPasswordError,
  UnauthorizedError,
} from '@/domain/errors';
import { ErrorCodes } from '@/domain/enums/error-codes';

describe('HttpErrorHandler', () => {
  let httpErrorHandler: HttpErrorHandler;

  beforeEach(() => {
    httpErrorHandler = new HttpErrorHandler();
  });

  it('should handle NotFoundError with correct status and message', () => {
    const error = new NotFoundError('Resource not found');
    const response = httpErrorHandler.handle(error);

    expect(response.statusCode).toBe(HttpStatusCode.NOT_FOUND);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: HttpStatusCode.NOT_FOUND,
      code: ErrorCodes.NOT_FOUND,
      message: 'Resource not found',
    });
  });

  it('should handle ConflictError with correct status and message', () => {
    const error = new ConflictError('Resource already exists');
    const response = httpErrorHandler.handle(error);

    expect(response.statusCode).toBe(HttpStatusCode.CONFLICT);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: HttpStatusCode.CONFLICT,
      code: ErrorCodes.CONFLICT_ERROR,
      message: 'Resource already exists',
    });
  });

  it('should handle UnauthorizedError with correct status and message', () => {
    const error = new UnauthorizedError('Unauthorized access');
    const response = httpErrorHandler.handle(error);

    expect(response.statusCode).toBe(HttpStatusCode.UNAUTHORIZED);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: HttpStatusCode.UNAUTHORIZED,
      code: ErrorCodes.UNAUTHORIZED,
      message: 'Unauthorized access',
    });
  });

  it('should handle InvalidPasswordError with correct status and message', () => {
    const error = new InvalidPasswordError('Invalid password');
    const response = httpErrorHandler.handle(error);

    expect(response.statusCode).toBe(HttpStatusCode.UNPROCESSABLE_ENTITY);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: HttpStatusCode.UNPROCESSABLE_ENTITY,
      code: ErrorCodes.INVALID_PASSWORD,
      message: 'Invalid password',
    });
  });

  it('should handle validation errors with correct status and message', () => {
    const error = { code: 'FST_ERR_VALIDATION', message: 'Validation failed' };
    const response = httpErrorHandler.handle(error);

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: HttpStatusCode.BAD_REQUEST,
      code: ErrorCodes.BAD_REQUEST,
      message: 'Validation failed',
    });
  });

  it('should handle validation errors without message', () => {
    const error = { code: 'FST_ERR_VALIDATION' };
    const response = httpErrorHandler.handle(error);

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: HttpStatusCode.BAD_REQUEST,
      code: ErrorCodes.BAD_REQUEST,
      message: 'Validation error',
    });
  });

  it('should handle unknown errors with server error status', () => {
    const error = new Error('Something went wrong');
    const response = httpErrorHandler.handle(error);

    expect(response.statusCode).toBe(HttpStatusCode.SERVER_ERROR);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: HttpStatusCode.SERVER_ERROR,
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong',
    });
  });

  it('should handle unknown errors without message', () => {
    const error = {};
    const response = httpErrorHandler.handle(error);

    expect(response.statusCode).toBe(HttpStatusCode.SERVER_ERROR);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: HttpStatusCode.SERVER_ERROR,
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Something unexpected happened',
    });
  });
});
