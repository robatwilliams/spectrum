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
  const { data, isLoading, isFetchingMore, hasError, onMessagesLoaded, subscribeToNewMessages, thread, location, loadPreviousPage, loadNextPage } = props;
  
  const unsubscribeRef = React.useRef(null);
  const prevPropsRef = React.useRef(null);
  const snapshotRef = React.useRef(null);

  // componentDidMount
  React.useEffect(() => {
    const threadData = data.thread || thread;
    // Scroll to bottom on mount if we got cached data as getSnapshotBeforeUpdate does not fire for mounts
    if (threadData && (threadData.watercooler || threadData.currentUserLastSeen)) {
      const elem = document.getElementById('main');
      if (!elem) return;
      elem.scrollTop = elem.scrollHeight;
    }
    unsubscribeRef.current = subscribeToNewMessages();

    // componentWillUnmount
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  // getSnapshotBeforeUpdate pattern - capture snapshot before DOM updates
  React.useLayoutEffect(() => {
    const prev = prevPropsRef.current;
    const curr = props;
    
    if (!prev) {
      prevPropsRef.current = curr;
      return;
    }

    // First load
    if (
      !prev.data.thread &&
      curr.data.thread &&
      (curr.data.thread.currentUserLastSeen || curr.data.thread.watercooler)
    ) {
      snapshotRef.current = {
        type: 'bottom',
      };
      return;
    }
    // New messages
    if (
      prev.data.thread &&
      curr.data.thread &&
      prev.data.thread.messageConnection.edges.length > 0 &&
      curr.data.thread.messageConnection.edges.length > 0 &&
      prev.data.thread.messageConnection.edges.length <
        curr.data.thread.messageConnection.edges.length
    ) {
      const elem = document.getElementById('main');
      if (!elem || !curr.data.thread) {
        snapshotRef.current = null;
        return;
      }

      // If new messages were added at the top, persist the scroll position
      if (
        prev.data.thread.messageConnection.edges[0].node.id !==
        curr.data.thread.messageConnection.edges[0].node.id
      ) {
        snapshotRef.current = {
          type: 'persist',
          values: {
            top: elem.scrollTop,
            height: elem.scrollHeight,
          },
        };
        return;
      }

      // If more than one new message was added at the bottom, stick to the current position
      if (
        prev.data.thread.messageConnection.edges.length + 1 <
        curr.data.thread.messageConnection.edges.length
      ) {
        snapshotRef.current = null;
        return;
      }

      // If only one message came in and we are near the bottom when new messages come in, stick to the bottom
      if (elem.scrollHeight < elem.scrollTop + elem.clientHeight + 400) {
        snapshotRef.current = {
          type: 'bottom',
        };
        return;
      }

      // Otherwise stick to the current position
      snapshotRef.current = null;
      return;
    }
    snapshotRef.current = null;
  });

  // componentDidUpdate - apply snapshot and handle onMessagesLoaded
  React.useLayoutEffect(() => {
    const prev = prevPropsRef.current;
    
    if (!prev) {
      prevPropsRef.current = props;
      return;
    }

    // after the messages load, pass it back to the thread container so that
    // it can populate @ mention suggestions
    const prevData = prev.data;
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

    const snapshot = snapshotRef.current;
    if (snapshot) {
      const elem = document.getElementById('main');
      if (!elem) {
        prevPropsRef.current = props;
        return;
      }
      switch (snapshot.type) {
        case 'bottom': {
          elem.scrollTop = elem.scrollHeight;
          break;
        }
        case 'persist': {
          if (snapshot.values) {
            elem.scrollTop =
              elem.scrollHeight - snapshot.values.height + snapshot.values.top;
          }
          break;
        }
        default: {
          break;
        }
      }
    }

    prevPropsRef.current = props;
  });

  const { thread: threadFromData } = data;
  if (threadFromData && threadFromData.messageConnection) {
    const { messageConnection } = threadFromData;
    const { edges } = messageConnection;

    if (edges.length === 0) return <NullMessages />;

    const unsortedMessages = edges.map(message => message && message.node);
    const sortedMessages = sortAndGroupMessages(unsortedMessages);

    if (!sortedMessages || sortedMessages.length === 0)
      return <NullMessages />;

    return (
      <React.Fragment>
        {messageConnection.pageInfo.hasPreviousPage && (
          <NextPageButton
            isFetchingMore={isFetchingMore}
            fetchMore={loadPreviousPage}
            automatic={!!threadFromData.watercooler}
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
          thread={threadFromData}
          uniqueMessageCount={unsortedMessages.length}
          messages={sortedMessages}
          threadType={'story'}
          isWatercooler={threadFromData.watercooler}
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
