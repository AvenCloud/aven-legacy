({ _npm_react_fontawesome, React, View }) => {
  if (_npm_react_fontawesome) {
    const FA = _npm_react_fontawesome;
    return ({ name, color }) => (
      <span
        style={{ color }}
        className={`fa fa-${name} fa-2x`}
        aria-hidden="true"
      />
    );
  }
  return () => null;
};
