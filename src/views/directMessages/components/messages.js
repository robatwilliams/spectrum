// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { sortAndGroupMessages } from 'shared/clients/group-messages';
import ChatMessages from 'src/components/messageGroup';
import { Loading } from 'src/components/loading';
import viewNetworkHandler from 'src/components/viewNetworkHandler';
import NextPageButton from 'src/components/nextPageButton';
import getDirectMessageThreadMessages from 'shared/graphql/queries/directMessageThread/getDirectMessageThreadMessageConnection';
import type { GetDirectMessageThreadMessageConnectionType } from 'shared/graphql/queries/directMessageThread/getDirectMessageThreadMessageConnection';
import setLastSeenMutation from 'shared/graphql/mutations/directMessageThread/setDMThreadLastSeen';
import { MessagesScrollWrapper } from './style';
import { ErrorBoundary } from 'src/components/error';

type Props = {
  id: string,
  data: {
    loading: boolean,
    directMessageThread: GetDirectMessageThreadMessageConnectionType,
    messages: Array<Object>,
    hasNextPage: boolean,
    fetchMore: Function,
  },
  subscribeToNewMessages: Function,
  isLoading: boolean,
  hasError: boolean,
  isFetchingMore: boolean,
  setLastSeen: Function,
};

const MessagesWithData = (props: Props) => {
  const {
    data,
    subscribeToNewMessages,
    setLastSeen,
    hasError,
    isLoading,
    isFetchingMore,
  } = props;
  const subscriptionRef = React.useRef(null);
  const prevDataRef = React.useRef(null);
  const scrollActionRef = React.useRef(null);

  React.useEffect(() => {
    subscriptionRef.current = subscribeToNewMessages();

    const thread = data.directMessageThread;
    // Scroll to bottom on mount if we got cached data
    if (thread) {
      const elem = document.getElementById('main');
      if (elem) {
        elem.scrollTop = elem.scrollHeight;
      }
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
    };
  }, []);

  React.useLayoutEffect(() => {
    const prev = prevDataRef.current;
    const curr = data;

    if (prev && prev.directMessageThread && curr.directMessageThread) {
      // First load
      if (
        !prev.directMessageThread &&
        curr.directMessageThread &&
        curr.directMessageThread.messageConnection.edges.length > 0
      ) {
        scrollActionRef.current = { type: 'bottom' };
      }
      // New messages
      else if (
        prev.directMessageThread &&
        curr.directMessageThread &&
        prev.directMessageThread.messageConnection.edges.length <
          curr.directMessageThread.messageConnection.edges.length
      ) {
        const elem = document.getElementById('main');
        if (elem) {
          // If we are near the bottom when new messages come in, stick to the bottom
          if (elem.scrollHeight < elem.scrollTop + elem.clientHeight + 400) {
            scrollActionRef.current = { type: 'bottom' };
          } else {
            const prevEdges = prev.directMessageThread.messageConnection.edges.filter(
              Boolean
            );
            const currEdges = curr.directMessageThread.messageConnection.edges.filter(
              Boolean
            );
            // If messages were added at the end, keep the scroll position the same
            if (
              currEdges[currEdges.length - 1].node.id !==
              prevEdges[prevEdges.length - 1].node.id
            ) {
              // If messages were added at the top, persist the scroll position
              scrollActionRef.current = {
                type: 'persist',
                values: {
                  top: elem.scrollTop,
                  height: elem.scrollHeight,
                },
              };
            }
          }
        }
      }
    }

    // Apply scroll action
    if (scrollActionRef.current) {
      const elem = document.getElementById('main');
      if (elem) {
        switch (scrollActionRef.current.type) {
          case 'bottom': {
            elem.scrollTop = elem.scrollHeight;
            break;
          }
          case 'persist': {
            const { values } = scrollActionRef.current;
            elem.scrollTop = elem.scrollHeight - values.height + values.top;
            break;
          }
          default: {
            break;
          }
        }
      }
      scrollActionRef.current = null;
    }

    // Handle thread changes
    const firstLoad = !prev && curr.directMessageThread;
    const newThread =
      prev &&
      prev.directMessageThread &&
      curr.directMessageThread &&
      prev.directMessageThread.id !== curr.directMessageThread.id;

    if (firstLoad) {
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
      subscriptionRef.current = subscribeToNewMessages();
      setLastSeen(curr.directMessageThread.id);
    } else if (newThread) {
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
      subscriptionRef.current = subscribeToNewMessages();
      setLastSeen(curr.directMessageThread.id);
    }

    prevDataRef.current = data;
  });

  const { messages, directMessageThread, hasNextPage, fetchMore } = data;

  if (hasError) {
    return <div>Error!</div>;
  }

  // NOTE(@mxstbr): The networkStatus check shouldn't be there, but if I remove
  // it the loading indicator doesn't show when switching between threads which
  // is hella annoying as the old msgs stick around until the new ones are there.
  // TODO: FIXME and remove the networkStatus === 7
  if (isFetchingMore || (messages && messages.length > 0)) {
    let unsortedMessages = messages.map(message => message.node);

    const unique = array => {
      const processed = [];
      for (let i = array.length - 1; i >= 0; i--) {
        if (processed.indexOf(array[i].id) < 0) {
          processed.push(array[i].id);
        } else {
          array.splice(i, 1);
        }
      }
      return array;
    };

    const uniqueMessages = unique(unsortedMessages);
    const sortedMessages = sortAndGroupMessages(uniqueMessages);

    return (
      <MessagesScrollWrapper>
        <ErrorBoundary>
          {hasNextPage && (
            <NextPageButton
              isFetchingMore={isFetchingMore}
              fetchMore={fetchMore}
            />
          )}
          <ChatMessages
            messages={sortedMessages}
            uniqueMessageCount={uniqueMessages.length}
            threadType={'directMessageThread'}
            thread={directMessageThread}
          />
        </ErrorBoundary>
      </MessagesScrollWrapper>
    );
  }

  if (isLoading) {
    return (
      <MessagesScrollWrapper>
        <Loading style={{ padding: '64px 0' }} />
      </MessagesScrollWrapper>
    );
  }

  return null;
};

const Messages = compose(
  setLastSeenMutation,
  getDirectMessageThreadMessages,
  viewNetworkHandler
)(MessagesWithData);

export default Messages;
