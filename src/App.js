import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';

import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';

import Health from './Health';

const endpoints = {
  ops: 'https://7p1eol9lz4.execute-api.us-east-1.amazonaws.com/prod/instances',
  dev: 'https://mab48pe004.execute-api.us-east-1.amazonaws.com/prod/instances',
  service: 'https://l7ff90u0lf.execute-api.us-east-1.amazonaws.com/prod/instances',
  prod: 'https://hzhmt0krm0.execute-api.us-east-1.amazonaws.com/prod/instances'
};
const fetchOptions = {
  mode: 'cors',
  credentials: 'omit',
  headers: {
    'Content-Type': 'application/json'
  },
  redirect: 'follow'
};

const domains = {
  'rococo/dolphin': 'rococo.dolphin.engineering',
  'baikal/calamari-testnet': 'baikal.testnet.calamari.systems',
  'baikal/manta-testnet': 'baikal.testnet.manta.systems',
  'como/calamari-testnet': 'como.testnet.calamari.systems',
  'como/manta-testnet': 'como.testnet.manta.systems',
  'kusama/calamari': 'calamari.systems',
  'polkadot/manta': 'manta.systems',
  'westend/manta': 'westend.manta.systems',
  baikal: 'baikal.manta.systems',
  como: 'como.manta.systems',
};
const notNodes = [
  'bench-bot.manta.systems'
];
const collator = [
  'crispy',
  'crunchy',
  'hotdog',
  'tasty',
  'tender',
  'alfredi',
  'birostris',
  'eredoogootenkee',
  'hypostoma',
  'japanica',
];
const validator = [
  'eddie',
  'kwaltz',
  'prosser',
  'roosta',
  'zaphod',
  'arangatuy',
  'frohlikha',
  'olkhon',
  'ushkan',
  'comacina',
  'lugano',
  'mezzola',
  'piona',
];
const rpc = [
  'chilli',
  'jalapeno',
  'serrano',
];
const archive = [
  'avocado',
  'rochebrunei',
];
const full = [
  'salad',
  'tempura',
  'pasta',
  'bokkeum',
  'kebab',
  'fritti',
  'smoothie',
  'falafel',
  'munkiana',
  'kuhlii',
  'melanyae',
  'thurstoni',
  'pectinata',
  'anjie',
  'ford',
  'trillian',
];

