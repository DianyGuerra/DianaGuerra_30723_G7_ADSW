export class Mediator {
    handlers = new Map();
    register(key, handler) {
        if (this.handlers.has(key)) {
            throw new Error(`Ya existe un handler registrado para ${key}`);
        }
        this.handlers.set(key, handler);
    }
    async send(key, request) {
        const handler = this.handlers.get(key);
        if (!handler) {
            throw new Error(`No existe handler para ${key}`);
        }
        return handler.handle(request);
    }
}
