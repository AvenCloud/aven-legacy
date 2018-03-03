({ Platform, _npm_js_cookie }) => {
  let get = key => {};
  let set = (key, val) => {};
  let remove = key => {};
  if (Platform.webBrowser) {
    get = key => _npm_js_cookie.get(key);
    set = (key, val) => _npm_js_cookie.set(key, val);
    remove = key => _npm_js_cookie.remove(key);
  }
  return { get, set };
};
