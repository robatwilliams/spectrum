// @flow
import * as React from 'react';
import { Query } from 'react-apollo';
import {
  getUserByUsernameQuery,
  type GetUserType,
} from 'shared/graphql/queries/user/getUser';
import { UserHoverProfile } from 'src/components/hoverProfile';
import AvatarImage from './image';
import { Container, AvatarLink, OnlineIndicator } from './style';
import ConditionalWrap from 'src/components/conditionalWrap';

type HandlerProps = {
  user?: GetUserType,
  username?: string,
  size?: number,
  mobilesize?: number,
  style?: Object,
  showHoverProfile?: boolean,
  showOnlineStatus?: boolean,
  isClickable?: boolean,
  dataCy?: string,
  onlineBorderColor?: ?Function,
};

type AvatarProps = {
  ...$Exact<HandlerProps>,
  user: GetUserType,
};

const GetUserByUsername = (props: HandlerProps) => {
  const { username, showHoverProfile = true } = props;
  return (
    <Query variables={{ username }} query={getUserByUsernameQuery}>
      {({ data }) => {
        if (!data || !data.user) return null;
        return (
          <ConditionalWrap
            condition={showHoverProfile}
            wrap={() => (
              <UserHoverProfile username={props.username}>
                <Avatar user={data.user} {...props} />
              </UserHoverProfile>
            )}
          >
            <Avatar user={data.user} {...props} />
          </ConditionalWrap>
        );
      }}
    </Query>
  );
};

const Avatar = (props: AvatarProps) => {
  const {
    user,
    dataCy,
    size = 32,
    mobilesize,
    style,
    showOnlineStatus = true,
    isClickable = true,
    onlineBorderColor = null,
  } = props;

  const src = user.profilePhoto;

  const userFallback = '/img/default_avatar.svg';
  const source = [src, userFallback];

  return (
    <Container
      style={style}
      type={'user'}
      data-cy={dataCy}
      size={size}
      mobileSize={mobilesize}
    >
      {showOnlineStatus && user.isOnline && (
        <OnlineIndicator onlineBorderColor={onlineBorderColor} />
      )}
      <ConditionalWrap
        condition={!!user.username && isClickable}
        wrap={() => (
          <AvatarLink to={`/users/${user.username}`}>
            <AvatarImage
              src={source}
              size={size}
              mobilesize={mobilesize}
              type={'user'}
              alt={user.name || user.username}
            />
          </AvatarLink>
        )}
      >
        <AvatarImage
          src={source}
          size={size}
          mobilesize={mobilesize}
          type={'user'}
          alt={user.name || user.username}
        />
      </ConditionalWrap>
    </Container>
  );
}

const AvatarHandler = (props: HandlerProps) => {
  const { showHoverProfile = true, isClickable } = props;

  if (props.user) {
    const user = props.user;
    return (
      <ConditionalWrap
        condition={showHoverProfile}
        wrap={() => (
          <UserHoverProfile username={user.username}>
            <Avatar {...props} />
          </UserHoverProfile>
        )}
      >
        <Avatar {...props} />
      </ConditionalWrap>
    );
  }

  if (!props.user && props.username) {
    return (
      <GetUserByUsername
        username={props.username}
        isClickable={isClickable}
      />
    );
  }

  return null;
}

export default AvatarHandler;
