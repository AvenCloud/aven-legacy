/**
 * @flow
 */

import { Component } from "react";
import PropTypes from "prop-types";

export default function ZConnect(ZComponent) {
  const zedGetter = ZComponent.getZed;
  class ZConnector extends Component {
    static contextTypes = {
      store: PropTypes.any.isRequired
    };
    subs: ?{ remove: () => void } = null;
    componentWillUnmount() {
      this.subs && this.subs.remove();
    }
    getChildContext() {
      return this.props.store;
    }
    state = {
      zed: zedGetter(this.props)
    };
    render() {
      return <ZComponent {...this.props} zed={this.state.zed} />;
    }
  }
  return ZConnector;
}
