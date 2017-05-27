const Zed = require("./Zed");

test("Zed Store Has initial state", () => {
  const store = Zed.createStore();
  expect(Object.keys(store.state)).toEqual(expect.arrayContaining([]));
});
test("Zed Store Mutates state", () => {
  const store = Zed.createStore();
  store.mutate("a", 1);
  expect(store.data.a).toEqual(1);
});

test("Zed Store Mutates deep state", () => {
  const store = Zed.createStore();
  store.mutate("a", { b: 1 });
  expect(store.data.a).toEqual(1);

  expect(store.data.a).toEqual(3);
});

test("Zed Store Emits change events", () => {
  // const myMock = jest.fn();
  // expect(someMockFunction.mock.calls[0][0]).toBe('first arg');
});
