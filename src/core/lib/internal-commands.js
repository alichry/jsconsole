import isUrl from 'is-url';

const version = process.env.REACT_APP_VERSION;
const API = process.env.REACT_APP_API || '';

// Missing support
// :load <url> - to inject new DOM

const credits = 'Built by <a href="https://twitter.com/rem" target="_blank">@rem</a> • <a href="https://github.com/remy/jsconsole" target="_blank">open source</a> • <a href="https://www.paypal.me/rem/9.99usd" target="_blank">donate</a>';

export class InternalCommand {
  /**
   * @typedef {string}
   */
  #id;

  /**
   * @typedef {boolean}
   */
  #hidden;
  /**
   * @typedef {string}
   */
  #description;

  /**
   * @typedef {boolean}
   */
  #parseArgs;

  /**
   * @typedef {Object} CommandInput
   * @property {any} args
   * @property {CommandContext} context
   *
   * @typedef {string | import("../components/Console").ConsoleCommand} CommandOutput
   * @typedef {(input: CommandInput) => CommandOutput} CommandFn
   * @type {CommandFn}
   */
  #fn;

  /**
   * @typedef {Object} CommandOptions
   * @property {string} id
   * @property {string} description
   * @property {boolean?} hidden
   * @property {boolean?} parseArgs - default is true
   *
   * @param {CommandOptions} opts
   * @param {CommandFn} fn
   */
  constructor(opts, fn) {
    this.#id = opts.id;
    this.#description = String(opts.description);
    this.#hidden = Boolean(opts.hidden);
    this.#parseArgs = opts.parseArgs === undefined ? true : Boolean(opts.parseArgs);
    this.#fn = fn;
  }

  get id() {
    return this.#id;
  }

  get hidden() {
    return this.#hidden;
  }

  get description() {
    return this.#description;
  }

  get parseArgs() {
    return this.#parseArgs;
  }

  /**
   * @param {InternalCommandRunner} runner
   * @param {CommandInput} input
   * @return {CommandOutput}
   */
  execute(runner, input) {
    return this.#fn.apply({
      execute: runner.execute.bind(runner)
    }, [input]);
  }
}

class HelpCommand extends InternalCommand {
  constructor(otherCommands) {
    const lines = otherCommands
      .filter(({ hidden }) => !hidden)
      .map(({ id, description }) => `:${id} ${description}`)
      .join('\n');
    const result = {
      html: true,
      value: `${lines}
copy(<value>) and $_ for last value

${credits}
`
    };
    super({ id: 'help', hidden: true }, () => result);
  }
}

