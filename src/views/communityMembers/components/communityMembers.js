// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { withApollo } from 'react-apollo';
import { Loading } from 'src/components/loading';
import GetMembers from './getMembers';
import EditDropdown from './editDropdown';
import Search from './search';
import queryString from 'query-string';
import { withCurrentUser } from 'src/components/withCurrentUser';
import {
  SectionCard,
  SectionTitle,
  SectionCardFooter,
} from 'src/components/settingsViews/style';
import Icon from 'src/components/icon';
import {
  Filters,
  Filter,
  SearchFilter,
  SearchInput,
  SearchForm,
  FetchMore,
  Row,
} from '../style';
import { ListContainer } from 'src/components/listItems/style';
import ViewError from 'src/components/viewError';
import { UserListItem } from 'src/components/entities';
import { Notice } from 'src/components/listItems/style';
import type { Dispatch } from 'redux';

type Props = {
  id: string,
  client: Object,
  currentUser: Object,
  dispatch: Dispatch<Object>,
  history: Object,
  location: Object,
  community: Object,
};

const CommunityMembers = (props: Props) => {
  const { id, community, currentUser, location } = props;

  const [filter, setFilter] = React.useState({ isMember: true, isBlocked: false });
  const [searchIsFocused, setSearchIsFocused] = React.useState(false);
  const [searchString, setSearchString] = React.useState('');
  const [queryString, setQueryString] = React.useState('');

  const viewMembers = React.useCallback(() => {
    setFilter({ isMember: true, isBlocked: false });
    setSearchIsFocused(false);
  }, []);

  const viewPending = React.useCallback(() => {
    setFilter({ isPending: true });
    setSearchIsFocused(false);
  }, []);

  const viewTeam = React.useCallback(() => {
    setFilter({ isModerator: true, isOwner: true });
    setSearchIsFocused(false);
  }, []);

  const viewBlocked = React.useCallback(() => {
    setFilter({ isBlocked: true });
    setSearchIsFocused(false);
  }, []);

  React.useEffect(() => {
    const { filter } = queryString.parse(location.search);
    if (!filter) return;

    if (filter === 'pending') {
      return viewPending();
    }

    if (filter === 'team') {
      return viewTeam();
    }

    if (filter === 'blocked') {
      return viewBlocked();
    }
  }, [location.search, viewPending, viewTeam, viewBlocked]);

  const handleChange = (e: any) => {
    const searchStringValue = e.target && e.target.value;

    if (!searchStringValue || searchStringValue.length === 0) {
      setSearchString('');
      setQueryString('');
      return;
    }

    setSearchString(searchStringValue);
  };

  const initSearch = () => {
    setFilter(null);
    setSearchIsFocused(true);
  };

  const search = e => {
    e.preventDefault();
    if (!searchString || searchString.length === 0) return;
    setQueryString(searchString);
  };

  const generateUserProfile = communityMember => {
    const { user, ...permissions } = communityMember;
    return (
      <React.Fragment>
        <Row style={{ position: 'relative' }}>
          <UserListItem
            userObject={user}
            key={user.id}
            id={user.id}
            name={user.name}
            username={user.username}
            description={user.description}
            isCurrentUser={user.id === currentUser.id}
            isOnline={user.isOnline}
            profilePhoto={user.profilePhoto}
            avatarSize={40}
            showHoverProfile={false}
            messageButton={user.id !== currentUser.id}
          />
          {user.id !== currentUser.id && (
            <EditDropdown
              user={user}
              permissions={permissions}
              community={community}
            />
          )}
        </Row>
      </React.Fragment>
    );
  };

    return (
      <SectionCard>
        <SectionTitle>
          Community Members · {community.metaData.members.toLocaleString()}
        </SectionTitle>

        <Filters>
          <Filter
            onClick={viewMembers}
            active={filter && filter.isMember ? true : false}
          >
            Members
          </Filter>
          <Filter
            onClick={viewTeam}
            active={
              filter && filter.isModerator && filter.isOwner ? true : false
            }
          >
            Team
          </Filter>
          <Filter
            onClick={viewBlocked}
            active={filter && filter.isBlocked ? true : false}
          >
            Blocked
          </Filter>

          {community.isPrivate && (
            <Filter
              onClick={viewPending}
              active={filter && filter.isPending ? true : false}
            >
              Pending
            </Filter>
          )}

          <SearchFilter onClick={initSearch}>
            <SearchForm onSubmit={search}>
              <Icon glyph={'search'} size={28} />
              <SearchInput
                onChange={handleChange}
                type={'text'}
                placeholder={'Search'}
              />
            </SearchForm>
          </SearchFilter>
        </Filters>

        {searchIsFocused && queryString && (
          <Search
            queryString={queryString}
            filter={{ communityId: id }}
            render={({ searchResults, isLoading }) => {
              if (isLoading) {
                return <Loading />;
              }

              if (!searchResults || searchResults.length === 0) {
                const emoji = ' ';

                const heading =
                  searchString.length > 1
                    ? `We couldn't find anyone matching "${searchString}"`
                    : 'Search for people in your community';

                const subheading =
                  searchString.length > 1
                    ? 'Grow your community by inviting people via email, or by importing a Slack team'
                    : 'Find people by name, username, and profile description - try searching for "designer" or "developer"';

                return (
                  <ViewError
                    emoji={emoji}
                    heading={heading}
                    subheading={subheading}
                  />
                );
              }

              return (
                <ListContainer>
                  {searchResults.map(communityMember => {
                    if (!communityMember) return null;
                    return generateUserProfile(communityMember);
                  })}
                </ListContainer>
              );
            }}
          />
        )}

        {searchIsFocused && !queryString && (
          <ViewError
            emoji={' '}
            heading={'Search for community members'}
            subheading={
              'Find people by name or description - try searching for "designer"!'
            }
          />
        )}

        {!searchIsFocused && (
          <GetMembers
            filter={filter}
            id={id}
            render={({ isLoading, community, isFetchingMore, fetchMore }) => {
              const members =
                community &&
                community.members &&
                community.members.edges.map(member => member && member.node);

              if (members && members.length > 0) {
                return (
                  <ListContainer data-cy="community-settings-members-list">
                    {filter && filter.isBlocked && !community.isPrivate && (
                      <Notice>
                        <strong>A note about blocked users:</strong> Your
                        community is publicly viewable (except for private
                        channels). This means that a blocked user may be able to
                        see the content and conversations in your community.
                        However, they will be prevented from creating new
                        conversations, or leaving messages in existing
                        conversations.
                      </Notice>
                    )}

                    {members.map(communityMember => {
                      if (!communityMember) return null;
                      return generateUserProfile(communityMember);
                    })}

                    {community && community.members.pageInfo.hasNextPage && (
                      <SectionCardFooter>
                        <FetchMore
                          color={'brand.default'}
                          loading={isFetchingMore}
                          onClick={fetchMore}
                        >
                          {isFetchingMore ? 'Loading...' : 'Load more'}
                        </FetchMore>
                      </SectionCardFooter>
                    )}
                  </ListContainer>
                );
              }

              if (isLoading) {
                return <Loading />;
              }

              if (!members || members.length === 0) {
                if (filter && filter.isBlocked) {
                  return (
                    <ViewError
                      emoji={' '}
                      heading={'No blocked members found'}
                      subheading={
                        'Nobody has been blocked yet - nice! When someone is blocked, they will appear here'
                      }
                    />
                  );
                }

                if (filter && filter.isMember) {
                  return (
                    <ViewError
                      emoji={' '}
                      heading={'No members found'}
                      subheading={
                        "We couldn't find any members in your community. That's strange..."
                      }
                    />
                  );
                }

                if (filter && filter.isModerator && filter.isOwner) {
                  return (
                    <ViewError
                      emoji={' '}
                      heading={'No team members found'}
                      subheading={
                        "You haven't added any team members to your community yet."
                      }
                    />
                  );
                }

                if (filter && filter.isPending) {
                  return (
                    <ViewError
                      emoji={' '}
                      heading={'No pending members found'}
                      subheading={
                        'There are no pending members in your community.'
                      }
                    />
                  );
                }
              }

              return null;
            }}
          />
        )}
      </SectionCard>
    );
};

export default compose(
  withApollo,
  withCurrentUser,
  withRouter,
  connect()
)(CommunityMembers);
