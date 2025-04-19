import React, { Component } from 'react';
import Entry from './EntryType';
import zip from 'lodash/zip';
import flatten from 'lodash/flatten';
import '../../jsconsole.module.css';

class SetType extends Component {
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
    const { value, shallow = true } = this.props;
    const { open } = this.state;
    let { displayName } = this.props;

    if (!displayName) {
      displayName = value.constructor ? value.constructor.name : 'Object';
    }

    let length = value.size;

    if (shallow && !open) {
      return (
        <div styleName="type ArrayType closed" onClick={this.toggle}>
          <em>{displayName}</em>
          <span styleName="arb-info">({length})</span>
        </div>
      );
    }

    let types = [];
    let i = 0;

    for (let entry of value.entries()) {
      types.push(
        <Entry
          key={`setTypeKey-${i + 1}`}
          shallow={true}
          value={entry}
          allowOpen={open}
        />
      );
      i++;
      if (!open && i === 10) {
        break;
      }
    }

    if (!open && length > 10) {
      types.push(
        <span key="setTypeMore-0" className="more" styleName="arb-info">
          …
        </span>
      );
    }

    if (!open) {
      // intersperce with commas
      types = flatten(
        zip(
          types,
          Array.from({ length: length - 1 }, (n, i) => (
            <span key={`sep-${i}`} styleName="sep">
              ,
            </span>
          ))
        )
      );

      // do mini output
      return (
        <div className="set" styleName="type closed" onClick={this.toggle}>
          <em>{displayName}</em>
          <span styleName="arb-info">({length})</span>
          <span> {'{'} </span>
          {types.map((type, i) => (
            <div styleName="key-value" key={`subtype-${i}`}>
              {type}
            </div>
          ))}
          <span> {'}'}</span>
        </div>
      );
    }

    return (
      <div className="set" styleName="type" onClick={this.toggle}>
        <em>{displayName}</em>
        <span styleName="arb-info">({length})</span>
        <span> {'{'} </span>
        <div styleName="group">
          <span styleName="arb-info">[[Entries]]:</span>
          {types.map((type, i) => (
            <div styleName="key-value" key={`subtype-${i}`}>
              <span styleName="index">{i}:</span>
              {type}
            </div>
          ))}
        </div>
        <span> {'}'}</span>
      </div>
    );
  }
}

export default SetType;
