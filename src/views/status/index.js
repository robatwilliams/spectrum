// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Bar } from './style';
import { useLocation } from 'react-router-dom';
import compose from 'recompose/compose';
import { isViewingMarketingPage } from 'src/helpers/is-viewing-marketing-page';
import type { Dispatch } from 'redux';
import { withCurrentUser } from 'src/components/withCurrentUser';

type Props = {
  websocketConnection: string,
  dispatch: Dispatch<Object>,
  currentUser: Object,
  location?: Object,
};

type State = {|
  color: ?string,
  label: ?string,
  wsConnected: boolean,
  online: boolean,
  hidden: boolean,
|};

class Status extends React.Component<Props, State> {
  initialState = {
    color: null,
    label: null,
    online: true,
    wsConnected: true,
    hidden: true,
  };

  state = this.initialState;

  componentDidMount() {
    window.addEventListener('offline', this.handleOnlineChange);
    window.addEventListener('online', this.handleOnlineChange);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Only show the bar after a five second timeout
    setTimeout(() => {
      this.setState({
        hidden: false,
      });
    }, 5000);
  }

  componentWillUnmount() {
    window.removeEventListener('offline', this.handleOnlineChange);
    window.removeEventListener('online', this.handleOnlineChange);
  }

  handleVisibilityChange = () => {
    if (document && document.visibilityState === 'hidden') {
      return this.props.dispatch({ type: 'PAGE_VISIBILITY', value: 'hidden' });
    } else if (document && document.visibilityState === 'visible') {
      return this.props.dispatch({ type: 'PAGE_VISIBILITY', value: 'visible' });
    } else {
      return;
    }
  };

  handleOnlineChange = () => {
    const online = window.navigator.onLine;
    this.setState({
      online,
      label: online ? null : 'Lost internet connection.',
      color: online ? null : 'warn',
    });

    this.props.dispatch({ type: 'NETWORK_CONNECTION', value: online });
  };

  handleWsChange = () => {
    const { websocketConnection } = this.props;

    if (websocketConnection === 'connected') {
      return setTimeout(() => this.setState(this.initialState), 1000);
    }

    if (websocketConnection === 'disconnected') {
      return this.setState({
        color: 'special',
        label: 'Reconnecting to server...',
        wsConnected: false,
        hidden: false,
      });
    }

    if (websocketConnection === 'reconnected') {
      this.setState({
        color: 'success',
        label: 'Reconnected!',
        hidden: false,
      });

      return setTimeout(() => this.setState(this.initialState), 1000);
    }
  };

  componentDidUpdate(prevProps) {
    const curr = this.props;

    if (prevProps.websocketConnection !== curr.websocketConnection) {
      this.setState({
        hidden: true,
      });

      if (curr.websocketConnection === 'disconnected') {
        return setTimeout(() => {
          return this.handleWsChange();
        }, 5000);
      }

      return this.handleWsChange();
    }
  }

  render() {
    const { location, currentUser } = this.props;
    const { color, online, wsConnected, label, hidden } = this.state;

    const history = { location: location || {} };
    if (isViewingMarketingPage({ location: window.location }, currentUser)) {
      return null;
    }

    if (hidden) return null;
    // if online and connected to the websocket, we don't need anything
    if (online && wsConnected) return null;
    return <Bar color={color}>{label}</Bar>;
  }
}

const map = state => ({
  websocketConnection: state.connectionStatus.websocketConnection,
});

const StatusWrapper = (props: Props) => {
  const location = useLocation();
  return <Status {...props} location={location} />;
};

export default compose(
  // $FlowIssue
  connect(map),
  withCurrentUser
)(StatusWrapper);
