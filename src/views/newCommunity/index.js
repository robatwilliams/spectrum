// @flow
import * as React from 'react';
import { useState, useEffect } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo';
import queryString from 'query-string';
import { Button, TextButton } from 'src/components/button';
import SlackConnection from '../communitySettings/components/slack';
import { CommunityInvitationForm } from 'src/components/emailInvitationForm';
import CreateCommunityForm from './components/createCommunityForm';
import EditCommunityForm from './components/editCommunityForm';
import Stepper from './components/stepper';
import Share from './components/share';
import Head from 'src/components/head';
import Login from 'src/views/login';
import { setTitlebarProps } from 'src/actions/titlebar';
import { getCommunityByIdQuery } from 'shared/graphql/queries/community/getCommunity';
import type { GetCommunityType } from 'shared/graphql/queries/community/getCommunity';
import getCurrentUserSettings, {
  type GetCurrentUserSettingsType,
} from 'shared/graphql/queries/user/getCurrentUserSettings';
import UserEmailConfirmation from 'src/components/userEmailConfirmation';
import { LoadingView } from 'src/views/viewHelpers';
import {
  Actions,
  Container,
  Title,
  Description,
  Divider,
  ContentContainer,
} from './style';
import viewNetworkHandler, {
  type ViewNetworkHandlerType,
} from 'src/components/viewNetworkHandler';
import { ViewGrid, SingleColumnGrid } from 'src/components/layout';

type Props = {
  dispatch: Function,
  ...$Exact<ViewNetworkHandlerType>,
  client: Object,
  history: Object,
  data: {
    user: ?GetCurrentUserSettingsType,
  },
};

const NewCommunity = (props: Props) => {
  const { dispatch, client, history, isLoading, data } = props;
  const { user } = data;

  const parsed = queryString.parse(window.location.search);
  let step = parsed.s;
  const id = parsed.id;

  step = step ? parseInt(step, 10) : 1;

  const [activeStep, setActiveStep] = useState(step);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [community, setCommunity] = useState(null);
  const [existingId, setExistingId] = useState(id || null);
  const [hasInvitedPeople, setHasInvitedPeople] = useState(false);

  useEffect(() => {
    dispatch(setTitlebarProps({ title: 'New community' }));

    if (!existingId) return;

    client
      .query({
        query: getCommunityByIdQuery,
        variables: {
          id: existingId,
        },
      })
      .then(
        ({
          data: { community },
        }: {
          data: { community: GetCommunityType },
        }) => {
          if (!community) return;
          return setCommunity(community);
        }
      )
      .catch(err => {
        console.error('error creating community', err);
      });
  }, []);

  const stepForward = direction => {
    let newStep = direction === 'next' ? activeStep + 1 : activeStep - 1;
    history.replace(
      `/new/community?s=${newStep}${community &&
        community.id &&
        `&id=${community.id}`}`
    );
    setActiveStep(newStep);
  };

  const title = () => {
    switch (activeStep) {
      case 1: {
        return community ? 'Update your community' : 'Create a community';
      }
      case 2: {
        return `Invite people${
          community
            ? ` to the ${community.name} community`
            : ' to your community'
        }`;
      }
      case 3: {
        return 'Done!';
      }
      default: {
        return 'Create a community';
      }
    }
  };

  const description = () => {
    switch (activeStep) {
      case 1: {
        return 'Creating a community on Spectrum is free, forever. To get started, tell us more about your community below.';
      }
      case 2: {
        return `Kickstart ${
          community ? `the ${community.name} community` : 'your community'
        } by inviting an existing Slack team or by inviting a handful of folks directly by email. You'll be able to invite more people at any point in the future, too, if you're not quite ready.`;
      }
      case 3: {
        return "You're all set! Your community is live - go check it out, start posting threads, and get the conversations started!";
      }
      default: {
        return 'Create a community';
      }
    }
  };

  const communityCreated = community => {
    setCommunity({ ...community });
    history.replace(`/new/community?id=${community.id}`);
    return stepForward('next');
  };

  const hasInvitedPeopleHandler = () => {
    setHasInvitedPeople(true);
  };

  const titleText = title();
  const descriptionText = description();

  if (user && user.email) {
    return (
      <ViewGrid>
        <Head
          title={'New community'}
          description={'Create a new community'}
        />
        <SingleColumnGrid>
          <Container bg={activeStep === 3 ? 'onboarding' : null} repeat>
            <Stepper activeStep={activeStep} />
            <Title centered={activeStep === 3}>{titleText}</Title>
            <Description centered={activeStep === 3}>
              {descriptionText}
            </Description>

            {// gather community meta info
            activeStep === 1 && !community && (
              <CreateCommunityForm communityCreated={communityCreated} />
            )}

            {activeStep === 1 && community && (
              <EditCommunityForm
                communityUpdated={communityCreated}
                community={community}
              />
            )}

            {activeStep === 2 && community && community.id && (
              <ContentContainer data-cy="community-creation-invitation-step">
                <Divider />
                <SlackConnection isOnboarding={true} id={community.id} />
                <Divider />
                <CommunityInvitationForm id={community.id} />
              </ContentContainer>
            )}

            {// connect a slack team or invite via email
            activeStep === 2 && (
              <Actions>
                <TextButton onClick={() => stepForward('previous')}>
                  Back
                </TextButton>
                {hasInvitedPeople ? (
                  <Button onClick={() => stepForward('next')}>Continue</Button>
                ) : (
                  <TextButton onClick={() => stepForward('next')}>
                    Skip this step
                  </TextButton>
                )}
              </Actions>
            )}

            {// share the community
            activeStep === 3 && (
              <ContentContainer>
                <Share community={community} onboarding={true} />
              </ContentContainer>
            )}
          </Container>
        </SingleColumnGrid>
      </ViewGrid>
    );
  }

  if (user && !user.email) {
    return (
      <ViewGrid>
        <SingleColumnGrid>
          <Container bg={null}>
            <Title>
              {user.pendingEmail ? 'Confirm' : 'Add'} Your Email Address
            </Title>
            <Description>
              Before creating a community, please{' '}
              {user.pendingEmail ? 'confirm' : 'add'} your email address. This
              email address will be used in the future to send you updates
              about your community, including moderation events.
            </Description>

            <div style={{ padding: '0 24px 24px' }}>
              <UserEmailConfirmation user={user} />
            </div>
          </Container>
        </SingleColumnGrid>
      </ViewGrid>
    );
  }

  if (isLoading) return <LoadingView />;

  return (
    <Login
      dispatch={dispatch}
      redirectPath={`${window.location.href}`}
    />
  );
};

export default compose(
  withApollo,
  // $FlowIssue
  connect(),
  getCurrentUserSettings,
  viewNetworkHandler
)(NewCommunity);
