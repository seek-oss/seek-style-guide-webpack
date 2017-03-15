import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

// Static site renderer
export default ({ path }) =>
  `<html>
  <head>
    <title>seek-style-guide-webpack test</title>
  </head>
  <body>
    <div id="app">${renderToString(<App />)}</div>
  </body>
</html>`;
