// @flow
import * as React from 'react';
import type { GetThreadType } from 'shared/graphql/queries/thread/getThread';
import ThreadHeader from './threadHeader';
import UserProfileThreadHeader from './userProfileThreadHeader';

export type HeaderProps = {
  thread: GetThreadType,
  active: boolean,
  currentUser: ?Object,
  viewContext?:
    | ?'inbox'
    | 'communityInbox'
    | 'communityProfile'
    | 'channelInbox'
    | 'channelProfile'
    | 'userProfile'
    | 'userProfileReplies',
};

const Header = (props: HeaderProps) => {
  if (
    props.viewContext === 'userProfile' ||
    props.viewContext === 'userProfileReplies'
  ) {
    return <UserProfileThreadHeader {...props} />;
  }

  return <ThreadHeader {...props} />;
};

export default Header;
