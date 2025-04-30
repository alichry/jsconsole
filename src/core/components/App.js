import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../utils/joinClassName';

import Console from './Console';
import Input from '../containers/Input';

import { Instance } from '../lib/run';
import { InternalCommandRunner, InternalCommand } from '../lib/internal-commands';
import '../jsconsole.module.css';

// this is lame, but it's a list of key.code that do stuff in the input that we _want_.
const doStuffKeys =
  /^(Digit|Key|Num|Period|Semi|Comma|Slash|IntlBackslash|Backspace|Delete|Enter)/;

class App extends Component {
  constructor(props) {
    super(props);
    this.inst = new Instance({ environment: props.environment });
    this.onRun = this.onRun.bind(this);
    this.triggerFocus = this.triggerFocus.bind(this);
  }

  async onRun(command) {
    if (command[0] !== ':') {
      this.console.push({
        type: 'command',
        command,
        value: command,
      });
      const res = await this.inst.run(command);
      this.console.push({
        command,
        type: 'response',
        ...res,
      });
      return;
    }

    let [cmd, ...args] = command.slice(1).split(' ');
    let res;
    try {
      res = await this.internalCommands.execute(cmd, args);
    } catch (e) {
      this.console.push({
        command,
        error: true,
        value: e,
        type: 'response'
      });
      return;
    }
    if (res !== undefined) {
      this.console.push({
        command,
        type: 'log',
        ...res,
      });
    }
  }

  componentDidMount() {
    this.inst.createContainer();
    this.inst.bindConsole(this.console);
    this.internalCommands = new InternalCommandRunner({
      context: {
        app: this,
        console: this.console
      },
      extraCommands: this.props.extraCommands || []
    });
    const query = decodeURIComponent(window.location.search.substr(1));
    if (query) {
      this.onRun(query);
    } else {
      this.onRun(':welcome');
    }
  }

  triggerFocus(e) {
    if (e.target.nodeName === 'INPUT') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.code && !doStuffKeys.test(e.code)) return;

    this.input.focus();
  }

  render() {
    const { theme, layout } = this.props;

    return (
      <div
        tabIndex="-1"
        onKeyDown={this.triggerFocus}
        ref={e => (this.app = e)}
        className={this.props.className}
        styleName={cn(
          'App',
          theme ? `theme-${theme}` : undefined,
          layout
        )}
      >
        <Console
          ref={e => (this.console = e)}
          reverse={layout === 'top'}
        />
        <Input
          inputRef={e => (this.input = e)}
          onRun={this.onRun}
          autoFocus={window.top === window}
          onClear={() => {
            this.console.clear();
          }}
        />
      </div>
    );
  }
}

App.propTypes = {
  className: PropTypes.string,
  environment: PropTypes.oneOf(['iframe', 'top-level']),
  extraCommands: PropTypes.arrayOf(function(propValue, key, componentName, location, propFullName) {
    const item = propValue[key];
    if (!(item instanceof InternalCommand)) {
      return new Error(
        'Invalid prop `' + propFullName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
  })
};

App.contextTypes = { store: PropTypes.object };

export default App;
