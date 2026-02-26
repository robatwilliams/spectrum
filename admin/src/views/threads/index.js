import React from 'react';
import compose from 'recompose/compose';
import pure from 'recompose/pure';
import { View } from './style';
import { topThreadsQuery } from '../../api/queries';
import TopThreads from './components/topThreads';
import { displayLoadingState } from '../../components/loading';

const ThreadsView = (props) => {
  const { topThreads: threads } = props.data.meta;
  return (
    <View>
      <TopThreads threads={threads} />
    </View>
  );
};

export default compose(topThreadsQuery, displayLoadingState, pure)(ThreadsView);
