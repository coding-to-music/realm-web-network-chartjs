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

import * as Realm from 'realm-web';
import {
  ApolloProvider,
  ApolloClient,
  HttpLink,
  InMemoryCache
} from '@apollo/client';

const realmAppId = 'status-manta-network-qevue';
//const graphqlUri = `https://realm.mongodb.com/api/client/v2.0/app/${realmAppId}/graphql`
const graphqlUri = `https://eu-central-1.aws.stitch.mongodb.com/api/client/v2.0/app/${realmAppId}/graphql`
const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: graphqlUri,
    fetch: async (uri, options) => {
      const accessToken = await getValidAccessToken();
      options.headers.Authorization = `Bearer ${accessToken}`;
      return fetch(uri, options);
    },
  }),
  cache: new InMemoryCache(),
});
const realmApp = new Realm.App({ id: realmAppId });
async function getValidAccessToken() {
  if (!realmApp.currentUser) {
    await realmApp.logIn(Realm.Credentials.anonymous());
  } else {
    await realmApp.currentUser.refreshCustomData();
  }
  return realmApp.currentUser.accessToken
}

/*
const realmCredentials = Realm.Credentials.anonymous();
const anonymousUser = await realmApp.logIn(realmCredentials);
*/

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <Router>
        <Routes>
          <Route exact path="/" element={<Navigate to={`/dolphin`} />} />
          <Route exact path="/kusama" element={<Navigate to={`/kusama/calamari`} />} />
          <Route exact path="/polkadot" element={<Navigate to={`/polkadot/manta`} />} />
          <Route path="/:relay" element={<App />} />
          <Route path="/:relay/:para" element={<App />} />
        </Routes>
      </Router>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
