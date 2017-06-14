/**
 * @flow
 */

import { Component } from "react";
import PropTypes from "prop-types";

export default class ZProvider extends Component {
  static childContextTypes = {
    store: PropTypes.any.isRequired
  };
  getChildContext() {
    return {
      store: this.props.store
    };
  }
  render() {
    return this.props.children;
  }
}
