export abstract class DomainError extends Error {
  constructor(message: string) {
    super(`[DomainError] ${message}`);
  }
}
