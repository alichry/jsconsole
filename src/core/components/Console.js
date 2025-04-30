import React, { Component } from 'react';
import Line from './Line';
import '../jsconsole.module.css';
import { nativeConsoleProxy } from '../lib/run';

let guid = 0;
const getNext = () => guid++;

function AssertError(message) {
  this.name = 'Assertion fail';
  this.message = message;
  this.stack = new Error().stack;
}

AssertError.prototype = new Error();

function interpolate(...args) {
  let [string, ...rest] = args;
  let html = false;

  if (typeof string === 'string' && string.includes('%') && rest.length) {
    string = string.replace(
      /(%[scdif]|%(\d*)\.(\d*)[dif])/g,
      (all, key, width = '', dp) => {
        // NOTE: not supporting Object type

        if (key === '%s') {
          // string
          return rest.shift();
        }

        if (key === '%c') {
          html = true;
          return `</span><span style="${rest.shift()}">`;
        }

        const value = rest.shift();
        let res = null;

        if (key.substr(-1) === 'f') {
          if (isNaN(parseInt(dp, 10))) {
            res = value;
          } else {
            res = value.toFixed(dp);
          }
        } else {
          res = parseInt(value, 10);
        }

        if (width === '') {
          return res;
        }

        return res.toString().padStart(width, ' ');
      }
    );

    if (html) {
      string = `<span>${string}</span>`;
    }

    args = [string, ...rest];
  }

  return { html, args };
}

/**
 * @typedef {Object} ConsoleCommand
 */
class Console extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commands: (props.commands || []).reduce((acc, curr) => {
        acc.push([[getNext(), curr]]);
        return acc;
      }, [])
    };
    Object.keys(this).forEach(prop => {
      const value = this[prop];
      if (typeof value !== 'function') {
        return;
      }
      this[prop] = (...args) => {
        try {
          value.apply(this, args);
        } catch (e) {
          nativeConsoleProxy.error(`JSConsoleError: ${typeof e === 'object' && e.message || String(e)}`);
          nativeConsoleProxy.error(e);
        }
      };
    });
  }

  push(command) {
    const next = getNext();
    this.setState({
      commands: this.state.commands.concat([[next, command]])
    });
  };

  clear = () => {
    this.setState({ commands: [] });
  };

  error = (...rest) => {
    const { html, args } = interpolate(...rest);
    this.push({
      error: true,
      html,
      value: args,
      type: 'log',
    });
  };

  assert = (test, ...rest) => {
    // intentional loose assertion test - matches devtools
    if (!test) {
      let msg = rest.shift();
      if (msg === undefined) {
        msg = 'console.assert';
      }
      rest.unshift(new AssertError(msg));
      this.push({
        error: true,
        value: rest,
        type: 'log',
      });
    }
  };

  dir = (...rest) => {
    const { html, args } = interpolate(...rest);

    this.push({
      value: args,
      html,
      open: true,
      type: 'log',
    });
  };

  warn = (...rest) => {
    const { html, args } = interpolate(...rest);
    this.push({
      error: true,
      level: 'warn',
      html,
      value: args,
      type: 'log',
    });
  };

  debug = (...args) => this.log(...args);
  info = (...args) => this.log(...args);

  log = (...rest) => {
    const { html, args } = interpolate(...rest);

    this.push({
      value: args,
      html,
      type: 'log',
    });
  };

  render() {
    const { commands = [] } = this.state || {};
    return (
      <div
        className="react-console-container"
        onClick={e => {
          e.stopPropagation(); // prevent the focus on the input element
        }}
      >
        {commands.map((_, index) => {
          if (this.props.reverse) {
            index = commands.length - 1 - index;
          }
          const [key, code] = commands[index];
          return <Line key={`line-${key}`} {...code} />;
        })}
      </div>
    );
  };
}

export default Console;
