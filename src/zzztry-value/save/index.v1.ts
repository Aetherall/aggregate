export {};

const MoneySerialized = 2;

type PrimitiveShape = typeof Number | typeof Boolean | typeof String;
type PrimitiveSerialized<PS extends PrimitiveShape> = ReturnType<PS>;

type PrimitiveRuntimeProps<PS extends PrimitiveShape> = {
  value: PrimitiveSerialized<PS>;
};

type PrimitiveRuntimeInstance<PS extends PrimitiveShape> = {
  serialize(): PrimitiveSerialized<PS>;
};

type PrimitiveRuntime<PS extends PrimitiveShape> = PrimitiveRuntimeProps<PS> &
  PrimitiveRuntimeInstance<PS>;

type PrimitiveConstructor<PS extends PrimitiveShape> = {
  new (...args: any[]): PrimitiveRuntime<PS>;
  deserialize(serialized: PrimitiveSerialized<PS>): PrimitiveRuntime<PS>;
};

type ObjectShape = Record<string, PrimitiveConstructor<PrimitiveShape>>;
type ObjectSerialized<OS extends ObjectShape> = {
  [K in keyof OS]: OS[K] extends PrimitiveConstructor<infer U>
    ? PrimitiveSerialized<U>
    : never;
};

type ObjectRuntimeProps<OS extends ObjectShape> = {
  [K in keyof OS]: OS[K] extends PrimitiveConstructor<infer U>
    ? PrimitiveRuntime<U>
    : never;
};

type ObjectRuntimeInstance<OS extends ObjectShape> = {
  serialize(): ObjectSerialized<OS>;
};

type ObjectRuntime<OS extends ObjectShape> = ObjectRuntimeProps<OS> &
  ObjectRuntimeInstance<OS>;

type ObjectConstructor<OS extends ObjectShape> = {
  new (content: ObjectRuntimeProps<OS>): ObjectRuntime<OS>;
  deserialize(serialized: ObjectSerialized<OS>): ObjectRuntime<OS>;
};

function PValue<PS extends PrimitiveShape>(shape: PS) {
  return class PrimitiveValue {
    constructor(public readonly value: PrimitiveSerialized<PS>) {}

    serialize() {
      return this.value;
    }

    static deserialize<T extends PrimitiveConstructor<PS>>(
      this: T,
      serialized: PrimitiveSerialized<PS>
    ) {
      return new this(serialized) as InstanceType<T>;
    }
  };
}

function OValue<OS extends ObjectShape>(shape: OS) {
  const i = class ObjectValue implements ObjectRuntimeInstance<OS> {
    constructor(content: ObjectRuntimeProps<OS>) {
      Object.assign(this, content);
    }

    serialize() {
      const output: ObjectSerialized<OS> = {} as any;

      for (const key in shape) {
        output[key] = (this as any)[key].serialize();
      }

      return output;
    }

    static deserialize<T extends ObjectConstructor<OS>>(
      this: T,
      serialized: ObjectSerialized<OS>
    ) {
      const input: ObjectRuntimeProps<OS> = {} as any;

      for (const key in shape) {
        input[key] = shape[key].deserialize(serialized[key]) as any;
      }

      return new this(input) as InstanceType<T>;
    }
  };

  return i as typeof i & { new (...args: any[]): ObjectRuntimeProps<OS> };
}

class Money extends PValue(Number) {}

Money.deserialize(2);

class Transaction extends OValue({ in: Money, out: Money }) {
  test() {
    this;
  }
}

Transaction.deserialize({ in: 2, out: 3 });

class TransactionRecord extends OValue({ in: Transaction, out: Transaction }) {}

// type TransferSerialized = { in: number; out: number };
// type TransferRuntime = { in: Money; out: Money };
// type TransferShape = { in: typeof Money; out: typeof Money };

// type ObjectShape = Record<string, Constructor<VO>>;

// type primitive = string | number | boolean;
// type VOConstructor<T = any, P extends any[] = any[]> = {
//   new (...args: P): T;
//   deserialize(serializable: any): T;
// };

