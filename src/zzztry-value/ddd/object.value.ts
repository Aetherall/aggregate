export function ObjectValue<S extends Shape>(shape: S) {
  type Properties = {
    readonly [K in keyof S]: S[K] extends Constructor<infer U> ? U : never;
  };

  const Serializable = class {
    constructor(content: Properties) {
      Object.assign(this, content);
    }

    static deserialize<T extends Constructor<any>>(
      this: T,
      serialized: Serialized<S>
    ) {
      const content: Record<string, any> = {};
      for (const key in serialized) {
        content[key] = shape[key].deserialize(serialized[key]);
      }

      return new this(content) as InstanceType<T>;
    }

    serialize() {
      const result: Partial<Readonly<Properties>> = {};
      for (const key in shape) {
        result[key] = (this as any)[key].serialize();
      }
      return result;
    }
  };

  return Serializable as typeof Serializable & {
    new (...args: any[]): Properties;
  };
}
