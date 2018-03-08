({
  React,
  Platform,
  _npm_react_native,
  _npm_react_native_web,
  BrowserHistory,
  StyleSheet,
}) => {
  let Link = {};
  if (_npm_react_native) {
    Link = _npm_react_native.Text;
  }
  if (Platform.web) {
    Link = ({ children, to, style }) => (
      <a
        href={to}
        style={{ textDecoration: "none", ...StyleSheet.flatten(style) }}
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
      if (
        destPath.substr(0, 8) === "https://" ||
        destPath.substr(0, 7) === "http://" ||
        destPath.substr(0, 7) === "mailto:"
      ) {
        window.location = destPath;
        return;
      }
      BrowserHistory.push(destPath);
    } else {
      // tood
    }
  };
  return Link;
};