function App() {
  const { relay, para } = useParams();
  const deployment = !!para ? `${relay}/${para}` : `${relay}`
  const [instances, setInstances] = useState([]);
  const { loading, error, data } = useQuery(gql`
    query {
      nodes(query: { domain: "${domains[deployment]}" }) {
        fqdn
        domain
        ip
        launch
        observations {
          time
          status {
            instance
            ssh
            dns_ip
          }
          cert {
            name
            domains
            expiry
          }
          unit {
            unit
            load
            active
            sub
          }
        }
      }
    }
  `);
  useEffect(() => {
    Object.keys(endpoints).forEach((profile) => {
      setInstances([]);
      fetch(endpoints[profile], fetchOptions)
        .then((r) => r.json())
        .then((container) => {
          setInstances(instances => [
            ...instances,
            ...container.instances.filter(i => ((i.domain === domains[deployment]) && (!notNodes.some(x => x === i.fqdn)) && (!instances.some(x => x.fqdn === i.fqdn && x.profile === i.profile)))).map((instance) => ({
              ...instance,
              profile,
              ...archive.some(c => c === instance.hostname) && { role: 'archive', badge: 'archive' },
              ...collator.some(c => c === instance.hostname) && { role: 'collator', badge: 'shield-shaded' },
              ...full.some(c => c === instance.hostname) && { role: 'full', badge: 'book' },
              ...rpc.some(c => c === instance.hostname) && { role: 'rpc', badge: 'cpu' },
              ...validator.some(c => c === instance.hostname) && { role: 'validator', badge: 'shield-shaded' },
            })),
          ].sort((a, b) => (a.fqdn < b.fqdn ? -1 : a.fqdn > b.fqdn ? 1 : 0)));
        })
        .catch(console.error);
    });
  }, [deployment, para]);
  return (
    <Container>
      <Nav activeKey={deployment}>
        {/*
        <Nav.Item>
          <Nav.Link eventKey="1" href="/overview">
            overview
          </Nav.Link>
        </Nav.Item>
        */}
        <NavDropdown title="deployments">
          <NavDropdown.Item href="/kusama/calamari" eventKey="kusama/calamari">kusama/calamari</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item href="/polkadot/manta" eventKey="polkadot/manta">polkadot/manta</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item href="/westend/manta" eventKey="westend/manta">westend/manta</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item href="/rococo/dolphin" eventKey="/rococo/dolphin">rococo/dolphin</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item href="/baikal" eventKey="baikal">baikal</NavDropdown.Item>
          <NavDropdown.Item href="/baikal/calamari-testnet" eventKey="baikal/calamari-testnet">baikal/calamari-testnet</NavDropdown.Item>
          <NavDropdown.Item href="/baikal/manta-testnet" eventKey="baikal/manta-testnet">baikal/manta-testnet</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item href="/como" eventKey="como">como</NavDropdown.Item>
          <NavDropdown.Item href="/como/calamari-testnet" eventKey="como/calamari-testnet">como/calamari-testnet</NavDropdown.Item>
          <NavDropdown.Item href="/como/manta-testnet" eventKey="como/manta-testnet">como/manta-testnet</NavDropdown.Item>
        </NavDropdown>
      </Nav>
      <Row>
        <h2>
          {relay}
          {
            !!para
              ? ` / ${para}`
              : null
          }
        </h2>
      </Row>
      <Row>
        <Table striped>
          <thead>
            <tr>
              <th>host</th>
              <th>role</th>
              <th>endpoints</th>
              <th>health</th>
              <th>meta</th>
            </tr>
          </thead>
          <tbody>
            {
              instances.map((instance, iI) => (
                <tr key={iI}>
                  <td>
                    {instance.hostname}
                    <span className="text-muted" style={{fontSize: '0.7em'}}>
                      .{instance.domain}
                    </span>
                    <span className="text-muted" style={{fontSize: '0.7em', marginLeft: '0.5em'}}>
                      (
                        {
                          (!!data && !!data.nodes && !!data.nodes.length)
                            ? (
                                data.nodes.find((n) => n.fqdn === instance.fqdn).ip
                              )
                            : null
                        }
                      )
                    </span>
                  </td>
                  <td>
                    {
                      !!instance.badge
                        ? <i title={instance.role} className={`bi bi-${instance.badge}`} />
                        : null
                    }
                  </td>
                  <td>
                    {
                      ['collator', 'validator', 'full', 'rpc', 'archive'].some(x => x === instance.role)
                        ? (
                            <a
                              href={`https://polkadot.js.org/apps/?rpc=wss%3A%2F%2F${instance.fqdn}`}
                              title={`polkadot.js/${instance.hostname}`}
                              style={{ marginRight: '0.5em' }}>
                              <i className={`bi bi-outlet`} />
                            </a>
                          )
                        : null
                    }
                    {
                      ['rpc'].some(x => x === instance.role)
                        ? (
                            <>
                              <a
                                href={`https://rpc.${instance.fqdn}`}
                                title={`${instance.hostname} rpc`}
                                style={{ marginRight: '0.5em' }}>
                                <i className={`bi bi-boxes`} />
                              </a>
                              <a
                                href={`https://api.${instance.fqdn}`}
                                title={`${instance.hostname} sidecar`}
                                style={{ marginRight: '0.5em' }}>
                                <i className={`bi bi-minecart`} />
                              </a>
                            </>
                          )
                        : null
                    }
                  </td>
                  <td>
                    {
                      (!!data && !!data.nodes && !!data.nodes.length)
                        ? (
                            <Health instance={instance} node={data.nodes.find((n) => n.fqdn === instance.fqdn)} />
                          )
                        : null
                    }
                  </td>
                  <td>
                    {
                      (!!para)
                        ? (
                            <a
                              href={`https://github.com/Manta-Network/pelagos/blob/main/terraform/deployment/${relay}/${para}/${instance.hostname}/main.tf`}
                              title={`${relay}/${para}/${instance.hostname} configuration`}
                              style={{ marginRight: '0.5em' }}>
                              <i className={`bi bi-file-earmark-code`} />
                            </a>
                          )
                        : (
                            <a
                              href={`https://github.com/Manta-Network/pelagos/blob/main/terraform/deployment/${relay}/${instance.hostname}/main.tf`}
                              title={`${relay}/${instance.hostname} configuration`}
                              style={{ marginRight: '0.5em' }}>
                              <i className={`bi bi-file-earmark-code`} />
                            </a>
                          )
                    }
                    {
                      (!!instance.location && !!instance.location.country && !!instance.location.country.flag)
                        ? (
                            <span
                              title={`${instance.region}: ${instance.location.city.name}, ${instance.location.country.name}`}>
                              {instance.location.country.flag}
                            </span>
                          )
                        : <i className={`bi bi-geo`} title={instance.region} />
                    }
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
      </Row>
      {
        (!!error)
          ? (
              <Row>
                <pre>{JSON.stringify({ loading, error, data }, null, 2)}</pre>
              </Row>
            )
          : null
      }
    </Container>
  );
}

export default App;
