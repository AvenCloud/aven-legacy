const Zed = require("./Zed");

const { createStore, ZObject, ZList, ZString, ZAddress } = Zed;

test("Zed Store Has initial state", () => {
  const store = createStore();
  expect(Object.keys(store.state)).toEqual(expect.arrayContaining([]));
});
test("Zed Store Mutates state", () => {
  const store = createStore();
  store.mutate("a", 1);
  expect(store.data.a).toEqual(1);
});

test("Zed Store Mutates deep state", () => {
  const store = createStore();
  store.mutate(ZAddress("a"), ZObject({ x: 1 }));
  store.mutate(ZAddress("b"), ZList([1]));
  store.mutate(ZAddress("a", "x"), 2);
  store.mutate(ZAddress("a", 0), 2);
  expect(store.data.a.items.x).toEqual(2);
  expect(store.data.a.items.x).toEqual(2);
  expect(store.data.b.items[0]).toEqual(2);
  expect(store.data.b.items.length).toEqual(1);
});

test("Zed Store checks type", () => {
  const store = createStore();
  store.mutate("str", ZString());
  store.mutate("literal str", "Huh");
  store.mutate(["a", "x"], 2);
  store.mutate(["a", 0], 2);
  expect(store.data.a.items.x).toEqual(2);
  expect(store.data.b.items[0]).toEqual(2);
});

test("Zed Store Emits change events", () => {
  // const myMock = jest.fn();
  // expect(someMockFunction.mock.calls[0][0]).toBe('first arg');
});

test("validate", () => {
  // validate
});
