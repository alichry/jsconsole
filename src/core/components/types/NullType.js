import React, { Component } from 'react';
import '../../jsconsole.module.css';

class NullType extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div styleName="type null">null</div>;
  }
}

export default NullType;
