import React from 'react';
import ReactDOM from 'react-dom';
import App from "./app/App";
import './app/index.css';
import 'semantic-ui-css/semantic.min.css'
import "react-simple-keyboard/build/css/index.css";

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);