// interface Serializable<T> {
//   serialize(): T;
// }

// abstract class PrimitiveVO<V extends primitive> implements Serializable<V> {
//   constructor(protected readonly value: V) {}

//   serialize() {
//     return this.value;
//   }

//   static deserialize<T extends Constructor<any>>(
//     this: T,
//     serialized: T extends Constructor<PrimitiveVO<infer U>> ? U : never
//   ) {
//     return new this(serialized) as InstanceType<T>;
//   }
// }

// class Money extends PrimitiveVO<number> {}

// Money.deserialize(2);

// type ObjectShape = Record<string, VOConstructor<PrimitiveVO<primitive>>>;

// type SerializedObjectShape<S extends ObjectShape> = {
//   [K in keyof S]: S[K] extends VOConstructor<PrimitiveVO<infer U>> ? U : never;
// };

// type Props<S extends ObjectShape> = {
//   [K in keyof S]: S[K] extends VOConstructor<infer VO> ? VO : never;
// };

// type ObjectVOConstructor<S extends ObjectShape> = {
//   new (content: Props<S>): Props<S>;
//   deserialize(serialized: SerializedObjectShape<S>): Props<S>;
// };

// function ObjectVO<S extends ObjectShape>(shape: S) {
//   const i = class Intermediate
//     implements Serializable<SerializedObjectShape<S>>
//   {
//     constructor(content: Props<S>) {
//       Object.assign(this, content);
//     }

//     serialize() {
//       const props: Props<S> = this as any;
//       const out: Partial<SerializedObjectShape<S>> = {};

//       for (const key in shape) {
//         const k: keyof Props<S> = key;
//         out[key] = (props[key] as Serializable<any>).serialize();
//       }
//       return out as SerializedObjectShape<S>;
//     }

//     static deserialize<T extends ObjectVOConstructor<ObjectShape>>(
//       this: T,
//       serialized: {
//         [K in keyof S]: S[K] extends Constructor<Serializable<infer U>>
//           ? U
//           : never;
//       } //{ [keyof S] } T extends Constructor<Serializable<infer U>> ? U : never
//     ) {
//       const input: any = {};
//       for (const key in shape) {
//         input[key] = shape[key].deserialize(serialized[key]);
//       }

//       return new this(serialized) as InstanceType<T>;
//     }
//   };

//   return i as typeof i & { new (...args: any[]): Props<S> };
// }

// class Transfer extends ObjectVO({ in: Money }) {
//   test() {
//     this.in;
//   }
// }

// Transfer.deserialize({ in: 2 });

// Transfer.deserialize({  })
// new Transfer({})

// import { Value } from "../errors/domain.error";

// export {};

// type primitive = string | number | boolean;

// // abstract class PrimitiveValue<T extends primitive> {
// //   constructor(protected value: T) {}

// //   serialize(): T {
// //     return this.value;
// //   }

// //   static deserialize(this: any, value: primitive) {
// //     return new this(value);
// //   }
// // }

// // type Deserializable<T> = { deserialize(...args: any[]): T };
// // type Shape = Record<string, Deserializable<any>>;
// // type Constructor<I, Params extends any[] = any[]> = new (...args: Params) => I;

// // function ComposedValue<S extends Shape>(shape: S) {
// //   type result = {
// //     readonly [K in keyof S]: S[K] extends Constructor<infer U> ? U : never;
// //   };

// //   const a = class {
// //     constructor(content: any) {
// //       Object.assign(this, content);
// //     }

// //     static deserialize<T extends new (content: any) => any>(
// //       this: T,
// //       serialized: {
// //         [K in keyof S]: S[K] extends Constructor<PrimitiveValue<infer U>>
// //           ? U
// //           : Parameters<S[K]["deserialize"]>[0];
// //       }
// //     ) {
// //       const content: Record<string, any> = {};
// //       for (const key in serialized) {
// //         content[key] = shape[key].deserialize(serialized[key]);
// //       }

