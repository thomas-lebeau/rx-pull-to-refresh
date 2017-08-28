/* eslint-disable react/jsx-filename-extension */
import App from './App';
import './style/index.scss';

export default App;
if (process.env.NODE_ENV === 'development' && module.hot) {
  require('preact/devtools');
}
