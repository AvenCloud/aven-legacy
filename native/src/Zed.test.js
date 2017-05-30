const Zed = require("./Zed");

import {
  validate,
  compute,
  ZString,
  ZNumber,
  ZBoolean,
  ZEquals,
  ZAddress,
  ZSum,
  Store
} from "./Zed";

// test("Zed Store Has initial state", () => {
//   const store = createStore();
//   expect(Object.keys(store.state)).toEqual(expect.arrayContaining([]));
// });
// test("Zed Store Mutates state", () => {
//   const store = createStore();
//   store.mutate("a", 1);
//   expect(store.data.a).toEqual(1);
// });

// test("Zed Store Mutates deep state", () => {
//   const store = createStore();
//   store.mutate(ZAddress("a"), ZObject({ x: 1 }));
//   store.mutate(ZAddress("b"), ZList([1]));
//   store.mutate(ZAddress("a", "x"), 2);
//   store.mutate(ZAddress("a", 0), 2);
//   expect(store.data.a.items.x).toEqual(2);
//   expect(store.data.a.items.x).toEqual(2);
//   expect(store.data.b.items[0]).toEqual(2);
//   expect(store.data.b.items.length).toEqual(1);
// });

// test("Zed Store checks type", () => {
//   const store = createStore();
//   store.mutate("str", ZString());
//   store.mutate("literal str", "Huh");
//   store.mutate(["a", "x"], 2);
//   store.mutate(["a", 0], 2);
//   expect(store.data.a.items.x).toEqual(2);
//   expect(store.data.b.items[0]).toEqual(2);
// });

// test("Zed Store Emits change events", () => {
//   // const myMock = jest.fn();
//   // expect(someMockFunction.mock.calls[0][0]).toBe('first arg');
// });

// test("Validates Primitive Strings", () => {
//   expect(validate(ZString("asdf"), ZString())).toBeFalsy();
//   expect(validate(ZString("foo"), ZString("bar"))).toEqual(
//     'does not match "bar"'
//   );
//   expect(validate(ZNumber(42), ZString())).toEqual("is not a string");
//   expect(validate(ZString("bar"), ZString("bar"))).toBeFalsy();
// });

// test("Validates Primitive Numbers", () => {
//   expect(validate(ZNumber(12), ZNumber())).toBeFalsy();
//   expect(validate(ZNumber(91), ZNumber(73))).toEqual("does not equal 73");
//   expect(validate(ZString("foo"), ZNumber())).toEqual("is not a number");
//   expect(validate(ZNumber(73), ZNumber(73))).toBeFalsy();
// });

test("compute basics", () => {
  const store = new Store({
    a: ZNumber(12),
    b: ZString("foo"),
    c: ZBoolean(true),
    d: ZBoolean(false)
  });
  expect(store.compute(ZAddress("a")).type).toEqual("ZNumber");
  expect(store.compute(ZAddress("a")).value).toEqual(12);
  expect(store.compute(ZAddress("b")).type).toEqual("ZString");
  expect(store.compute(ZAddress("b")).value).toEqual("foo");
  expect(store.compute(ZAddress("c")).type).toEqual("ZBoolean");
  expect(store.compute(ZAddress("c")).value).toEqual(true);
  expect(store.compute(ZAddress("d")).value).toEqual(false);
});

test("addressing", () => {
  const store = new Store({
    x: ZNumber(12),
    y: ZAddress("x")
  });
  expect(store.compute(ZAddress("y")).type).toEqual("ZNumber");
  expect(store.compute(ZAddress("y")).value).toEqual(12);
});

test("Equality primitives", () => {
  const store = new Store({
    x: ZNumber(42),
    y: ZString("abc"),
    a: ZEquals(ZAddress("x"), ZNumber(42)),
    b: ZEquals(ZAddress("x"), ZNumber(12)),
    c: ZEquals(ZAddress("y"), ZString("abc")),
    d: ZEquals(ZAddress("y"), ZString("foo")),
    e: ZEquals(ZAddress("y"), ZNumber(12))
  });
  expect(store.compute(ZAddress("a")).value).toEqual(true);
  expect(store.compute(ZAddress("b")).value).toEqual(false);
  expect(store.compute(ZAddress("c")).value).toEqual(true);
  expect(store.compute(ZAddress("d")).value).toEqual(false);
  expect(store.compute(ZAddress("e")).value).toEqual(false);
});

test("Sums", () => {
  const store = new Store({
    x: ZNumber(42),
    y: ZNumber(5),
    a: ZSum(ZAddress("x"), ZNumber(0)),
    b: ZSum(ZAddress("x"), ZAddress("y"))
  });
  expect(store.compute(ZSum(ZNumber(2), ZNumber(0))).value).toEqual(2);
  expect(store.compute(ZSum(ZNumber(0.2), ZAddress("x"))).value).toEqual(42.2);
  expect(store.compute(ZAddress("a")).value).toEqual(42);
  expect(store.compute(ZAddress("b")).value).toEqual(47);
});

test("Basic type errors", () => {
  const store = new Store();
  expect(store.match(ZString("a"), "ZString")).toBeTruthy();
  expect(store.match(ZString("a"), "ZNumber")).toBeFalsy();
  expect(store.match(ZNumber(12), "ZNumber")).toBeTruthy();
  expect(store.match(ZNumber(12), "ZString")).toBeFalsy();
});

test("fancy type errors", () => {
  const store = new Store({
    x: ZNumber(42),
    y: ZNumber(5),
    a: ZSum(ZAddress("x"), ZAddress("y"))
  });
  expect(store.match(ZAddress("a"), "ZNumber")).toBeTruthy();

  // expect(store.compute(ZSum(ZString("a"), ZString("a"))).value).toEqual(null);
  // expect(
  //   store.compute(ZSum(ZString("a"), ZString("a"))).validationError
  // ).toEqual("Cannot add something that is not a number");
});
