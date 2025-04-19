import React, { Component } from 'react';
import '../../jsconsole.module.css';

class NumberType extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { value } = this.props;
    return <div styleName="type number">{value}</div>;
  }
}

export default NumberType;
