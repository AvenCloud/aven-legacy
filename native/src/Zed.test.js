const Zed = require("./Zed");

import { validate, compute, ZString, ZNumber, ZEquals, ZAddress } from "./Zed";

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
  expect(validate("asdf", ZString())).toBeFalsy();
  expect(validate(ZString("asdf"), ZString())).toBeFalsy();
  expect(validate("foo", ZString("bar"))).toEqual('does not match "bar"');
  expect(validate(ZString("foo"), ZString("bar"))).toEqual(
    'does not match "bar"'
  );
  expect(validate("bar", ZString("bar"))).toBeFalsy();
  expect(validate(42, ZString("bar"))).toEqual('does not match "bar"');
  expect(validate(42, ZString())).toEqual("is not a string");
  expect(validate(ZString("bar"), ZString("bar"))).toBeFalsy();
});

test("Validates Primitive Numbers", () => {
  expect(validate(12, ZNumber())).toBeFalsy();
  expect(validate(ZNumber(12), ZNumber())).toBeFalsy();
  expect(validate(91, ZNumber(73))).toEqual("does not equal 73");
  expect(validate(ZNumber(91), ZNumber(73))).toEqual("does not equal 73");
  expect(validate(73, ZNumber(73))).toBeFalsy();
  expect(validate("foo", ZNumber(73))).toEqual("is not a number equal to 73");
  expect(validate("foo", ZNumber())).toEqual("is not a number");
  expect(validate(ZNumber(73), ZNumber(73))).toBeFalsy();
});

test("compute basics", () => {
  const simpleDocs = {
    a: 12,
    b: "foo",
    c: true,
    d: false
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
    a: ZEquals(ZAddress("x"), 42),
    b: ZEquals(ZAddress("x"), 12),
    c: ZEquals(ZAddress("y"), "abc"),
    d: ZEquals(ZAddress("y"), "foo"),
    e: ZEquals(ZAddress("y"), 12)
  };
  expect(compute(docs, "a").value).toEqual(true);
  expect(compute(docs, "b").value).toEqual(false);
  expect(compute(docs, "c").value).toEqual(true);
  expect(compute(docs, "d").value).toEqual(false);
  expect(compute(docs, "e").value).toEqual(false);
});
