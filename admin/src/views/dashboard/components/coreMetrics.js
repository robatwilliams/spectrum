// @flow
import * as React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Brush } from 'recharts';
import { CoreMetricsContainer, Count, LegendItem, Legend } from '../style';
import { cColors } from '../../../helpers/utils';

type CoreMetric = {
  dau: number,
  wau: number,
  mau: number,
  dac: number,
  wac: number,
  mac: number,
  cpu: number,
  mpu: number,
  tpu: number,
  users: number,
  communities: number,
  threads: number,
  dmThreads: number,
  threadMessages: number,
  dmMessages: number,
  date: Date,
};
type Props = {
  data: Array<CoreMetric>,
};

const CoreMetrics = (props: Props) => {
  const [dau, setDau] = React.useState(true);
  const [wau, setWau] = React.useState(true);
  const [mau, setMau] = React.useState(true);
  const [dac, setDac] = React.useState(true);
  const [wac, setWac] = React.useState(true);
  const [mac, setMac] = React.useState(true);
  const [cpu, setCpu] = React.useState(true);
  const [mpu, setMpu] = React.useState(true);
  const [tpu, setTpu] = React.useState(true);
  const [users, setUsers] = React.useState(true);
  const [communities, setCommunities] = React.useState(true);
  const [threads, setThreads] = React.useState(true);
  const [dmThreads, setDmThreads] = React.useState(true);
  const [threadMessages, setThreadMessages] = React.useState(true);
  const [dmMessages, setDmMessages] = React.useState(true);
  const [data, setData] = React.useState<?Array<CoreMetric>>(null);

  const state = {
    dau,
    wau,
    mau,
    dac,
    wac,
    mac,
    cpu,
    mpu,
    tpu,
    users,
    communities,
    threads,
    dmThreads,
    threadMessages,
    dmMessages,
    data,
  };

  const toggleKey = (e: any) => {
    const { id } = e.target;
    const val = state[id];

    const obj = {};
    obj[id] = !val;

    const newState = Object.assign(
      {},
      { ...state },
      {
        ...obj,
      }
    );

    const newData = state.data && [...state.data];

    setDau(newState.dau);
    setWau(newState.wau);
    setMau(newState.mau);
    setDac(newState.dac);
    setWac(newState.wac);
    setMac(newState.mac);
    setCpu(newState.cpu);
    setMpu(newState.mpu);
    setTpu(newState.tpu);
    setUsers(newState.users);
    setCommunities(newState.communities);
    setThreads(newState.threads);
    setDmThreads(newState.dmThreads);
    setThreadMessages(newState.threadMessages);
    setDmMessages(newState.dmMessages);
    setData(newData);
  };

  const toggleAll = (val: boolean) => {
    const stateKeys = Object.keys(state);
    const newState = Object.assign(
      {},
      {
        ...state,
      }
    );
    stateKeys.map(k => k !== 'data' && (newState[k] = val));
    setDau(newState.dau);
    setWau(newState.wau);
    setMau(newState.mau);
    setDac(newState.dac);
    setWac(newState.wac);
    setMac(newState.mac);
    setCpu(newState.cpu);
    setMpu(newState.mpu);
    setTpu(newState.tpu);
    setUsers(newState.users);
    setCommunities(newState.communities);
    setThreads(newState.threads);
    setDmThreads(newState.dmThreads);
    setThreadMessages(newState.threadMessages);
    setDmMessages(newState.dmMessages);
  };

  React.useEffect(() => {
    if (!props.data) return;
    setData(props.data);
  }, [props.data]);

  const legendKeys = Object.keys(state).filter(k => k !== 'data');
  const hasLinesToRender = legendKeys.some(k => state[k]);
  return (
    <CoreMetricsContainer>
      <Count>Core Metrics</Count>
      <Legend>
        <LegendItem active onClick={() => toggleAll(true)}>
          All
        </LegendItem>
        <LegendItem active onClick={() => toggleAll(false)}>
          None
        </LegendItem>
        {legendKeys &&
          legendKeys.length > 0 &&
          legendKeys.map(k => {
            return (
              <LegendItem
                active={state[k]}
                onClick={toggleKey}
                key={k}
                id={k}
                color={cColors[k]}
              >
                {k}
              </LegendItem>
            );
          })}
      </Legend>
      {data &&
        hasLinesToRender && (
          <LineChart
            width={window.innerWidth - 72}
            height={400}
            data={data}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            {state.dau && (
              <Line type="monotone" dataKey="DAU" stroke={cColors.dau} />
            )}

            {state.wau && (
              <Line type="monotone" dataKey="WAU" stroke={cColors.wau} />
            )}

            {state.mau && (
              <Line type="monotone" dataKey="MAU" stroke={cColors.mau} />
            )}

            {state.dac && (
              <Line type="monotone" dataKey="DAC" stroke={cColors.dac} />
            )}

            {state.wac && (
              <Line type="monotone" dataKey="WAC" stroke={cColors.wac} />
            )}

            {state.mac && (
              <Line type="monotone" dataKey="MAC" stroke={cColors.mac} />
            )}

            {state.cpu && (
              <Line
                type="monotone"
                dataKey="communities/user"
                stroke={cColors.cpu}
              />
            )}

            {state.mpu && (
              <Line
                type="monotone"
                dataKey="messages/user"
                stroke={cColors.mpu}
              />
            )}

            {state.tpu && (
              <Line
                type="monotone"
                dataKey="threads/user"
                stroke={cColors.tpu}
              />
            )}

            {state.users && (
              <Line type="monotone" dataKey="users" stroke={cColors.users} />
            )}

            {state.communities && (
              <Line
                type="monotone"
                dataKey="communities"
                stroke={cColors.communities}
              />
            )}

            {state.threads && (
              <Line
                type="monotone"
                dataKey="threads"
                stroke={cColors.threads}
              />
            )}

            {state.dmThreads && (
              <Line
                type="monotone"
                dataKey="dmThreads"
                stroke={cColors.dmThreads}
              />
            )}

            {state.threadMessages && (
              <Line
                type="monotone"
                dataKey="threadMessages"
                stroke={cColors.threadMessages}
              />
            )}

            {state.dmMessages && (
              <Line
                type="monotone"
                dataKey="dmMessages"
                stroke={cColors.dmMessages}
              />
            )}

            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Brush dataKey="date" data={data} />
          </LineChart>
        )}
    </CoreMetricsContainer>
  );
};
export default CoreMetrics;
