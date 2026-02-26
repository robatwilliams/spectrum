// @flow
import * as React from 'react';
import styled from 'styled-components';
import type { GetThreadType } from 'shared/graphql/queries/thread/getThread';
import MessageCount from './messageCount';
import { LikeCount } from 'src/components/threadLikes';
import { ThreadActivityWrapper } from './style';
import { NewThreadTimestamp } from './header/style';

const NewMessagesIndicator = styled(NewThreadTimestamp)`
  margin-left: 4px;
  font-size: 13px;
`;

type Props = {
  currentUser: ?Object,
  thread: GetThreadType,
  active: boolean,
  newMessages?: boolean,
};

const ThreadActivity = (props: Props) => {
  const { newMessages, thread, active, currentUser } = props;

  if (!thread) return null;

  return (
    <ThreadActivityWrapper>
      <LikeCount thread={thread} active={active} />
      <MessageCount
        currentUser={currentUser}
        thread={thread}
        active={active}
      />
      {newMessages && <NewMessagesIndicator>(new)</NewMessagesIndicator>}
    </ThreadActivityWrapper>
  );
}

export default ThreadActivity;
