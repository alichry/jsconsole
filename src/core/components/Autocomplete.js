import React, { Component } from 'react';
import '../jsconsole.module.css';

class Autocomplete extends Component {
  render() {
    return (
      <div styleName="Autocomplete">
        <span styleName="matching">doc</span>
        <span styleName="preview">ument</span>
      </div>
    );
  }
}

export default Autocomplete;
