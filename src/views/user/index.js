// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import querystring from 'query-string';
import {
  withRouter,
  type History,
  type Location,
  type Match,
} from 'react-router';
import { connect } from 'react-redux';
import generateMetaInfo from 'shared/generate-meta-info';
import Head from 'src/components/head';
import ThreadFeed from 'src/components/threadFeed';
import { UserProfileCard } from 'src/components/entities';
import { setTitlebarProps } from 'src/actions/titlebar';
import CommunityList from './components/communityList';
import Search from './components/search';
import { withCurrentUser } from 'src/components/withCurrentUser';
import { UserAvatar } from 'src/components/avatar';
import {
  getUserByMatch,
  type GetUserType,
} from 'shared/graphql/queries/user/getUser';
import getUserThreads from 'shared/graphql/queries/user/getUserThreadConnection';
import { ErrorView, LoadingView } from 'src/views/viewHelpers';
import viewNetworkHandler from 'src/components/viewNetworkHandler';
import type { Dispatch } from 'redux';
import { SegmentedControl, Segment } from 'src/components/segmentedControl';
import {
  ViewGrid,
  SecondaryPrimaryColumnGrid,
  PrimaryColumn,
  SecondaryColumn,
} from 'src/components/layout';
import {
  SidebarSection,
  SidebarSectionHeader,
  SidebarSectionHeading,
} from 'src/views/community/style';
import {
  NullColumn,
  NullColumnHeading,
  NullColumnSubheading,
} from 'src/components/threadFeed/style';
import { PrimaryOutlineButton } from 'src/components/button';
import Icon from 'src/components/icon';
import { MobileUserAction } from 'src/components/titlebar/actions';
import { FeedsContainer } from './style';
import { InfoContainer } from 'src/views/community/style';

const ThreadFeedWithData = compose(
  connect(),
  getUserThreads
)(ThreadFeed);
const ThreadParticipantFeedWithData = compose(
  connect(),
  getUserThreads
)(ThreadFeed);

type Props = {
  match: Match,
  currentUser: Object,
  data: {
    user: GetUserType,
  },
  isLoading: boolean,
  queryVarIsChanging: boolean,
  dispatch: Dispatch<Object>,
  history: History,
  location: Location,
};

