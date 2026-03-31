export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const handleError = (error: any) => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  if (error.code === 'P2002') {
    // Unique constraint violation
    return {
      statusCode: 409,
      message: `${error.meta?.target?.[0] || 'Field'} already exists`,
    };
  }

  if (error.code === 'P2025') {
    // Record not found
    return {
      statusCode: 404,
      message: 'Resource not found',
    };
  }

  return {
    statusCode: 500,
    message: 'Internal server error',
  };
};
