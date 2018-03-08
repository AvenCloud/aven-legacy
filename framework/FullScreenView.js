({ View, Platform, React, StyleSheet }) => {
  if (Platform.web) {
    return ({ children, style }) => (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          position: "relative",
          ...StyleSheet.flatten(style),
        }}
      >
        {children}
      </div>
    );
  } else {
    return ({ children, style }) => <View style={[style]}>{children}</View>;
  }
};