const UserView = (props: Props) => {
  const {
    dispatch,
    data,
    isLoading,
    queryVarIsChanging,
    match,
    location,
    history,
    currentUser,
  } = props;
  const [hasThreads, setHasThreads] = React.useState(true);
  const prevDataRef = React.useRef(data);

  const setDefaultTab = () => {
    const { search } = location;
    const { tab } = querystring.parse(search);
    if (!tab)
      history.replace({
        ...location,
        search: querystring.stringify({ tab: 'posts' }),
      });
  };

  React.useEffect(() => {
    if (data && data.user) {
      setDefaultTab();

      dispatch(
        setTitlebarProps({
          title: data.user.name,
          titleIcon: (
            <UserAvatar
              isClickable={false}
              showOnlineStatus={false}
              user={data.user}
              size={24}
            />
          ),
          rightAction: <MobileUserAction user={data.user} />,
        })
      );
    }
  }, []);

  React.useEffect(() => {
    const prevData = prevDataRef.current;

    if (!prevData || !data) {
      prevDataRef.current = data;
      return;
    }

    if (!prevData.user && data.user) {
      setDefaultTab();

      dispatch(
        setTitlebarProps({
          title: data.user.name,
          titleIcon: (
            <UserAvatar
              isClickable={false}
              showOnlineStatus={false}
              user={data.user}
              size={24}
            />
          ),
          rightAction: <MobileUserAction user={data.user} />,
        })
      );
    }
    // track when a new profile is viewed without the component having been remounted
    else if (prevData.user && data.user && prevData.user.id !== data.user.id) {
      setDefaultTab();
      dispatch(
        setTitlebarProps({
          title: data.user.name,
          titleIcon: (
            <UserAvatar
              isClickable={false}
              showOnlineStatus={false}
              user={data.user}
              size={24}
            />
          ),
          rightAction: <MobileUserAction user={data.user} />,
        })
      );
    }

    prevDataRef.current = data;
  });

  const hasNoThreadsCallback = () => setHasThreads(false);
  const hasThreadsCallback = () => setHasThreads(true);

  const handleSegmentClick = (tab: string) => {
    return history.replace({
      ...location,
      search: querystring.stringify({ tab }),
    });
  };

  const { user } = data;
  const { username } = match.params;
  const { search } = location;
  const { tab } = querystring.parse(search);
  const selectedView = tab;

  if (queryVarIsChanging) {
    return <LoadingView />;
  }

  if (user && user.id) {
    const isCurrentUser = currentUser && user.id === currentUser.id;
    const { title, description } = generateMetaInfo({
      type: 'user',
      data: {
        name: user.name,
        username: user.username,
        description: user.description,
      },
    });

    const Feed =
      selectedView === 'posts'
        ? ThreadFeedWithData
        : ThreadParticipantFeedWithData;

    return (
      <React.Fragment>
        <Head
          title={title}
          description={description}
          image={user.profilePhoto}
          type="profile"
        >
          <meta property="profile:last_name" content={user.name} />
          <meta property="profile:username" content={user.username} />
        </Head>

        <ViewGrid data-cy="user-view">
          <SecondaryPrimaryColumnGrid>
            <SecondaryColumn>
              <SidebarSection>
                <UserProfileCard user={user} />
              </SidebarSection>

              <SidebarSection>
                <SidebarSectionHeader>
                  <SidebarSectionHeading>Communities</SidebarSectionHeading>
                </SidebarSectionHeader>

                <CommunityList
                  currentUser={currentUser}
                  user={user}
                  id={user.id}
                />
              </SidebarSection>
            </SecondaryColumn>
            <PrimaryColumn>
              <FeedsContainer>
                <SegmentedControl>
                  <Segment
                    onClick={() => handleSegmentClick('posts')}
                    isActive={selectedView === 'posts'}
                    data-cy="user-posts-tab"
                  >
                    Posts
                  </Segment>

                  <Segment
                    onClick={() => handleSegmentClick('activity')}
                    isActive={selectedView === 'activity'}
                    data-cy="user-activity-tab"
                  >
                    Activity
                  </Segment>

                  <Segment
                    onClick={() => handleSegmentClick('info')}
                    hideOnDesktop
                    isActive={selectedView === 'info'}
                    data-cy="user-info-tab"
                  >
                    Info
                  </Segment>

                  <Segment
                    onClick={() => handleSegmentClick('search')}
                    isActive={selectedView === 'search'}
                    data-cy="user-search-tab"
                  >
                    Search
                  </Segment>
                </SegmentedControl>

                {hasThreads &&
                  (selectedView === 'posts' || selectedView === 'activity') && (
                    <Feed
                      userId={user.id}
                      username={username}
                      viewContext={
                        selectedView === 'activity'
                          ? 'userProfileReplies'
                          : 'userProfile'
                      }
                      hasNoThreads={hasNoThreadsCallback}
                      hasThreads={hasThreadsCallback}
                      kind={
                        selectedView === 'posts' ? 'creator' : 'participant'
                      }
                      id={user.id}
                    />
                  )}

                {selectedView === 'search' && <Search user={user} />}

                {selectedView === 'info' && (
                  <InfoContainer>
                    <SidebarSection>
                      <UserProfileCard user={user} />
                    </SidebarSection>

                    <SidebarSection>
                      <SidebarSectionHeader>
                        <SidebarSectionHeading>
                          Communities
                        </SidebarSectionHeading>
                      </SidebarSectionHeader>

                      <CommunityList
                        currentUser={currentUser}
                        user={user}
                        id={user.id}
                      />
                    </SidebarSection>
                  </InfoContainer>
                )}

                {!hasThreads &&
                  (selectedView === 'posts' || selectedView === 'activity') && (
                    <NullColumn>
                      <span>
                        <NullColumnHeading>No posts yet</NullColumnHeading>
                        <NullColumnSubheading>
                          Posts will show up here as they are published and when
                          conversations are joined.
                        </NullColumnSubheading>
                        {isCurrentUser && (
                          <PrimaryOutlineButton
                            to={{
                              pathname: '/new/thread',
                              state: { modal: true },
                            }}
                          >
                            <Icon glyph={'post'} size={24} />
                            New post
                          </PrimaryOutlineButton>
                        )}
                      </span>
                    </NullColumn>
                  )}
              </FeedsContainer>
            </PrimaryColumn>
          </SecondaryPrimaryColumnGrid>
        </ViewGrid>
      </React.Fragment>
    );
  }

  if (isLoading) {
    return <LoadingView />;
  }

  if (!user) {
    return (
      <ErrorView
        heading={'We couldn’t find a user with this username'}
        subheading={
          'You may be trying to view a profile that is deleted, or Spectrum is just having a hiccup. If you think something has gone wrong, please contact us.'
        }
      />
    );
  }

  return <ErrorView />;
};

export default compose(
  getUserByMatch,
  withCurrentUser,
  viewNetworkHandler,
  withRouter,
  connect()
)(UserView);
