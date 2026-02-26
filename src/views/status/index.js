// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Bar } from './style';
import { withRouter } from 'react-router';
import compose from 'recompose/compose';
import { isViewingMarketingPage } from 'src/helpers/is-viewing-marketing-page';
import type { Dispatch } from 'redux';
import { withCurrentUser } from 'src/components/withCurrentUser';

type Props = {
  websocketConnection: string,
  dispatch: Dispatch<Object>,
  history: Object,
  currentUser: Object,
};

type State = {|
  color: ?string,
  label: ?string,
  wsConnected: boolean,
  online: boolean,
  hidden: boolean,
|};

const Status = (props: Props) => {
  const { websocketConnection, dispatch, history, currentUser } = props;

  const initialState = {
    color: null,
    label: null,
    online: true,
    wsConnected: true,
    hidden: true,
  };

  const [color, setColor] = React.useState(null);
  const [label, setLabel] = React.useState(null);
  const [online, setOnline] = React.useState(true);
  const [wsConnected, setWsConnected] = React.useState(true);
  const [hidden, setHidden] = React.useState(true);

  const isFirstRender = React.useRef(true);

  const handleVisibilityChange = () => {
    if (document && document.visibilityState === 'hidden') {
      return dispatch({ type: 'PAGE_VISIBILITY', value: 'hidden' });
    } else if (document && document.visibilityState === 'visible') {
      return dispatch({ type: 'PAGE_VISIBILITY', value: 'visible' });
    } else {
      return;
    }
  };

  const handleOnlineChange = () => {
    const onlineStatus = window.navigator.onLine;
    setOnline(onlineStatus);
    setLabel(onlineStatus ? null : 'Lost internet connection.');
    setColor(onlineStatus ? null : 'warn');

    dispatch({ type: 'NETWORK_CONNECTION', value: onlineStatus });
  };

  const handleWsChange = () => {
    if (websocketConnection === 'connected') {
      return setTimeout(() => {
        setColor(initialState.color);
        setLabel(initialState.label);
        setOnline(initialState.online);
        setWsConnected(initialState.wsConnected);
        setHidden(initialState.hidden);
      }, 1000);
    }

    if (websocketConnection === 'disconnected') {
      setColor('special');
      setLabel('Reconnecting to server...');
      setWsConnected(false);
      setHidden(false);
      return;
    }

    if (websocketConnection === 'reconnected') {
      setColor('success');
      setLabel('Reconnected!');
      setHidden(false);

      return setTimeout(() => {
        setColor(initialState.color);
        setLabel(initialState.label);
        setOnline(initialState.online);
        setWsConnected(initialState.wsConnected);
        setHidden(initialState.hidden);
      }, 1000);
    }
  };

  React.useEffect(() => {
    window.addEventListener('offline', handleOnlineChange);
    window.addEventListener('online', handleOnlineChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Only show the bar after a five second timeout
    setTimeout(() => {
      setHidden(false);
    }, 5000);

    return () => {
      window.removeEventListener('offline', handleOnlineChange);
      window.removeEventListener('online', handleOnlineChange);
    };
  }, []);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setHidden(true);

    if (websocketConnection === 'disconnected') {
      setTimeout(() => {
        handleWsChange();
      }, 5000);
    } else {
      handleWsChange();
    }
  }, [websocketConnection]);

  if (isViewingMarketingPage(history, currentUser)) {
    return null;
  }

  if (hidden) return null;
  // if online and connected to the websocket, we don't need anything
  if (online && wsConnected) return null;
  return <Bar color={color}>{label}</Bar>;
}

const map = state => ({
  websocketConnection: state.connectionStatus.websocketConnection,
});

export default compose(
  // $FlowIssue
  connect(map),
  withCurrentUser,
  withRouter
)(Status);
