import React from 'react';
import compose from 'recompose/compose';
import pure from 'recompose/pure';
import { getCommunityBySlug } from '../../../api/community';
import { displayLoadingState } from '../../../components/loading';
import { CommunityProfileHeader } from '../../../components/profileHeader';
import { View, CommunitySettingsContainer, SectionHeader } from '../style';

const UserContainer = (props) => {
  const { data: { error, community } } = props;
  if (error || !community) {
    return <div />;
  }

  return (
    <View inner>
      <CommunityProfileHeader community={community} />
      <CommunitySettingsContainer>
        <SectionHeader>Communities</SectionHeader>
        <p>coming soon...</p>
      </CommunitySettingsContainer>
    </View>
  );
};

export default compose(getCommunityBySlug, displayLoadingState, pure)(
  UserContainer
);
