import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CategoryScale } from 'chart.js';
import palette from 'google-palette';
ChartJS.register(...registerables);
//import ChartDatasourcePrometheusPlugin from 'chartjs-plugin-datasource-prometheus';

const jobMap = {
  'calamari.systems': '.*calamari.*',
  'rococo.dolphin.engineering': '.*dolphin.*',
};
const periods = [
  { label: 'minute', value: 'm' },
  { label: 'hour', value: 'h' },
  { label: 'day', value: 'd' }
];

function Metrics(props) {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(periods.find(p => p.value === 'h'));
  const [data, setData] = useState({ labels: [], datasets: [] });
  useEffect(() => {
    if (!!jobMap[props.domain]) {
      let start = new Date();
      let end = new Date();
      start.setDate(start.getDate() - 1);
      //start.setHours(start.getHours() + 23);
      const url = {
        scheme: 'https',
        hostname: 'pulse.pelagos.systems',
        path: 'api/v1/query',
        params: new URLSearchParams({
          query: `node_netstat_Tcp_CurrEstab{job=~"${jobMap[props.domain]}"}[1${period.value}]`,
          start: start.getTime()/1000.0,
          end: end.getTime()/1000.0,
          //step: 60,
        }).toString(),
      }
      fetch(`${url.scheme}://${url.hostname}/${url.path}?${url.params}`)
        .then(response => response.json())
        .then((json) => { 
          const instances = json.data.result.map((r) => r.metric.instance);
          const colors = palette('mpn65', instances.length);
          //console.log({ instances, colors, json });
          const labels = json.data.result[0].values.map((value) => new Intl.DateTimeFormat('default', { hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(new Date(Math.trunc(value[0] * 1000))));
          const datasets = instances.map((instance, i) => ({
            label: instance.split('.')[0],
            data: json.data.result.find((r) => r.metric.instance === instance).values.map((value) => value[1]),
            backgroundColor: `#${colors[i]}`,
            borderColor: `#${colors[i]}`,
          }));
          setData({ labels, datasets });
          setLoading(false);
         })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [props.domain, period]);
  return (!!jobMap[props.domain])
    ? (
        <>
          <Row>
            <span>tcp connections in the last</span>
            <Dropdown>
              <Dropdown.Toggle>
                {period.label}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {
                  periods.map((period) => (
                    <Dropdown.Item key={period.value} onClick={() => { setPeriod(period); setLoading(true); }}>
                      {period.label}
                    </Dropdown.Item>
                  ))
                }
              </Dropdown.Menu>
            </Dropdown>
          </Row>
          <Row>
            {
              (loading)
                ? (
                    <Spinner animation="border">
                      <span className="visually-hidden">metrics lookup in progress</span>
                    </Spinner>
                  )
                : (
                    <Chart type={`line`} plugins={[CategoryScale]} data={data} />
                  )
            }
          </Row>
        </>
      )
    : null;
}

export default Metrics;
