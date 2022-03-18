export class ApplicativeError extends Error {
  constructor(message: string) {
    super(`[ApplicativeError] ${message}`);
  }

  static forCommand(command: new (...args: any[]) => any) {
    return class extends ApplicativeError {
      constructor(reason: string) {
        super(`Command ${command.name} failed : ${reason}`);
      }
    };
  }
}
