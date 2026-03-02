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

const Status = (props: Props) => {
  const { dispatch, history, currentUser, websocketConnection } = props;

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

  const resetState = React.useCallback(() => {
    setColor(null);
    setLabel(null);
    setOnline(true);
    setWsConnected(true);
    setHidden(true);
  }, []);

  const handleVisibilityChange = React.useCallback(() => {
    if (document && document.visibilityState === 'hidden') {
      return dispatch({ type: 'PAGE_VISIBILITY', value: 'hidden' });
    } else if (document && document.visibilityState === 'visible') {
      return dispatch({ type: 'PAGE_VISIBILITY', value: 'visible' });
    } else {
      return;
    }
  }, [dispatch]);

  const handleOnlineChange = React.useCallback(() => {
    const isOnline = window.navigator.onLine;
    setOnline(isOnline);
    setLabel(isOnline ? null : 'Lost internet connection.');
    setColor(isOnline ? null : 'warn');

    dispatch({ type: 'NETWORK_CONNECTION', value: isOnline });
  }, [dispatch]);

  const handleWsChange = React.useCallback(() => {
    if (websocketConnection === 'connected') {
      return setTimeout(() => resetState(), 1000);
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

      return setTimeout(() => resetState(), 1000);
    }
  }, [websocketConnection, resetState]);

  React.useEffect(() => {
    window.addEventListener('offline', handleOnlineChange);
    window.addEventListener('online', handleOnlineChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Only show the bar after a five second timeout
    const timeoutId = setTimeout(() => {
      setHidden(false);
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('offline', handleOnlineChange);
      window.removeEventListener('online', handleOnlineChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleOnlineChange, handleVisibilityChange]);

  React.useEffect(() => {
    let timeoutId;

    setHidden(true);

    if (websocketConnection === 'disconnected') {
      timeoutId = setTimeout(() => {
        handleWsChange();
      }, 5000);
    } else {
      handleWsChange();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [websocketConnection, handleWsChange]);

  if (isViewingMarketingPage(history, currentUser)) {
    return null;
  }

  if (hidden) return null;
  // if online and connected to the websocket, we don't need anything
  if (online && wsConnected) return null;
  return <Bar color={color}>{label}</Bar>;
};

const map = state => ({
  websocketConnection: state.connectionStatus.websocketConnection,
});

export default compose(
  // $FlowIssue
  connect(map),
  withCurrentUser,
  withRouter
)(Status);
