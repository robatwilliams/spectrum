// @flow
import * as React from 'react';
import { storeItem, getItemFromStorage } from 'src/helpers/localStorage';
import { Overview, Centralized, CommunitySearch, Chat, Yours } from '../view';
import PageFooter from '../components/footer';
import { Wrapper } from '../style';

const Splash = () => {
  const preferredSigninMethod = getItemFromStorage('preferred_signin_method');

  const trackSignin = (type: string, method: string) => {
    storeItem('preferred_signin_method', method);
  };

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
