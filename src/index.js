import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route exact path="/" element={<Navigate to={`/dolphin`} />} />
        <Route exact path="/kusama" element={<Navigate to={`/kusama/calamari`} />} />
        <Route exact path="/polkadot" element={<Navigate to={`/polkadot/manta`} />} />
        <Route path="/:relay" element={<App />} />
        <Route path="/:relay/:para" element={<App />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
