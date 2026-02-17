import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import debounceFn from 'debounce';

type Props = {
  scrollCaptureDebounce: number,
  scrollSyncDebounce: number,
  scrollSyncAttemptLimit: number,
  children: React$Node,
  onLocationChange: Function,
};

class ScrollManager extends React.Component<Props> {
  static defaultProps = {
    scrollCaptureDebounce: 50,
    scrollSyncDebounce: 100,
    scrollSyncAttemptLimit: 5,
  };

  constructor(props) {
    super(props);

    this.scrollSyncData = {
      x: 0,
      y: 0,
      attemptsRemaining: props.scrollSyncAttemptLimit,
    };

    const scrollCapture = () => {
      requestAnimationFrame(() => {
        const { pageXOffset, pageYOffset } = window;
        const pathname = window.location.pathname;

        // use browser history instead of router history
        // to avoid infinite history.replace loop
        const historyState = window.history.state || {};
        const { state = {} } = historyState;
        if (
          !state.scroll ||
          state.scroll.x !== pageXOffset ||
          state.scroll.y !== pageYOffset
        ) {
          window.history.replaceState(
            {
              ...historyState,
              state: { ...state, scroll: { x: pageXOffset, y: pageYOffset } },
            },
            null,
            pathname
          );
        }
      });
    };

    const _scrollSync = () => {
      requestAnimationFrame(() => {
        const { x, y, attemptsRemaining } = this.scrollSyncData;

        if (attemptsRemaining < 1) {
          return;
        }

        const { pageXOffset, pageYOffset } = window;
        if (
          y < window.document.body.scrollHeight &&
          (x !== pageXOffset || y !== pageYOffset)
        ) {
          window.scrollTo(x, y);
          this.scrollSyncData.attemptsRemaining = attemptsRemaining - 1;
          _scrollSync();
        }
      });
    };

    const scrollSync = (x = 0, y = 0) => {
      this.scrollSyncData = {
        x,
        y,
        attemptsRemaining: this.props.scrollSyncAttemptLimit,
      };
      _scrollSync();
    };

    this.debouncedScroll = debounceFn(
      scrollCapture,
      props.scrollCaptureDebounce
    );
    this.debouncedScrollSync = debounceFn(scrollSync, props.scrollSyncDebounce);
  }

  componentWillMount() {
    const { onLocationChange } = this.props;
    if (onLocationChange) {
      onLocationChange(window.location);
    }
  }

  componentDidMount() {
    this.onPop(this.props);
    window.addEventListener('scroll', this.debouncedScroll, { passive: true });
  }

  componentWillUnmount() {
    this.scrollSyncPending = false;
    window.removeEventListener('scroll', this.debouncedScroll, {
      passive: true,
    });
  }

  componentWillReceiveProps(nextProps) {
    const action =
      (window.history.state && window.history.state.action) || 'PUSH';
    switch (action) {
      case 'PUSH':
      case 'REPLACE':
        this.onPush();
        break;
      case 'POP':
        this.onPop(nextProps);
        break;
      default:
        console.warn(`Unrecognized location change action! "${action}"`);
    }
    if (nextProps.onLocationChange) {
      nextProps.onLocationChange(window.location);
    }
  }

  onPush() {
    this.debouncedScrollSync(0, 0);
  }

  onPop({ location = {} }) {
    // attempt location restore
    const state = (window.history.state && window.history.state.state) || {};
    const { x = 0, y = 0 } = state.scroll || {};
    this.debouncedScrollSync(x, y);
  }

  render() {
    return this.props.children;
  }
}

export default ScrollManager;
