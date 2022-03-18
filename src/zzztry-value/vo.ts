// type primitive = string | number | boolean;

// abstract class PrimitiveValue<T extends primitive> {
//   constructor(protected value: T) {}

//   serialize(): T {
//     return this.value;
//   }

//   static deserialize(this: any, value: primitive) {
//     return new this(value);
//   }
// }

// type Deserializable = { deserialize(...args: any[]): primitive };
// type Shape = Record<string, Deserializable>;
// type Constructor<I, Params extends any[] = any[]> = new (...args: Params) => I;

// function ComposedValue<S extends Shape>(shape: S) {
//   type result = {
//     readonly [K in keyof S]: S[K] extends Constructor<infer U> ? U : never;
//   };

//   const a = class {
//     constructor(content: any) {
//       Object.assign(this, content);
//     }

//     static deserialize<T extends new (content: any) => any>(
//       this: T,
//       serialized: {
//         [K in keyof S]: S[K] extends Constructor<PrimitiveValue<infer U>>
//           ? U
//           : never;
//       }
//     ) {
//       const content: Record<string, any> = {};
//       for (const key in serialized) {
//         content[key] = shape[key].deserialize(serialized[key]);
//       }

//       return new this(content) as InstanceType<T>;
//     }

//     serialize() {
//       const result = {};
//       for (const key in shape) {
//         (result as any)[key] = (this as any)[key].serialize();
//       }
//       return result;
//     }
//   };

//   return a as typeof a & { new (...args: any[]): result };
// }

// class Money extends PrimitiveValue<number> {
//   isGreaterThan(other: Money) {
//     return this.value > other.value;
//   }
// }

// class Transfer extends ComposedValue({ in: Money, out: Money }) {
//   isFilling() {
//     return this.in.isGreaterThan(this.out);
//   }

//   isEmptying() {
//     return this.out.isGreaterThan(this.in);
//   }
// }

// const a = Transfer.deserialize({ in: 3, out: 2 });

// console.log(a);
// console.log(a.isEmptying());
// console.log(a.isFilling());
// console.log(a.serialize());
