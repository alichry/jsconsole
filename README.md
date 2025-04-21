# jsconsole(2)

[@remy/jsconsole](https://github.com/remy/jsconsole) provides an interactive
JavaScript console. This fork provides reusable React components with scoped CSS.

## End-user Usage

If you simply want to use an interactive JavaScript console, see [jsconsole.com](http://jsconsole.com)

## React usage

Install this package:

```
npm install @alichry/jsconsole
```

And in your React application, simply import and include the root component:

```jsx
import { Root } from '@alichry/jsconsole';

function App() {
  return (
    <div>
        <YourComponents />
        <Root />
    </div>
  );
}

export default App;
```

### Options

The `Root` component defines two configurable options:
- `defaultTheme`: Choose between `light` or `dark`. Defaults to `light`
- `environment`: Specify an execution environment, defaults to `iframe`. Pass `top-level` to avoid execution of JavaScript code inside an iframe.

#### Dark theme

```jsx
<Root theme="dark" />
```

#### Top-level JS execution

```jsx
<Root environment="top-level" />
```