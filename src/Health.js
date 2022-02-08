import React, { useState, useEffect } from 'react';
import Badge from 'react-bootstrap/Badge';

const nextMonth = new Date();
nextMonth.setMonth((new Date()).getMonth() + 1);
const shortDateFormat = new Intl.DateTimeFormat('en-GB' , {
  dateStyle: "short"
});

function Health(props) {
  const observation = !!props.node
    ? [...props.node.observations].pop()
    : undefined;
  const [rpcHealth, setRpcHealth] = useState({
    isSyncing: false,
    peers: 0,
    shouldHavePeers: false,
    loading: true,
    unreachable: false
  });
  useEffect(() => {
    fetch(`https://rpc.${props.instance.fqdn}/health`)
      .then((r) => r.json())
      .then((rpcHealth) => setRpcHealth({
        ...rpcHealth,
        loading: false,
        unreachable: false
      }))
      .catch((e) => {
        setRpcHealth({
          loading: false,
          unreachable: true
        })
        console.error(e);
      });
  });
  return (
    <>
      <a
        href={`https://${props.instance.region}.console.aws.amazon.com/ec2/v2/home?#InstanceDetails:instanceId=${props.instance.id}`}
        title={`aws/ec2/${props.instance.hostname}`}
        style={{ marginRight: '0.5em' }}>
        <i className={`bi bi-activity`} />
      </a>
      <a
        href={`https://${props.instance.region}.console.aws.amazon.com/cloudwatch/home?#logsV2:log-groups/log-group/${props.instance.fqdn}`}
        title={`aws/cloudwatch/${props.instance.hostname}`}
        style={{ marginRight: '0.5em' }}>
        <i className={`bi bi-file-earmark-text`} />
      </a>
      <Badge
        pill
        title={`${rpcHealth.peers} peers`}
        bg={
          (!!rpcHealth.loading)
            ? 'secondary'
            : (!!rpcHealth.unreachable)
              ? 'danger'
              : (((!!rpcHealth.shouldHavePeers) && (rpcHealth.peers > 0)) || ((!rpcHealth.shouldHavePeers) && (rpcHealth.peers === 0)))
                ? 'success'
                : 'warning'
        }
        style={{
          marginRight: '0.3em'
        }}>
        {rpcHealth.peers || `${(!!rpcHealth.unreachable) ? '?' : '0'}`}
      </Badge>
      {
        !!observation
          ? (
              <Badge
                title={`${observation.time}: ${props.node.fqdn} resolves to: ${observation.status.dns_ip}`}
                bg={observation.status.dns_ip === props.node.ip ? 'success' : 'warning'}
                style={{
                  marginRight: '0.3em'
                }}>
                dns
              </Badge>
            )
          : null
      }
      {
        !!observation
          ? (
              <Badge
                title={`${observation.time}: ${observation.status.ssh}`}
                bg={observation.status.ssh === "'active'" ? 'success' : 'warning'}
                style={{
                  marginRight: '0.3em'
                }}>
                ssh
              </Badge>
            )
          : null
      }
      {
        !!observation
          ? (
              <>
                {
                  observation.unit.map((u) => (
                    <Badge
                      title={`${observation.time}: ${u.load} ${u.active} ${u.sub}`}
                      key={u.unit}
                      bg={
                        (`${u.load} ${u.active} ${u.sub}` === 'loaded active running')
                          ? 'success'
                          : (['loaded inactive dead', 'loaded failed failed'].includes(`${u.load} ${u.active} ${u.sub}`))
                            ? 'danger'
                            : 'warning'
                      }
                      style={{
                        marginRight: '0.3em'
                      }}>
                      {u.unit.replace('.service', '')}
                    </Badge>
                  ))
                }
                {
                  !!observation.cert
                    ? (
                        observation.cert.map((c) => (
                          <Badge
                            title={`${observation.time}: cert ${c.name} (${c.domains.filter(d => !d.startsWith('cockpit.')).join(', ')}), expires: ${shortDateFormat.format(new Date(c.expiry))}`}
                            key={c.name}
                            bg={
                              ((c.name === props.node.fqdn) && ((new Date(c.expiry)) > nextMonth))
                                ? 'success'
                                : ((c.name === props.node.fqdn) && ((new Date(c.expiry)) > (new Date())))
                                  ? 'primary'
                                  : ([`rpc.${props.node.fqdn}`].includes(`${c.name}`))
                                    ? 'danger'
                                    : 'warning'
                            }
                            style={{
                              marginRight: '0.3em'
                            }}>
                            <i className={`bi bi-bookmark-check`} />
                          </Badge>
                        ))
                      )
                    : null
                }
              </>
            )
          : null
      }
    </>
  );
}

export default Health;
