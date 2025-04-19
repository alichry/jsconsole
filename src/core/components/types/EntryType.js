import React, { Component } from 'react';
import which from '../../lib/which-type';
import '../../jsconsole.module.css';

class EntryType extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);

    this.state = {
      open: props.open,
    };
  }

  toggle(e) {
    if (!this.props.allowOpen) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    this.setState({ open: !this.state.open });
  }

  render() {
    // const { shallow = true } = this.props;
    const entry = this.props.value;
    const { open } = this.state;

    const [key, value] = entry;

    const Key = which(key);
    const Value = which(value);

    if (!open) {
      return (
        <div onClick={this.toggle} className="entry" styleName="type closed">
          <div className="object-item" styleName="key-value">
            <span styleName="key">
              <Key allowOpen={open} value={key} />
            </span>
            <span styleName="arb-info">=> </span>
            <span className="value">
              <Value allowOpen={open} value={value} />
            </span>
          </div>
        </div>
      );
    }

    return (
      <div onClick={this.toggle} className="entry" styleName="type">
        <span>{'{'}</span>
        <div styleName="group">
          <div className="object-item" styleName="key-value">
            <span styleName="key">key:</span>
            <span className="value">
              <Key allowOpen={open} value={key} />
            </span>
          </div>
          <div className="object-item" styleName="key-value">
            <span styleName="key">value:</span>
            <span className="value">
              <Value allowOpen={open} value={value} />
            </span>
          </div>
        </div>
        <span>{'}'}</span>
      </div>
    );
  }
}

export default EntryType;
