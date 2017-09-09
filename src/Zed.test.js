const Zed = require("./Zed");

const {
  validate,
  compute,
  ZString,
  ZNumber,
  ZBoolean,
  ZEquals,
  ZAddress,
  ZOr,
  ZSum,
  ZStore
} = Zed;

test("Store compute basics", () => {
  const store = new ZStore({
    a: ZNumber(12),
    b: ZString("foo"),
    c: ZBoolean(true),
    d: ZBoolean(false)
  });
  expect(store.compute(ZAddress("a")).__zType).toEqual("ZNumber");
  expect(store.compute(ZAddress("a")).value).toEqual(12);
  expect(store.compute(ZAddress("b")).__zType).toEqual("ZString");
  expect(store.compute(ZAddress("b")).value).toEqual("foo");
  expect(store.compute(ZAddress("c")).__zType).toEqual("ZBoolean");
  expect(store.compute(ZAddress("c")).value).toEqual(true);
  expect(store.compute(ZAddress("d")).value).toEqual(false);
});

test("Store watch and mutate work", () => {
  const store = new ZStore({
    a: ZNumber(12)
  });
  expect(store.compute(ZAddress("a")).__zType).toEqual("ZNumber");
  expect(store.compute(ZAddress("a")).value).toEqual(12);
  const myWatcher = jest.fn();
  const removeWatch = store.watch(ZAddress("a"), myWatcher).remove;
  expect(myWatcher.mock.calls[0][0].value).toEqual(12);
  expect(myWatcher.mock.calls.length).toEqual(1);
  store.mutate(ZAddress("a"), ZNumber(5));
  expect(myWatcher.mock.calls[1][0].value).toEqual(5);
  expect(myWatcher.mock.calls.length).toEqual(2);
  expect(store.compute(ZAddress("a")).value).toEqual(5);
  removeWatch();
  store.mutate(ZAddress("a"), ZNumber(1));
  expect(store.compute(ZAddress("a")).value).toEqual(1);
  expect(myWatcher.mock.calls.length).toEqual(2);
});

test("Addresses", () => {
  const store = new ZStore({
    x: ZNumber(12),
    y: ZAddress("x")
  });
  expect(store.compute(ZAddress("y")).__zType).toEqual("ZNumber");
  expect(store.compute(ZAddress("y")).value).toEqual(12);
});

test("Equality primitives", () => {
  const store = new ZStore({
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
  const store = new ZStore({
    x: ZNumber(42),
    y: ZNumber(5),
    a: ZSum(ZAddress("x"), ZNumber(0)),
    b: ZSum(ZAddress("x"), ZAddress("y"))
  });
  expect(
    store.compute(ZSum(ZNumber(2), ZNumber(0))).dependencies.length
  ).toEqual(0);
  expect(store.compute(ZSum(ZNumber(2), ZNumber(0))).value).toEqual(2);
  expect(
    store.compute(ZSum(ZNumber(0.2), ZAddress("x"))).dependencies.length
  ).toEqual(1);
  expect(
    store.compute(ZSum(ZNumber(0.2), ZAddress("x"))).dependencies[0].address
  ).toEqual("x");
  expect(store.compute(ZSum(ZNumber(0.2), ZAddress("x"))).value).toEqual(42.2);
  expect(store.compute(ZAddress("a")).value).toEqual(42);
  expect(store.compute(ZAddress("a")).dependencies.length).toEqual(2);
  expect(store.compute(ZAddress("a")).dependencies[0].address).toEqual("x");

  expect(store.compute(ZAddress("b")).value).toEqual(47);
  expect(store.compute(ZAddress("b")).dependencies.length).toEqual(3);
  expect(store.compute(ZAddress("b")).dependencies).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ address: "b" }),
      expect.objectContaining({ address: "x" }),
      expect.objectContaining({ address: "y" })
    ])
  );
});

