// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import compose from 'recompose/compose';
import getThreadMessages, {
  type GetThreadMessageConnectionType,
} from 'shared/graphql/queries/thread/getThreadMessageConnection';
import { sortAndGroupMessages } from 'shared/clients/group-messages';
import NextPageButton from 'src/components/nextPageButton';
import viewNetworkHandler, {
  type ViewNetworkHandlerType,
} from 'src/components/viewNetworkHandler';
import ChatMessages from 'src/components/messageGroup';
import { Loading } from 'src/components/loading';
import NullMessages from './nullMessages';
import type { Location } from 'react-router';
import { NullMessagesWrapper } from '../style';

type Props = {
  // Used by getThreadMessages query
  isWatercooler: boolean,
  data: {
    loading: boolean,
    thread: ?GetThreadMessageConnectionType,
  },
  loadPreviousPage: Function,
  loadNextPage: Function,
  subscribeToNewMessages: Function,
  onMessagesLoaded?: Function,
  location: Location,
  thread?: Object,
  ...$Exact<ViewNetworkHandlerType>,
};

const Messages = (props: Props) => {
  const {
    data,
    isLoading,
    isFetchingMore,
    hasError,
    location,
    loadPreviousPage,
    loadNextPage,
    subscribeToNewMessages,
    onMessagesLoaded,
  } = props;
  const unsubscribeRef = React.useRef(null);
  const prevDataRef = React.useRef(data);
  const scrollActionRef = React.useRef(null);

  // Set up subscription and initial scroll
  React.useEffect(() => {
    const thread = data.thread || props.thread;
    // Scroll to bottom on mount if we got cached data
    if (thread && (thread.watercooler || thread.currentUserLastSeen)) {
      const elem = document.getElementById('main');
      if (elem) {
        elem.scrollTop = elem.scrollHeight;
      }
    }
    unsubscribeRef.current = subscribeToNewMessages();

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  // Track messages loaded callback
  React.useEffect(() => {
    const prevData = prevDataRef.current;
    const currData = data;
    const wasLoading = prevData && prevData.loading;
    const hasPrevThread = prevData && prevData.thread;
    const hasCurrThread = currData && currData.thread;
    const previousMessageConnection =
      // $FlowIssue
      hasPrevThread && prevData.thread.messageConnection;
    const currMessageConnection =
      // $FlowIssue
      hasCurrThread && currData.thread.messageConnection;

    // thread loaded for the first time
    if (!hasPrevThread && hasCurrThread && currMessageConnection) {
      if (currMessageConnection.edges.length > 0) {
        onMessagesLoaded && onMessagesLoaded(currData.thread);
      }
    }
    // new messages arrived
    if (previousMessageConnection && hasCurrThread && currMessageConnection) {
      if (
        currMessageConnection.edges.length >
        previousMessageConnection.edges.length
      ) {
        onMessagesLoaded && onMessagesLoaded(currData.thread);
      }
      // already loaded the thread, but was refetched
      if (wasLoading && !currData.loading) {
        onMessagesLoaded && onMessagesLoaded(currData.thread);
      }
    }

    prevDataRef.current = data;
  });

  // Determine scroll action before DOM updates
  React.useLayoutEffect(() => {
    const prev = prevDataRef.current;
    const curr = data;

    // First load
    if (
      !prev.thread &&
      curr.thread &&
      (curr.thread.currentUserLastSeen || curr.thread.watercooler)
    ) {
      scrollActionRef.current = { type: 'bottom' };
    }
    // New messages
    else if (
      prev.thread &&
      curr.thread &&
      prev.thread.messageConnection.edges.length > 0 &&
      curr.thread.messageConnection.edges.length > 0 &&
      prev.thread.messageConnection.edges.length <
        curr.thread.messageConnection.edges.length
    ) {
      const elem = document.getElementById('main');
      if (!elem || !curr.thread) {
        scrollActionRef.current = null;
        return;
      }

      // If new messages were added at the top, persist the scroll position
      if (
        prev.thread.messageConnection.edges[0].node.id !==
        curr.thread.messageConnection.edges[0].node.id
      ) {
        scrollActionRef.current = {
          type: 'persist',
          values: {
            top: elem.scrollTop,
            height: elem.scrollHeight,
          },
        };
      }
      // If more than one new message was added at the bottom, stick to the current position
      else if (
        prev.thread.messageConnection.edges.length + 1 <
        curr.thread.messageConnection.edges.length
      ) {
        scrollActionRef.current = null;
      }
      // If only one message came in and we are near the bottom, stick to the bottom
      else if (elem.scrollHeight < elem.scrollTop + elem.clientHeight + 400) {
        scrollActionRef.current = { type: 'bottom' };
      }
      // Otherwise stick to the current position
      else {
        scrollActionRef.current = null;
      }
    } else {
      scrollActionRef.current = null;
    }
  });

  // Apply scroll action after DOM updates
  React.useLayoutEffect(() => {
    if (scrollActionRef.current) {
      const elem = document.getElementById('main');
      if (!elem) return;

      switch (scrollActionRef.current.type) {
        case 'bottom': {
          elem.scrollTop = elem.scrollHeight;
          break;
        }
        case 'persist': {
          const values = scrollActionRef.current.values;
          if (values) {
            elem.scrollTop = elem.scrollHeight - values.height + values.top;
          }
          break;
        }
        default: {
          break;
        }
      }
      scrollActionRef.current = null;
    }
  });

  const { thread } = data;

  if (thread && thread.messageConnection) {
    const { messageConnection } = thread;
    const { edges } = messageConnection;

    if (edges.length === 0) return <NullMessages />;

    const unsortedMessages = edges.map(message => message && message.node);
    const sortedMessages = sortAndGroupMessages(unsortedMessages);

    if (!sortedMessages || sortedMessages.length === 0) return <NullMessages />;

    return (
      <React.Fragment>
        {messageConnection.pageInfo.hasPreviousPage && (
          <NextPageButton
            isFetchingMore={isFetchingMore}
            fetchMore={loadPreviousPage}
            automatic={!!thread.watercooler}
            href={{
              pathname: location.pathname,
              search: queryString.stringify({
                ...queryString.parse(location.search),
                msgsbefore: messageConnection.edges[0].cursor,
                msgsafter: undefined,
              }),
            }}
          >
            Show previous messages
          </NextPageButton>
        )}
        <ChatMessages
          thread={thread}
          uniqueMessageCount={unsortedMessages.length}
          messages={sortedMessages}
          threadType={'story'}
          isWatercooler={thread.watercooler}
        />
        {messageConnection.pageInfo.hasNextPage && (
          <NextPageButton
            isFetchingMore={isFetchingMore}
            fetchMore={loadNextPage}
            href={{
              pathname: location.pathname,
              search: queryString.stringify({
                ...queryString.parse(location.search),
                msgsafter:
                  messageConnection.edges[messageConnection.edges.length - 1]
                    .cursor,
                msgsbefore: undefined,
              }),
            }}
          >
            Show more messages
          </NextPageButton>
        )}
      </React.Fragment>
    );
  }

  if (isLoading)
    return (
      <NullMessagesWrapper>
        <Loading style={{ height: '80vh' }} />
      </NullMessagesWrapper>
    );

  if (hasError) return null;

  return null;
};

export default compose(
  withRouter,
  getThreadMessages,
  viewNetworkHandler
)(Messages);
