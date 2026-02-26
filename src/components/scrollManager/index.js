import * as React from 'react';
import { withRouter } from 'react-router-dom';
import debounceFn from 'debounce';

type Props = {
  scrollCaptureDebounce: number,
  scrollSyncDebounce: number,
  scrollSyncAttemptLimit: number,
  children: React$Node,
  history: Object,
  location: Object,
  onLocationChange: Function,
};

const ScrollManager = (props: Props) => {
  const {
    scrollCaptureDebounce = 50,
    scrollSyncDebounce = 100,
    scrollSyncAttemptLimit = 5,
    children,
    history,
    location,
    onLocationChange,
  } = props;

  const scrollSyncDataRef = React.useRef({
    x: 0,
    y: 0,
    attemptsRemaining: scrollSyncAttemptLimit,
  });

  const scrollSyncPendingRef = React.useRef(false);

  const scrollCapture = () => {
    requestAnimationFrame(() => {
      const { pageXOffset, pageYOffset } = window;
      const { pathname } = location;

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
      const { x, y, attemptsRemaining } = scrollSyncDataRef.current;

      if (attemptsRemaining < 1) {
        return;
      }

      const { pageXOffset, pageYOffset } = window;
      if (
        y < window.document.body.scrollHeight &&
        (x !== pageXOffset || y !== pageYOffset)
      ) {
        window.scrollTo(x, y);
        scrollSyncDataRef.current.attemptsRemaining = attemptsRemaining - 1;
        _scrollSync();
      }
    });
  };

  const scrollSync = (x = 0, y = 0) => {
    scrollSyncDataRef.current = {
      x,
      y,
      attemptsRemaining: scrollSyncAttemptLimit,
    };
    _scrollSync();
  };

  const debouncedScrollRef = React.useRef(null);
  const debouncedScrollSyncRef = React.useRef(null);

  if (!debouncedScrollRef.current) {
    debouncedScrollRef.current = debounceFn(
      scrollCapture,
      scrollCaptureDebounce
    );
  }

  if (!debouncedScrollSyncRef.current) {
    debouncedScrollSyncRef.current = debounceFn(scrollSync, scrollSyncDebounce);
  }

  const debouncedScroll = debouncedScrollRef.current;
  const debouncedScrollSync = debouncedScrollSyncRef.current;

  const onPush = () => {
    debouncedScrollSync(0, 0);
  };

  const onPop = ({ location: { state = {} } }) => {
    // attempt location restore
    const { x = 0, y = 0 } = state.scroll || {};
    debouncedScrollSync(x, y);
  };

  const prevPropsRef = React.useRef();

  React.useEffect(() => {
    if (onLocationChange) {
      onLocationChange(location);
    }
  }, []);

  React.useEffect(() => {
    onPop(props);
    window.addEventListener('scroll', debouncedScroll, { passive: true });

    return () => {
      scrollSyncPendingRef.current = false;
      window.removeEventListener('scroll', debouncedScroll, {
        passive: true,
      });
    };
  }, []);

  React.useEffect(() => {
    const prevProps = prevPropsRef.current;
    if (prevProps) {
      switch (history.action) {
        case 'PUSH':
        case 'REPLACE':
          onPush();
          break;
        case 'POP':
          onPop(props);
          break;
        default:
          console.warn(
            `Unrecognized location change action! "${history.action}"`
          );
      }
      if (onLocationChange) {
        onLocationChange(location);
      }
    }
    prevPropsRef.current = props;
  });

  return children;
};

export default withRouter(ScrollManager);