test("Watching sums", () => {
  const store = new ZStore({
    x: ZNumber(42),
    y: ZNumber(5),
    a: ZSum(ZAddress("x"), ZNumber(0.1)),
    b: ZSum(ZAddress("x"), ZAddress("y"))
  });
  expect(store.compute(ZSum(ZNumber(2), ZNumber(0))).value).toEqual(2);
  expect(store.compute(ZSum(ZNumber(0.2), ZAddress("x"))).value).toEqual(42.2);
  expect(store.compute(ZAddress("a")).value).toEqual(42.1);
  expect(store.compute(ZAddress("b")).value).toEqual(47);
  const myWatcher = jest.fn();
  const removeWatch = store.watchComputed(ZAddress("a"), myWatcher).remove;
  expect(myWatcher.mock.calls[0][0].value).toEqual(42.1);
  expect(myWatcher.mock.calls.length).toEqual(1);
  store.mutate(ZAddress("x"), ZNumber(5));
  expect(myWatcher.mock.calls[1][0].value).toEqual(5.1);
  expect(myWatcher.mock.calls.length).toEqual(2);
  store.mutate(ZAddress("x"), ZNumber(5));
  expect(myWatcher.mock.calls.length).toEqual(2);
  expect(store.compute(ZAddress("a")).value).toEqual(5.1);
  removeWatch();
  store.mutate(ZAddress("x"), ZNumber(42));
  expect(store.compute(ZAddress("a")).value).toEqual(42.1);
  expect(myWatcher.mock.calls.length).toEqual(2);
});

test("Basic type errors", () => {
  const store = new Store();
  expect(store.validate(ZString("a"), ZString())).toBeNull();
  expect(store.validate(ZString("a"), ZNumber())).toEqual("is not a ZNumber");
  expect(store.validate(ZNumber(12), ZNumber())).toBeNull();
  expect(store.validate(ZNumber(12), ZString())).toEqual("is not a ZString");
});

test("Referrential type errors", () => {
  const store = new ZStore({
    name: ZString(),
    age: ZNumber(),
    tommysAge: ZNumber(5)
  });
  expect(store.validate(ZAddress("tommysAge"), ZAddress("age"))).toBeNull();
  expect(store.validate(ZAddress("tommysAge"), ZAddress("name"))).toEqual(
    "is not a ZString"
  );
});

test("Sum type errors", () => {
  const store = new ZStore({
    x: ZNumber(42),
    y: ZNumber(5),
    a: ZSum(ZAddress("x"), ZAddress("y"))
  });
  expect(store.validate(ZAddress("a"), ZNumber())).toBeNull();
  const computedResult = store.compute(ZSum(ZString("a"), ZString("a")));
  expect(computedResult.value).toEqual(null);
  const validationError = store.validate(ZSum(ZString("a"), ZString("a")));
  expect(validationError).toEqual("cannot a non-number to something");
});

test("Or validation", () => {
  const store = new ZStore({
    x: ZNumber(),
    y: ZString("Foo"),
    a: ZOr(ZAddress("x"), ZAddress("y"))
  });
  expect(store.validate(ZString("asdf"), ZOr(ZNumber(), ZString()))).toBeNull();
  expect(store.validate(ZString(), ZOr(ZNumber(42), ZString()))).toBeNull();
  expect(store.validate(ZNumber(42), ZOr(ZNumber(42), ZString()))).toBeNull();
  expect(store.validate(ZNumber(5), ZOr(ZNumber(42), ZString()))).toEqual(
    "does not match '42' and is not a ZString"
  );
  expect(
    store.validate(ZOr(ZString("foo"), ZString("bar")), ZString())
  ).toBeNull();
  expect(store.validate(ZAddress("y"), ZAddress("a"))).toBeNull();
  expect(store.validate(ZNumber(3), ZAddress("a"))).toBeNull();
  expect(store.validate(ZString("Foo"), ZAddress("a"))).toBeNull();
  expect(store.validate(ZString("asdf"), ZAddress("a"))).toEqual(
    "is not a ZNumber and does not match 'Foo'"
  );
});

test.skip("Objects", () => {
  const store = new ZStore({
    lucy: ZObject({
      name: ZString("Lucy")
    }),
    lucyWithAge: ZObject(ZAddress("lucy"), {
      age: ZNumber(25)
    })
  });

  expect(store.validate(ZString(), ZOr(ZNumber(42), ZString()))).toBeNull();

  const computedResult = store.compute(ZAddress("lucyWithAge"));
  expect(computedResult.value).toEqual(
    expect.objectContaining({
      name: expect.objectContaining({ value: "Lucy" }),
      age: expect.objectContaining({ value: 25 })
    })
  );
});
