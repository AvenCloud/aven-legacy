import React from "react";

class EmailPhoneThing extends React.Component {
  render() {
    return (
      <div>
        <div className="form-group" key={this.props.name}>
          <label className="control-label" for={this.props.name}>
            {this.props.label}
          </label>
          <input
            className="form-control"
            id={this.props.name}
            placeholder={this.props.placeholder}
            name={this.props.name}
            type="text"
          />
        </div>
      </div>
    );
  }
}

const SmallFormPage = ({ children }) =>
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
        <div className="well" style={{}}>
          {children}
        </div>
      </div>
    </div>
  </div>;

export default function CreateSmallFormPage(opts) {
  class FormPage extends React.Component {
    static successNavigationAction = opts.successNavigationAction;
    static getActionForInput = opts.getActionForInput;
    static getTitle = () => opts.title;
    static validate = opts.validate;
    render() {
      const { validationError, input } = this.props;
      return (
        <SmallFormPage>
          <form method="post">
            <h1 style={{ position: "relative", bottom: 15 }}>
              {opts.heading}
            </h1>
            {opts.subheadingText &&
              <p style={{ marginTop: -10, marginBottom: 30 }}>
                {opts.subheadingText}
              </p>}
            {opts.inputs.map((inputConfig, inputIndex) => {
              if (inputConfig.type === "email-phone-signup") {
                return (
                  <EmailPhoneThing key="email-phone-signup" {...inputConfig} />
                );
              }
              if (inputConfig.hidden && input[inputConfig.name] != null) {
                return (
                  <input
                    key={inputConfig.name}
                    id={inputConfig.name}
                    name={inputConfig.name}
                    type="hidden"
                    value={input[inputConfig.name]}
                  />
                );
              }
              return (
                <div
                  className="form-group"
                  key={inputConfig.name}
                  style={{ marginBottom: 40 }}
                >
                  {inputConfig.label &&
                    <label className="control-label" for={inputConfig.name}>
                      {inputConfig.label}
                    </label>}
                  <input
                    onChange={() => {}}
                    className="form-control"
                    id={inputConfig.name}
                    name={inputConfig.name}
                    placeholder={inputConfig.placeholder}
                    type={inputConfig.type}
                    value={input[inputConfig.name]}
                  />
                  {inputConfig.rightLabel &&
                    <span
                      className="control-label-right"
                      style={{ marginTop: 5 }}
                    >
                      {inputConfig.rightLabel(input)}
                    </span>}
                </div>
              );
            })}

            {validationError &&
              <div className="alert alert-dismissible alert-danger">
                <a type="button" className="close" data-dismiss="alert" href="">
                  ×
                </a>
                <strong>Whoops!</strong> {validationError}
              </div>}

            <div
              className="form-group"
              style={{ position: "relative", top: 10 }}
            >
              <div
                className="input-group"
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column"
                }}
              >
                <button className="btn btn-primary btn-lg">
                  {opts.submitButtonLabel}
                </button>

              </div>
            </div>

          </form>
        </SmallFormPage>
      );
    }
  }
  return FormPage;
}
