// @flow
import * as React from 'react';
import { useState } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { PrimaryButton } from 'src/components/button';
import Icon from 'src/components/icon';
import { Link } from 'react-router-dom';
import { Logo } from 'src/components/logo';
import { UserAvatar } from 'src/components/avatar';
import Head from 'src/components/head';
import { withCurrentUser } from 'src/components/withCurrentUser';
import {
  NavContainer,
  Tabs,
  LogoTab,
  MenuTab,
  SupportTab,
  FeaturesTab,
  LoginTab,
  AppsTab,
  AuthTab,
  LogoLink,
  AuthLink,
  LoginLink,
  SupportLink,
  FeaturesLink,
  AppsLink,
  ExploreLink,
  MenuContainer,
  MenuOverlay,
} from '../style';

type Props = {
  currentUser: Object,
  location: Object,
  dark?: boolean,
};

const Nav = (props: Props) => {
  const { currentUser, location, dark } = props;
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const toggleMenu = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  return (
    <NavContainer data-cy="navigation-splash">
      <Head
        title={'Spectrum'}
        description={'The community platform for the future.'}
      >
        <link
          rel="shortcut icon"
          id="dynamic-favicon"
          // $FlowIssue
          href={`${process.env.PUBLIC_URL}/img/favicon.ico`}
        />
      </Head>
      <Tabs>
        <LogoTab
          dark={dark}
          to="/about"
          data-cy="navigation-splash-about"
        >
          <Logo />
          <Icon glyph={'logo'} />
        </LogoTab>
        <FeaturesTab
          dark={dark}
          selected={location === 'features'}
          to="/features"
          data-cy="navigation-splash-features"
        >
          Features
        </FeaturesTab>
        <AppsTab
          dark={dark}
          selected={location === 'apps'}
          to="/apps"
          data-cy="navigation-splash-apps"
        >
          Apps
        </AppsTab>
        <SupportTab
          dark={dark}
          selected={location === 'support'}
          to="/support"
          data-cy="navigation-splash-support"
        >
          Support
        </SupportTab>
        {currentUser ? (
          <AuthTab dark={dark}>
            <Link to={'/'}>
              <UserAvatar
                user={currentUser}
                dataCy="navigation-splash-profile"
                clickable={false}
                showOnlineStatus={false}
                showHoverProfile={false}
              />
            </Link>
          </AuthTab>
        ) : (
          <React.Fragment>
            <LoginTab
              dark={dark}
              selected={location === 'login'}
              to="/login"
              data-cy="navigation-splash-login"
            >
              Log in
            </LoginTab>
            <AuthTab dark={dark}>
              <Link to="/new/user">
                <PrimaryButton
                  data-cy="navigation-splash-signin"
                  style={{
                    fontWeight: '700',
                    fontSize: '16px',
                    letterSpacing: '0.5px',
                  }}
                >
                  Sign up
                </PrimaryButton>
              </Link>
            </AuthTab>
          </React.Fragment>
        )}
        <MenuTab dark={dark} open={menuIsOpen}>
          <Icon
            glyph={menuIsOpen ? 'view-close' : 'menu'}
            onClick={() => toggleMenu()}
          />
          <MenuContainer open={menuIsOpen}>
            <LogoLink to="/">
              <Logo />
            </LogoLink>
            <FeaturesLink
              to="/features"
              selected={location === 'features'}
            >
              Features
            </FeaturesLink>
            <AppsLink to="/apps" selected={location === 'apps'}>
              Apps
            </AppsLink>
            <SupportLink
              to="/support"
              selected={location === 'support'}
            >
              Support
            </SupportLink>
            <ExploreLink
              to="/explore"
              selected={location === 'explore'}
            >
              Explore
            </ExploreLink>
            {currentUser ? (
              <AuthLink to={'/'}>
                <span>Return home</span>
              </AuthLink>
            ) : (
              <React.Fragment>
                <LoginLink to={'/login'}>
                  <span>Log in</span>
                </LoginLink>
                <AuthLink to={'/new/user'}>
                  <span>Sign up</span>
                </AuthLink>
              </React.Fragment>
            )}
          </MenuContainer>
          <MenuOverlay
            onClick={() => toggleMenu()}
            open={menuIsOpen}
          />
        </MenuTab>
      </Tabs>
    </NavContainer>
  );
};

export default compose(
  withCurrentUser,
  connect()
)(Nav);
