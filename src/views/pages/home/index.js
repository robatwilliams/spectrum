// @flow
import * as React from 'react';
import { Overview, Centralized, CommunitySearch, Chat, Yours } from '../view';
import PageFooter from '../components/footer';
import { Wrapper } from '../style';

const Splash = () => {
  return (
    <Wrapper data-cy="home-page">
      <Overview />
      <Centralized />
      <CommunitySearch />
      <Chat />
      <Yours />
      <PageFooter />
    </Wrapper>
  );
};

export default Splash;