const defaultCommands = [
  new InternalCommand({ id: 'welcome', hidden: true }, () => ({
    value: `Use <strong>:help</strong> to show jsconsole commands
  version: ${version}`,
    html: true,
  })),

  new InternalCommand({ id: 'about', description: '' }, () => ({
    value: credits,
    html: true,
  })),

  new InternalCommand({ id: 'load', description: '&lt;script_url&gt; load also supports shortcuts to the default file of any npm package, like `:load jquery`' }, async ({ args: urls, context: { console, app } }) => {
    const document = app.inst.getContainer().contentDocument;
    urls.forEach(url => {
      if (url === 'datefns') url = 'date-fns'; // Backwards compatibility
      url = isUrl(url) ? url : `https://cdn.jsdelivr.net/npm/${url}`;
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => console.log(`Loaded ${url}`);
      script.onerror = () => console.warn(`Failed to load ${url}`);
      document.body.appendChild(script);
    });
    return 'Loading script…';
  }),
  
  new InternalCommand({ id: 'set', hidden: true }, async ({ args: [key, value], context: { app } }) => {
    switch (key) {
      case 'theme':
        if (['light', 'dark'].includes(value)) {
          app.props.setTheme(value);
        }
        break;
      case 'layout':
        if (['top', 'bottom'].includes(value)) {
          app.props.setLayout(value);
        }
        break;
      default:
    }
  }),

  new InternalCommand({ id: 'theme', description: 'dark|light' }, async ({ args: [theme], context: { app } }) => {
    if (['light', 'dark'].includes(theme)) {
      app.props.setTheme(theme);
      return;
    }

    return 'Try ":theme dark" or ":theme light"';
  }),

  new InternalCommand({ id: 'history', description: '' }, async ({ context: { app }, args: [n = null] }) => {
    const history = app.context.store.getState().history;
    if (n === null) {
      return history.map((item, i) => `${i}: ${item.trim()}`).join('\n');
    }

    n = parseInt(n, 10);
    // try to re-issue the historical command
    const command = history.find((item, i) => i === n);
    if (command) {
      app.onRun(command);
    }
  
    return;
  }),
  
  new InternalCommand({ id: 'clear', description: '' }, ({ console }) => {
    console.clear();
  }),

  new InternalCommand({ id: 'listen', description: '[id] - starts remote debugging session' }, async ({ args: [id], context: { console: internalConsole } }) => {
    // create new eventsocket
    const res = await fetch(`${API}/remote/${id || ''}`);
    id = await res.json();
  
    return new Promise(resolve => {
      const sse = new EventSource(`${API}/remote/${id}/log`);
      sse.onopen = () => {
        resolve(
          `Connected to "${id}"\n\n<script src="${
            window.location.origin
          }/js/remote.js?${id}"></script>`
        );
      };
  
      sse.onmessage = event => {
        console.log(event);
        const data = JSON.parse(event.data);
        if (data.response) {
          if (typeof data.response === 'string') {
            internalConsole.log(data.response);
            return;
          }
  
          const res = data.response.map(_ => {
            if (_.startsWith('Error:')) {
              return new Error(_.split('Error: ', 2).pop());
            }
  
            if (_ === 'undefined') {
              // yes, the string
              return undefined;
            }
  
            return JSON.parse(_);
          });
          internalConsole.log(...res);
        }
      };
  
      sse.onclose = function () {
        internalConsole.log('Remote connection closed');
      };
    });
  }),

  new InternalCommand({
    id: 'multiline',
    description: ' ',
    parseArgs: false
  }, async ({ args, context: { app, console: internalConsole }}) => {
    args = '\n' + args;
    const blocks = args.split(/(?<!\\)\r?\n[\s]*:/);
    for (let i = 0; i < blocks.length; i++) {
      let block = blocks[i];
      if (block.length === 0) {
        continue;
      }
      if (i > 0) {
        block = ':' + block;
      }
      await app.onRun(block);
    }
  }),

  new InternalCommand({ id: 'version', description: '' }, () => version)
];

export class InternalCommandRunner {
  #context;
  /**
   * @type {Record<string, InternalCommand>}
   */
  #cmds;

  /**
   * @typedef {Object} CommandContext
   * @property {import("../components/App")} app
   * @property {import("../components/Console")} console
   *
   * @typedef {Object} InternalCommandRunnerOptions
   * @property {InternalCommand[]} extraCommands
   * @property {CommandContext} context
   *
   * @param {InternalCommandRunnerOptions} ctx
   */
  constructor({ context, extraCommands = [] }) {
    this.#context = {
      app: context.app,
      console: context.console
    };
    this.#cmds = {};
    const allCommands = [...extraCommands, ...defaultCommands];
    allCommands.forEach(cmd => {
      this.#cmds[cmd.id] = cmd;
    });
    const helpCommand = new HelpCommand(allCommands);
    this.#cmds[helpCommand.id] = helpCommand;
  }

  get context() {
    return { ...this.#context };
  }

  /**
   * @param {string} cmdName
   * @param {string | undefined} args
   */
  async execute(cmdName, args) {
    if (/^\d+$/.test(cmdName)) {
      args = cmdName;
      cmdName = 'history';
    }

    const cmd = this.#cmds[cmdName];
    if (! cmd) {
      throw new Error(`No such jsconsole command "${cmdName}"`);
    }


    let res = await cmd.execute(this, {
      args: cmd.parseArgs && args !== undefined ? args.split(' ') : args,
      context: this.context
    });

    if (typeof res === 'string') {
      res = { value: res };
    }

    return res;
  }
}
