// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import type { GetSlackSettingsType } from 'shared/graphql/queries/community/getCommunitySlackSettings';
import {
  SectionCard,
  SectionTitleWithIcon,
  SectionSubtitle,
  SectionCardFooter,
} from 'src/components/settingsViews/style';
import { Button } from 'src/components/button';
import { TextArea, Error } from 'src/components/formElements';
import sendSlackInvitesMutation from 'shared/graphql/mutations/community/sendSlackInvites';
import { addToastWithTimeout } from 'src/actions/toasts';
import { timeDifference } from 'shared/time-difference';
import Icon from 'src/components/icon';
import type { Dispatch } from 'redux';

type Props = {
  community: GetSlackSettingsType,
  sendSlackInvites: Function,
  dispatch: Dispatch<Object>,
};

const SendSlackInvitations = (props: Props) => {
  const { community, sendSlackInvites, dispatch } = props;
  const [customMessage, setCustomMessage] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const updateCustomMessage = React.useCallback((evt: SyntheticInputEvent<>) => {
    setCustomMessage(evt.target.value);
  }, []);

  const sendInvitations = React.useCallback(() => {
    setIsLoading(true);

    return sendSlackInvites({
      id: community.id,
      customMessage,
    })
      .then(() => {
        setIsLoading(false);
        dispatch(
          addToastWithTimeout('success', 'Your invitations are being sent!')
        );
        return;
      })
      .catch(err => {
        setIsLoading(false);
        dispatch(addToastWithTimeout('error', err.message));
      });
  }, [sendSlackInvites, community.id, customMessage, dispatch]);

  const customMessageError = customMessage && customMessage.length > 500;

  if (community.slackSettings.hasSentInvites) {
    const { memberCount, teamName, invitesSentAt } = community.slackSettings;
    const now = new Date().getTime();
    const then = new Date(invitesSentAt).getTime();
    return (
      <SectionCard>
        <SectionTitleWithIcon>
          <Icon glyph={'slack-colored'} size={32} />
          Invitations sent
        </SectionTitleWithIcon>
        <SectionSubtitle>
          You sent {memberCount} invitations to the {teamName} Slack team{' '}
          {timeDifference(now, then).toLowerCase()}. Teams can only be invited
          once.
        </SectionSubtitle>

        <SectionCardFooter>
          <Button disabled>Invites sent!</Button>
        </SectionCardFooter>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <SectionTitleWithIcon>
        <Icon glyph={'slack-colored'} size={32} />
        Invite your Slack community
      </SectionTitleWithIcon>
      <SectionSubtitle>
        Send your Slack team an invitation to join the {community.name}{' '}
        community. Add an optional message to customize the invitation. Slack
        teams can only be invited once.
      </SectionSubtitle>

      <TextArea
        defaultValue={customMessage}
        onChange={updateCustomMessage}
        placeholder={'Add an optional custom message to your invitations'}
      >
        Add an optional custom message
      </TextArea>

      {customMessageError && (
        <Error>
          Your custom invitation message can be up to 500 characters.
        </Error>
      )}

      <SectionCardFooter>
        <Button
          onClick={sendInvitations}
          loading={isLoading}
          disabled={!!customMessageError}
        >
          {isLoading ? 'Sending...' : 'Send invitations'}
        </Button>
      </SectionCardFooter>
    </SectionCard>
  );
};

export default compose(
  connect(),
  sendSlackInvitesMutation
)(SendSlackInvitations);
