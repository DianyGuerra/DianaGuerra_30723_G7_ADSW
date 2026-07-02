export interface RequestHandler<TRequest = unknown, TResponse = unknown> {
  handle(request: TRequest): Promise<TResponse>;
}

export class Mediator {
  private readonly handlers = new Map<string, RequestHandler<any, any>>();

  register<TRequest, TResponse>(key: string, handler: RequestHandler<TRequest, TResponse>) {
    if (this.handlers.has(key)) {
      throw new Error(`Ya existe un handler registrado para ${key}`);
    }
    this.handlers.set(key, handler);
  }

  async send<TResponse>(key: string, request?: unknown): Promise<TResponse> {
    const handler = this.handlers.get(key);
    if (!handler) {
      throw new Error(`No existe handler para ${key}`);
    }
    return handler.handle(request);
  }
}
