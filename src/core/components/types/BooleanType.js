import React, { Component } from 'react';
import '../../jsconsole.module.css';

class BooleanType extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { value } = this.props;
    return <div styleName="bool type">{value ? 'true' : 'false'}</div>;
  }
}

export default BooleanType;
