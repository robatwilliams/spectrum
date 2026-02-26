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
  const subscriptionRef = React.useRef(null);
  const prevPropsRef = React.useRef(null);
  const prevScrollStateRef = React.useRef(null);

  const subscribe = () => {
    subscriptionRef.current = props.subscribeToNewMessages();
  };

  const unsubscribe = () => {
    if (subscriptionRef.current) subscriptionRef.current();
  };

  // componentDidMount and componentWillUnmount
  React.useEffect(() => {
    subscribe();

    const thread = props.data.directMessageThread;
    // Scroll to bottom on mount if we got cached data as getSnapshotBeforeUpdate does not fire for mounts
    if (thread) {
      const elem = document.getElementById('main');
      if (!elem) return;
      elem.scrollTop = elem.scrollHeight;
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // getSnapshotBeforeUpdate and componentDidUpdate pattern
  React.useLayoutEffect(() => {
    const prev = prevPropsRef.current;
    const curr = props;
    const elem = document.getElementById('main');

    let snapshot = null;

    if (prev && elem && prevScrollStateRef.current) {
      // First load
      if (
        !prev.data.directMessageThread &&
        curr.data.directMessageThread &&
        curr.data.directMessageThread.messageConnection.edges.length > 0
      ) {
        snapshot = {
          type: 'bottom',
        };
      }

      // New messages
      if (
        prev.data.directMessageThread &&
        curr.data.directMessageThread &&
        prev.data.directMessageThread.messageConnection.edges.length <
          curr.data.directMessageThread.messageConnection.edges.length
      ) {
        // If we are near the bottom when new messages come in, stick to the bottom
        if (
          prevScrollStateRef.current.scrollHeight <
          prevScrollStateRef.current.scrollTop +
            prevScrollStateRef.current.clientHeight +
            400
        ) {
          snapshot = {
            type: 'bottom',
          };
        } else {
          const prevEdges = prev.data.directMessageThread.messageConnection.edges.filter(
            Boolean
          );
          const currEdges = curr.data.directMessageThread.messageConnection.edges.filter(
            Boolean
          );
          // If messages were added at the end, keep the scroll position the same
          if (
            currEdges[currEdges.length - 1].node.id ===
            prevEdges[prevEdges.length - 1].node.id
          ) {
            snapshot = null;
          } else {
            // If messages were added at the top, persist the scroll position
            snapshot = {
              type: 'persist',
              values: {
                top: prevScrollStateRef.current.scrollTop,
                height: prevScrollStateRef.current.scrollHeight,
              },
            };
          }
        }
      }
    }

    // Apply snapshot (componentDidUpdate logic)
    if (snapshot && elem) {
      switch (snapshot.type) {
        case 'bottom': {
          elem.scrollTop = elem.scrollHeight;
          break;
        }
        case 'persist': {
          elem.scrollTop =
            elem.scrollHeight - snapshot.values.height + snapshot.values.top;
          break;
        }
        default: {
          break;
        }
      }
    }

    // componentDidUpdate subscription management
    if (prev) {
      const { data, setLastSeen } = props;

      const firstLoad =
        !prev.data.directMessageThread && data.directMessageThread;
      const newThread =
        prev.data.directMessageThread &&
        data.directMessageThread &&
        prev.data.directMessageThread.id !== data.directMessageThread.id;

      if (firstLoad) {
        subscribe();
        setLastSeen(data.directMessageThread.id);
      } else if (newThread) {
        unsubscribe();
        subscribe();
        setLastSeen(data.directMessageThread.id);
      }
    }

    // Capture current scroll state for next render
    if (elem) {
      prevScrollStateRef.current = {
        scrollTop: elem.scrollTop,
        scrollHeight: elem.scrollHeight,
        clientHeight: elem.clientHeight,
      };
    }

    prevPropsRef.current = props;
  });

  const {
    data: { messages, directMessageThread, hasNextPage, fetchMore },
    hasError,
    isLoading,
    isFetchingMore,
  } = props;

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
            threadType={"directMessageThread"}
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
