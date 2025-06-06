import React, { Component } from 'react';
import which from '../../lib/which-type';
import '../../jsconsole.module.css';

class PromiseType extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);

    this.state = {
      open: props.open,
      promiseValue: undefined,
      status: 'pending',
    };
  }

  async toggle(e) {
    if (!this.props.allowOpen) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    const open = !this.state.open;

    if (open) {
      // update promise value
      const { promiseValue, status } = await this.updatePromiseState();
      return this.setState({ promiseValue, status, open });
    }

    this.setState({ open });
  }

  async updatePromiseState() {
    let promiseValue = undefined;
    let status = 'pending';

    const flag = Math.random();
    try {
      promiseValue = await Promise.race([
        this.props.value,
        new Promise(resolve => setTimeout(() => resolve(flag), 10)),
      ]);

      if (promiseValue !== flag) {
        status = 'resolved';
      } else {
        promiseValue = undefined;
      }
    } catch (e) {
      promiseValue = e;
      status = 'rejected';
    }

    return {
      promiseValue,
      status,
    };
  }

  async componentDidMount() {
    const { promiseValue, status } = await this.updatePromiseState();
    this.setState({ promiseValue, status });
  }

  render() {
    const { filter } = this.props;
    const { open, promiseValue, status } = this.state;

    const Value = which(promiseValue);

    if (!open) {
      return (
        <div onClick={this.toggle} className="entry" styleName="type closed">
          <em>Promise</em>
          {'{ '}
          <div className="object-item" styleName="key-value">
            <span styleName="key">[[PromiseStatus]]:</span>
            <span className="value">{status}</span>
          </div>
          <span styleName="arb-info">, </span>
          <div className="object-item" styleName="key-value">
            <span styleName="key">[[PromiseValue]]:</span>
            <span className="value">
              <Value
                filter={filter}
                shallow={true}
                allowOpen={open}
                value={promiseValue}
              />
            </span>
          </div>
          {' }'}
        </div>
      );
    }

    return (
      <div onClick={this.toggle} className="promise" styleName="type">
        <div styleName="header">
          <em>Promise</em>
          <span>{'{'}</span>
        </div>
        <div styleName="group">
          <div className="object-item" styleName="key-value">
            <span styleName="key">[[PromiseStatus]]:</span>
            <span className="value">{status}</span>
          </div>
          <div className="object-item" styleName="key-value">
            <span styleName="key">[[PromiseValue]]:</span>
            <span className="value">
              <Value
                filter={filter}
                shallow={true}
                allowOpen={open}
                value={promiseValue}
              />
            </span>
          </div>
        </div>
        <span>{'}'}</span>
      </div>
    );
  }
}

export default PromiseType;
