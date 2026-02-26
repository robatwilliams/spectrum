import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import compose from 'recompose/compose';
import SetUsername from 'src/components/setUsername';
import { Button, OutlineButton } from 'src/components/button';
import { NullCard } from './index';
import {
  LargeEmoji,
  Title,
  SmallTitle,
  Subtitle,
  SmallSubtitle,
} from './style';
import {
  Section,
  SectionHeader,
  SectionHeaderNumber,
  ButtonRow,
  FriendlyError,
} from './newUserUpsellStyles';

const UpsellNewUser = (props) => {
  const { user, communities, history, graduate } = props;
  
  const [joinedCommunities, setJoinedCommunities] = useState(0);
  const [error, setError] = useState('');
  const [savedUsername, setSavedUsername] = useState(user.username ? user.username : false);

  const handleGraduate = () => {
    if ((joinedCommunities > 0 || communities) && savedUsername) {
      graduate();
    } else {
      let newError;
      if (joinedCommunities === 0 && !communities) {
        newError =
          'To get started, try joining some communities above, or creating your own!';
      } else if (!savedUsername) {
        newError = 'Be sure to save your username!';
      }

      setError(newError);
    }
  };

  const joined = () => {
    setJoinedCommunities(prevCount => prevCount + 1);
    setError('');
  };

  const left = () => {
    setJoinedCommunities(prevCount => prevCount - 1);
  };

  const createCommunity = () => {
    history.push('/new/community');
  };

  const clickShareLink = () => {};

  const onUsernameSaved = () => {
    setSavedUsername(true);
  };

  return (
      <NullCard bg="onboarding" repeat={true} noPadding>
        <Section>
          <LargeEmoji>
            <span role="img" aria-label="Howdy!">
              👋
            </span>
          </LargeEmoji>
          <Title>Howdy, {user.name}!</Title>
          <Subtitle>
            Spectrum is a place where communities live. It’s easy to follow the
            things that you care about most, or even create your own community
            to share with the world.
          </Subtitle>
        </Section>

        <Section noPadding>
          <SectionHeader>
            <SectionHeaderNumber>1</SectionHeaderNumber>
          </SectionHeader>

          <SmallTitle>Set your username</SmallTitle>
          <SmallSubtitle>
            Pick a username so that people can find you on Spectrum!
          </SmallSubtitle>

          <SetUsername user={user} usernameSaved={() => onUsernameSaved()} />
        </Section>

        <Section noPadding>
          <SectionHeader>
            <SectionHeaderNumber>2</SectionHeaderNumber>
          </SectionHeader>

          <SmallTitle>Find your people</SmallTitle>
          <SmallSubtitle>
            Join communities that look interesting or fun, and threads posted to
            those communities will start showing up in your home feed!
          </SmallSubtitle>
        </Section>

        <Section>
          <SectionHeader>
            <SectionHeaderNumber>3</SectionHeaderNumber>
          </SectionHeader>

          <SmallTitle>More fun with friends</SmallTitle>
          <SmallSubtitle>
            Interneting is more fun with friends - invite your favorite people
            to join the conversation!
          </SmallSubtitle>

          <ButtonRow>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=https://spectrum.chat&t=Come hang out with me on Spectrum, a new place on the internet for communities!`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button onClick={() => clickShareLink('facebook')}>
                Share on Facebook
              </Button>
            </a>
            <a
              href={`https://twitter.com/share?text=Come hang out with me on @withspectrum, a new place on the internet for communities!&url=https://spectrum.chat`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button onClick={() => clickShareLink('twitter')}>
                Share on Twitter
              </Button>
            </a>
          </ButtonRow>
        </Section>

        <Section>
          <SectionHeader>
            <SectionHeaderNumber>4</SectionHeaderNumber>
          </SectionHeader>

          <SmallTitle>Build a community</SmallTitle>
          <SmallSubtitle>
            Already run an online community? Or have you been dreaming of
            building a new space for people who like the same things? Create a
            community in less than a minute:
          </SmallSubtitle>

          <OutlineButton onClick={createCommunity}>
            Create a community
          </OutlineButton>
        </Section>

        <Section>
          <SectionHeader>
            <SectionHeaderNumber>5</SectionHeaderNumber>
          </SectionHeader>

          <SmallTitle>All set?</SmallTitle>
          <SmallSubtitle>
            Once you’ve found a few communities and topics, or created your own,
            you’re ready to go!
          </SmallSubtitle>

          {error && (
            <FriendlyError>{error}</FriendlyError>
          )}

          <Button onClick={handleGraduate}>Cool! Take me home.</Button>
        </Section>
      </NullCard>
    );
};

export default compose(
  withRouter,
  connect()
)(UpsellNewUser);
