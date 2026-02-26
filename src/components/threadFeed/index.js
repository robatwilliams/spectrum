// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import InfiniteList from 'src/components/infiniteScroll';
import { deduplicateChildren } from 'src/components/infiniteScroll/deduplicateChildren';
import { connect } from 'react-redux';
import InboxThread from 'src/components/inboxThread';
import { LoadingInboxThread } from 'src/components/loading';
import ViewError from 'src/components/viewError';
import type { GetCommunityType } from 'shared/graphql/queries/community/getCommunity';
import type { Dispatch } from 'redux';
import { ErrorBoundary } from 'src/components/error';
import { withCurrentUser } from 'src/components/withCurrentUser';
import { useConnectionRestored } from 'src/hooks/useConnectionRestored';
import type { WebsocketConnectionType } from 'src/reducers/connectionStatus';
import { Container } from './style';
import NullState from './nullState';

type Props = {
  data: {
    subscribeToUpdatedThreads: Function,
    fetchMore: Function,
    networkStatus: number,
    hasNextPage: boolean,
    error: ?Object,
    community?: any,
    channel?: any,
    threads?: Array<any>,
    refetch: Function,
  },
  community: GetCommunityType,
  hasThreads: Function,
  hasNoThreads: Function,
  currentUser: ?Object,
  viewContext?:
    | ?'communityInbox'
    | 'communityProfile'
    | 'channelInbox'
    | 'channelProfile'
    | 'userProfile',
  slug: string,
  pinnedThreadId: ?string,
  dispatch: Dispatch<Object>,
  search?: boolean,
  networkOnline: boolean,
  websocketConnection: WebsocketConnectionType,
};

const ThreadFeedPure = (props: Props) => {
  const {
    data,
    viewContext,
    networkOnline,
    websocketConnection,
    hasThreads,
    hasNoThreads,
    search,
  } = props;

  const subscriptionRef = React.useRef(null);
  const prevPropsRef = React.useRef(props);

  React.useEffect(() => {
    subscriptionRef.current =
      data.subscribeToUpdatedThreads && data.subscribeToUpdatedThreads();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
    };
  }, []);

  React.useEffect(() => {
    const prev = prevPropsRef.current;
    const curr = props;

    const didReconnect = useConnectionRestored({ curr, prev });
    if (didReconnect && curr.data.refetch) {
      curr.data.refetch();
    }

    if (
      !prev.data.thread &&
      curr.data.threads &&
      curr.data.threads.length === 0
    ) {
      if (curr.hasThreads) {
        curr.hasThreads();
      }

      if (curr.hasNoThreads) {
        curr.hasNoThreads();
      }
    }

    prevPropsRef.current = props;
  });

  const { threads, networkStatus, error } = data;

  const threadNodes =
    threads && threads.length > 0
      ? threads
          .slice()
          .map(thread => thread.node)
          .filter(
            thread =>
              !thread.channel.channelPermissions.isBlocked &&
              !thread.community.communityPermissions.isBlocked
          )
      : [];

  let filteredThreads = threadNodes;
  if (
    data.community &&
    data.community.watercooler &&
    data.community.watercooler.id
  ) {
    filteredThreads = filteredThreads.filter(
      // $FlowIssue
      t => t.id !== data.community.watercooler.id
    );
  }
  if (
    data.community &&
    data.community.pinnedThread &&
    data.community.pinnedThread.id
  ) {
    filteredThreads = filteredThreads.filter(
      // $FlowIssue
      t => t.id !== data.community.pinnedThread.id
    );
  }
  if (
    data.channel &&
    data.channel.community &&
    data.channel.community.watercoolerId
  ) {
    filteredThreads = filteredThreads.filter(
      // $FlowIssue
      t => t.id !== data.channel.community.watercoolerId
    );
  }

  const uniqueThreads = deduplicateChildren(filteredThreads, 'id');
  if (uniqueThreads && uniqueThreads.length > 0 && networkStatus === 7) {
    return (
      <Container data-cy="thread-feed">
        {data.community &&
          data.community.pinnedThread &&
          data.community.pinnedThread.id && (
            <ErrorBoundary>
              <InboxThread
                data={data.community.pinnedThread}
                viewContext={viewContext}
                pinnedThreadId={data.community.pinnedThread.id}
              />
            </ErrorBoundary>
          )}

        <InfiniteList
          loadMore={data.fetchMore}
          hasMore={data.hasNextPage}
          loader={<LoadingInboxThread key={0} />}
        >
            {uniqueThreads.map(thread => {
              return (
                <ErrorBoundary key={thread.id}>
                  <InboxThread data={thread} viewContext={viewContext} />
                </ErrorBoundary>
              );
            })}
          </InfiniteList>
        </Container>
      );
    }

    if (networkStatus === 2 || networkStatus === 1) {
      return (
        <Container>
          <LoadingInboxThread />
          <LoadingInboxThread />
          <LoadingInboxThread />
          <LoadingInboxThread />
          <LoadingInboxThread />
          <LoadingInboxThread />
          <LoadingInboxThread />
          <LoadingInboxThread />
          <LoadingInboxThread />
          <LoadingInboxThread />
        </Container>
      );
    }

    if (networkStatus === 8 || error) {
      return (
        <ViewError
          heading={'We ran into an issue loading the feed'}
          subheading={
            'Try refreshing the page below. If you’re still seeing this error, you can email us at hi@spectrum.chat.'
          }
          refresh
        />
      );
    }

  const nullComposerCommunityId = data.community
    ? data.community.id
    : data.channel
    ? data.channel.community.id
    : null;

  return (
    <NullState
      communityId={nullComposerCommunityId}
      channelId={data.channel && data.channel.id}
      isSearch={!!search}
      viewContext={viewContext}
    />
  );
};

const map = state => ({
  networkOnline: state.connectionStatus.networkOnline,
  websocketConnection: state.connectionStatus.websocketConnection,
});

const ThreadFeedPureMemo = React.memo(ThreadFeedPure, (prevProps, nextProps) => {
  if (prevProps.networkOnline !== nextProps.networkOnline) return false;
  if (prevProps.websocketConnection !== nextProps.websocketConnection) return false;
  // fetching more
  if (prevProps.data.networkStatus === 7 && nextProps.data.networkStatus === 3)
    return true;
  return false;
});

const ThreadFeed = compose(
  // $FlowIssue
  connect(map),
  withCurrentUser
)(ThreadFeedPureMemo);

export default ThreadFeed;
