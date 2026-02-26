import React, { useState } from 'react';
import ThreadListItem from './threadListItem';
import { SectionCard, SectionTitle, Filter, FilterOption } from '../style';

type Thread = {
  id: string,
  content: {
    title: string,
  },
  messageCount: number,
  createdAt: string,
  creator: {
    id: string,
    username: string,
    name: string,
    profilePhoto: string,
  },
};

const TopThreads = ({ threads }) => {
  const [sortedBy, setSortedBy] = useState('messageCount');

  const sort = (sortedBy) => {
    setSortedBy(sortedBy);
  };

  let sortedThreads;
  if (sortedBy === 'messageCount') {
    sortedThreads = threads
      .slice()
      .filter(t => !t.channel.isPrivate)
      .sort((a, b) => {
        const bc = parseInt(b.messageCount, 10);
        const ac = parseInt(a.messageCount, 10);
        return bc <= ac ? -1 : 1;
      });
  }

  if (sortedBy === 'communityId') {
    const obj = {};
    sortedThreads = threads
      .slice()
      .filter(t => !t.channel.isPrivate)
      .map(t => {
        if (obj[t.community.id]) {
          obj[t.community.id] = [...obj[t.community.id], t];
        } else {
          obj[t.community.id] = [t];
        }
        return t;
      });

    const arr = [];
    Object.keys(obj).map(k => {
      const matches = sortedThreads.filter(t => t.community.id === k);
      arr.push(...matches);
    });

    sortedThreads = arr;
  }

  return (
    <SectionCard>
      <SectionTitle>Top conversations this week</SectionTitle>

      <Filter>
        <FilterOption
          active={sortedBy === 'messageCount'}
          onClick={() => sort('messageCount')}
        >
          Message count
        </FilterOption>
        <FilterOption
          active={sortedBy === 'communityId'}
          onClick={() => sort('communityId')}
        >
          Community
        </FilterOption>
      </Filter>

      {sortedThreads.map(thread => {
        return <ThreadListItem key={thread.id} thread={thread} />;
      })}
    </SectionCard>
  );
};

export default TopThreads;
