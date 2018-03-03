({
  React,
  Platform,
  _npm_react_native,
  _npm_react_native_web,
  BrowserHistory,
}) => {
  let Link = {};
  if (_npm_react_native) {
    Link = _npm_react_native.Text;
  }
  if (Platform.web) {
    Link = ({ children, to }) => (
      <a
        href={to}
        onClick={e => {
          e.preventDefault();
          Link.goTo(to);
        }}
      >
        {children}
      </a>
    );
  }
  Link.goTo = destPath => {
    if (Platform.web) {
      BrowserHistory.push(destPath);
    } else {
      // tood
    }
  };
  return Link;
};
