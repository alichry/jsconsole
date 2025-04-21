import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import App from './containers/App';

export default function Root(appProps) {
  return (
    <Provider store={store}>
      <App {...appProps} />
    </Provider>
  );
}