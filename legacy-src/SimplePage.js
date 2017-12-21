import React from "react";

export default class SimplePage extends React.Component {
  render() {
    return (
      <div style={{}}>
        <div
          style={{
            backgroundImage: `url('/assets/aven-forest.jpg')`,
            filter: "blur(15px)",
            backgroundSize: "cover",
            position: "fixed",
            left: -15,
            right: -15,
            bottom: -15,
            top: -15,
            zIndex: 0
          }}
        />
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            backgroundColor: "rgba(255,255,255,0.7)",
            zIndex: 1
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            zIndex: 2
          }}
        >
          <div
            style={{
              width: 300,
              margin: "60px auto",
              alignItems: "stretch",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <a href="/" style={{ textAlign: "center" }}>
              <img
                src="/assets/aven.svg"
                style={{ width: 128, marginBottom: 60 }}
              />
            </a>
            <div className="well" style={{ paddingTop: 0 }}>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
