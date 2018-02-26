import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

// Static site renderer
export default ({ path }) => `
  <!doctype html>
  <html>
    <head>
      <title>seek-style-guide-webpack test</title>
      <link rel="stylesheet" type="text/css" href="app.css" />
    </head>
    <body>
      <div id="app">${renderToString(<App />)}</div>
      <script type="text/javascript" src="index.js"></script>
    </body>
  </html>
`;
