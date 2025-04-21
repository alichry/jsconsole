import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import App from './containers/App';
import PropTypes from 'prop-types';
import { setTheme } from './actions/Settings';

export default function Root({ defaultTheme }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const run = () => {
      if (! defaultTheme) {
        return;
      }
      const state = store.getState();
      if (! state.settings.theme) {
        store.dispatch(setTheme(defaultTheme));
      }
    };
    run();
    setReady(true);
  }, []);
  if (! ready) {
    return <></>;
  }
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

Root.propTypes = {
  defaultTheme: PropTypes.oneOf(['light', 'dark'])
};