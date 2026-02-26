// @flow
import * as React from 'react';
import type { GetThreadType } from 'shared/graphql/queries/thread/getThread';
import Icon from 'src/components/icon';
import { CountWrapper } from './style';

type Props = {
  currentUser: ?Object,
  thread: GetThreadType,
  active: boolean,
};

const MessageCount = ({ thread: { messageCount }, active }: Props) => {
  return (
    <CountWrapper active={active}>
      <Icon
        style={{ pointerEvents: 'none' }}
        glyph="message-simple"
        size={24}
      />
      <span>{messageCount}</span>
    </CountWrapper>
  );
};

export default MessageCount;