// //       return new this(content) as InstanceType<T>;
// //     }

// //     serialize() {
// //       const result = {};
// //       for (const key in shape) {
// //         (result as any)[key] = (this as any)[key].serialize();
// //       }
// //       return result;
// //     }
// //   };

// //   return a as typeof a & { new (...args: any[]): result };
// // }

// function isPrimitive(
//   shape: PrimitiveShape | ObjectShape
// ): shape is PrimitiveShape {
//   switch (shape) {
//     case String:
//     case Number:
//     case Boolean:
//       return true;
//     default:
//       return false;
//   }
// }

// function isObject(shape: PrimitiveShape | ObjectShape): shape is ObjectShape {
//   return !isPrimitive(shape);
// }

// type PrimitiveShape = typeof Number | typeof String | typeof Boolean;
// type ObjectShape = Record<string, PrimitiveShape>;

// type Shape = PrimitiveShape | ObjectShape;

// type SerializedShape<S extends Shape> = S extends PrimitiveShape
//   ? ReturnType<S>
//   : { [K in keyof S]: S[K] extends PrimitiveShape ? ReturnType<S[K]> : never };

// const A = { a: Number };

// type a = SerializedShape<typeof A>;

// type Constructor<T = any> = new (...args: any[]) => T;

// class PrimitiveValue<P extends primitive> {
//   static deserialize<T extends Constructor>(
//     this: T,
//     serialized: T extends PrimitiveValue<infer U> ? U : never
//   ) {
//     return new this(serialized);
//   }

// function Value<S extends Shape>(shape: S): S extends PrimitiveShape<infer U> ? PrimitiveValue : typeof ObjectValue {
//   if (isPrimitive(shape)) {
//     return PrimitiveValue
//   }

//   if (shape === String) {
//     return class B {};
//   }

//   if (shape === Boolean) {
//     return class C {};
//   }

//   shape.
//   // if (isPrimitive(shape)) {
//   //   return PrimitiveValue;
//   // }

//   // const intermediate = class {
//   //   constructor(value: S) {}

//   //   static deserialize<T extends new (value: S) => any>(
//   //     this: T,
//   //     serialized: SerializedShape<S>
//   //   ) {
//   //     if (isPrimitive(shape)) {
//   //       return new this(serialized);
//   //     }
//   //     if (isObject(shape)) {
//   //       for (const key in shape) {
//   //         serialized[key];
//   //       }
//   //     }
//   //     shape;
//   //     for (const key in shape) {
//   //       serialized[key];
//   //     }
//   //   }
//   // };

//   // return intermediate;
// }

// type PrimitiveConstructor<T> = { (...args: any): T };
// type SerializedPrimitiveConstructor<T extends any> =
//   T extends PrimitiveConstructor<infer U> ? U : never;

// function Value<S extends PrimitiveConstructor<primitive>>(shape: S) {
//   const i = class Intermediate {
//     constructor(
//       protected readonly value: S extends PrimitiveConstructor<infer U>
//         ? U
//         : never
//     ) {}

//     static deserialize<T extends Constructor<any>>(
//       this: T,
//       serialized: T extends Constructor<infer U> ? U : never
//     ) {
//       return new this(serialized) as InstanceType<T>;
//     }
//   };

//   return i as typeof i;
// }

// class AA extends Value(Number) {
//   test() {
//     this.value;
//   }
// }

// AA.deserialize(2);

// class Money extends Value(Number) {
//   isGreaterThan(other: Money) {
//     return this.value > other.value;
//   }
// }

// class Transfer extends Value({ in: Money, out: Money }) {
//   isFilling() {
//     return this.in.isGreaterThan(this.out);
//   }

//   isEmptying() {
//     return this.out.isGreaterThan(this.in);
//   }
// }

// class Transaction extends Value({
//   first: Transfer,
//   second: Transfer,
// }) {}

// const a = Transaction.deserialize({
//   first: { in: 2, out: 3 },
//   second: { in: 2, out: 4 },
// });

// console.log(a);
// console.log(a.serialize());
