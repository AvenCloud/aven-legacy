import React from "react";
import SimplePage from "./SimplePage";

class PhoneVerification extends React.Component {
  render() {
    if (!this.props.verifiedPhone) {
      return <h3>You have not verified a phone number</h3>;
    }
    return <h3>Phone: {this.props.verifiedPhone}</h3>;
  }
}
class EmailVerification extends React.Component {
  render() {
    if (!this.props.verifiedEmail) {
      return <h3>You have not verified an email address</h3>;
    }
    return <h3>Email: {this.props.verifiedEmail}</h3>;
  }
}
class Verification extends React.Component {
  render() {
    const { verifiedEmail, verifiedPhone } = this.props.user;
    return (
      <div>
        <h3>Identify Verification</h3>
        <EmailVerification verifiedEmail={verifiedEmail} />
        <PhoneVerification verifiedPhone={verifiedPhone} />
      </div>
    );
  }
}

export default class AccountPage extends React.Component {
  static load = async (props, dispatch) => {
    const user = await dispatch({
      type: "GetProfileAction"
    });
    return { user };
  };
  static getTitle = () => "My Account";
  render() {
    return (
      <SimplePage>
        <h1>Account settings of {auth.user}</h1>
        <Verification user={data.user} />

      </SimplePage>
    );
  }
}
