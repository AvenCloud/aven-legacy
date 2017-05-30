const Zed = require("./Zed");

import {
  validate,
  compute,
  ZString,
  ZNumber,
  ZBoolean,
  ZEquals,
  ZAddress
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

test("Validates Primitive Strings", () => {
  expect(validate(ZString("asdf"), ZString())).toBeFalsy();
  expect(validate(ZString("foo"), ZString("bar"))).toEqual(
    'does not match "bar"'
  );
  expect(validate(ZNumber(42), ZString())).toEqual("is not a string");
  expect(validate(ZString("bar"), ZString("bar"))).toBeFalsy();
});

test("Validates Primitive Numbers", () => {
  expect(validate(ZNumber(12), ZNumber())).toBeFalsy();
  expect(validate(ZNumber(91), ZNumber(73))).toEqual("does not equal 73");
  expect(validate(ZString("foo"), ZNumber())).toEqual("is not a number");
  expect(validate(ZNumber(73), ZNumber(73))).toBeFalsy();
});

test("compute basics", () => {
  const simpleDocs = {
    a: ZNumber(12),
    b: ZString("foo"),
    c: ZBoolean(true),
    d: ZBoolean(false)
  };
  expect(compute(simpleDocs, "a").type).toEqual("ZNumber");
  expect(compute(simpleDocs, "a").value).toEqual(12);
  expect(compute(simpleDocs, "b").type).toEqual("ZString");
  expect(compute(simpleDocs, "b").value).toEqual("foo");
  expect(compute(simpleDocs, "c").type).toEqual("ZBoolean");
  expect(compute(simpleDocs, "c").value).toEqual(false);
  expect(compute(simpleDocs, "d").value).toEqual(true);
});

test("Equality primitives", () => {
  const docs = {
    x: 42,
    y: "abc",
    a: ZEquals(ZAddress("x"), ZNumber(42)),
    b: ZEquals(ZAddress("x"), ZNumber(12)),
    c: ZEquals(ZAddress("y"), ZString("abc")),
    d: ZEquals(ZAddress("y"), ZString("foo")),
    e: ZEquals(ZAddress("y"), ZNumber(12))
  };
  expect(compute(docs, "a").value).toEqual(true);
  expect(compute(docs, "b").value).toEqual(false);
  expect(compute(docs, "c").value).toEqual(true);
  expect(compute(docs, "d").value).toEqual(false);
  expect(compute(docs, "e").value).toEqual(false);
});
