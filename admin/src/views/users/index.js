import React from 'react';
// $FlowFixMe
import compose from 'recompose/compose';
// $FlowFixMe
import pure from 'recompose/pure';
import { View } from './style';
import { usersQuery } from '../../api/queries';
import { displayLoadingState } from '../../components/loading';
import Chart from '../../components/spark-line';
import getGrowthPerDay from '../../utils/get-growth-per-day';
// import Search from './components/search';
import UserContainer from './containers/user';

const UsersViewIndex = (props) => {
  const { data: { error, meta }, match } = props;
  if (!meta || error) {
    return <div />;
  }

  const userGrowth = getGrowthPerDay(meta.userGrowth);

  if (match.params.username) {
    return (
      <View>
        <UserContainer username={match.params.username} />
      </View>
    );
  } else {
    return (
      <View>
        <Chart height={128} data={userGrowth} />
      </View>
    );
  }
};

export default compose(usersQuery, displayLoadingState, pure)(UsersViewIndex);
