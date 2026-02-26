import React from 'react';
import compose from 'recompose/compose';
import pure from 'recompose/pure';
import { getUserByUsername } from '../../../api/queries';
import { displayLoadingState } from '../../../components/loading';
import ProfileHeader from '../../../components/profileHeader';
import { View, UserCommunitySettingsContainer } from '../style';

const UserContainer = (props) => {
  const { data: { error, user } } = props;
  if (error || !user) {
    return <div />;
  }

  return (
    <View inner>
      <ProfileHeader user={user} />
      <UserCommunitySettingsContainer>
        Coming soon
      </UserCommunitySettingsContainer>
    </View>
  );
};

export default compose(getUserByUsername, displayLoadingState, pure)(
  UserContainer
);
