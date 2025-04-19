import React, { Component } from 'react';
import zip from 'lodash/zip';
import flatten from 'lodash/flatten';
import which from '../../lib/which-type';
import '../../jsconsole.module.css';

class ArrayType extends Component {
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
    const { value, shallow = true, filter = null } = this.props;
    const { open } = this.state;

    let length = value.length;

    if (shallow && !open) {
      return (
        <div styleName="type ArrayType closed" onClick={this.toggle}>
          <em>Array</em>
          <span styleName="arb-info">({length})</span>
        </div>
      );
    }

    let types = value.slice(0, open ? value.length : 10).map((_, i) => {
      const Type = which(_);
      return (
        <Type
          allowOpen={open}
          key={`arrayType-${i + 1}`}
          shallow={true}
          value={_}
        >
          {_}
        </Type>
      );
    });

    // expose holes in the collapsed mode
    if (!open) {
      let count = 0;
      const newTypes = [];
      for (let i = 0; i < types.length; i++) {
        const hole = !(i in types);

        if (count !== 0 && !hole) {
          newTypes.push(
            <span key={`hole-${i}`} styleName="arb-info">
              &lt;undefined × {count}&gt;
            </span>
          );
          count = 0;
        } else if (hole) {
          count++;
        }

        if (!hole) {
          newTypes.push(types[i]);
        }
      }

      // if there are holes at the end
      if (count !== 0) {
        newTypes.push(
          <span key={`hole-${types.length}`} styleName="arb-info">
            &lt;undefined × {count}&gt;
          </span>
        );
      }

      types = newTypes;
    }

    if (!open && value.length > 10) {
      types.push(
        <span
          key="arrayType-0"
          className="more"
          styleName="arb-info">
          …
        </span>
      );
    }

    if (!open) {
      // intersperce with commas
      types = flatten(
        zip(
          types,
          Array.from({ length: types.length - 1 }, (n, i) => (
            <span key={`sep-${i}`} styleName="sep">
              ,
            </span>
          ))
        )
      );

      // do mini output
      return (
        <div styleName="type ArrayType closed" onClick={this.toggle}>
          <em>Array</em>
          <span styleName="arb-info">({length})</span>[ {types} ]
        </div>
      );
    }

    // this is the full output view
    return (
      <div styleName="type ArrayType">
        <div onClick={this.toggle} styleName="header">
          <em>Array</em>
          <span styleName="arb-info">({length})</span>[
        </div>
        <div styleName="group">
          {types.map((type, i) => {
            if (
              filter === null ||
              filter === undefined ||
              filter === '' ||
              (value[i] + '').toLowerCase().includes(filter)
            ) {
              return (
                <div styleName="key-value" key={`subtype-${i}`}>
                  <span styleName="index">{i}:</span>
                  {type}
                </div>
              );
            }

            return null;
          })}
        </div>
        ]
      </div>
    );
  }
}

export default ArrayType;
