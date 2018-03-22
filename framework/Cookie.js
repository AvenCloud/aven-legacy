({ Platform, _npm_js_cookie }) => {
  let get = key => {};
  let set = (key, val) => {};
  let remove = key => {};
  if (Platform.webBrowser) {
    (get = key => {
      const val = _npm_js_cookie.get(key);
      if (val) {
        return JSON.parse(val);
      }
      return val;
    }),
      (set = (key, val) => _npm_js_cookie.set(key, JSON.stringify(val)));
    remove = key => _npm_js_cookie.remove(key);
  }
  return { get, set };
};
