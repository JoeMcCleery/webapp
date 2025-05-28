export class AuthFetchError {
  statusCode: string
  error: string
  message: string

  constructor({ statusCode, error, message }: Partial<AuthFetchError>) {
    this.statusCode = statusCode || ""
    this.error = error || ""
    this.message = message || ""
  }
}
