interface ResponseError {
  code: number
  message: string
}

export interface Response<T> {
  success: boolean
  result?: T
  error?: ResponseError
}

export class ResponseDto {
  public static success<T>(result: T): Response<T> {
    return {
      success: true,
      result
    }
  }

  public static error<T>(code: number, message: string): Response<T> {
    return {
      success: false,
      error: {
        code,
        message
      }
    }
  }
}
