// @flow
import React, { useState } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import editChannelMutation from 'shared/graphql/mutations/channel/editChannel';
import type { EditChannelType } from 'shared/graphql/mutations/channel/editChannel';
import type { GetChannelType } from 'shared/graphql/queries/channel/getChannel';
import deleteChannelMutation from 'shared/graphql/mutations/channel/deleteChannel';
import { openModal } from 'src/actions/modals';
import Tooltip from 'src/components/tooltip';
import { addToastWithTimeout } from 'src/actions/toasts';
import { Notice } from 'src/components/listItems/style';
import { PrimaryOutlineButton } from 'src/components/button';
import Icon from 'src/components/icon';
import { NullCard } from 'src/components/upsell';
import {
  Input,
  UnderlineInput,
  TextArea,
  Error,
} from 'src/components/formElements';
import { SectionCard, SectionTitle } from 'src/components/settingsViews/style';
import {
  whiteSpaceRegex,
  oddHyphenRegex,
} from 'src/views/viewHelpers/textValidationHelper';
import {
  Form,
  TertiaryActionContainer,
  Description,
  Actions,
  GeneralNotice,
  Location,
} from 'src/components/editForm/style';
import type { Dispatch } from 'redux';

type Props = {
  editChannel: Function,
  dispatch: Dispatch<Object>,
  channel: GetChannelType,
};

const ChannelWithData = (props: Props) => {
  const { channel, editChannel, dispatch } = props;

  const [name, setName] = useState(channel.name);
  const [nameError, setNameError] = useState(false);
  const [slug, setSlug] = useState(channel.slug);
  const [description, setDescription] = useState(channel.description);
  const [descriptionError, setDescriptionError] = useState(false);
  const [isPrivate, setIsPrivate] = useState(channel.isPrivate || false);
  const [channelId, setChannelId] = useState(channel.id);
  const [channelData, setChannelData] = useState(channel);
  const [isLoading, setIsLoading] = useState(false);

  const updateStateOnError = (state, key, setError) => {
    if (key === 'name') {
      state['nameError'] = setError;
    } else {
      state['descriptionError'] = setError;
    }
  };

  const handleChange = e => {
    const key = e.target.id;
    const value = e.target.value;

    const newState = {};
    // checkboxes should reverse the value
    if (key === 'isPrivate') {
      newState[key] = !isPrivate;
      setIsPrivate(!isPrivate);
    } else {
      newState[key] = value;

      let hasInvalidChars = value.search(whiteSpaceRegex) >= 0;
      let hasOddHyphens = value.search(oddHyphenRegex) >= 0;
      updateStateOnError(newState, key, hasInvalidChars || hasOddHyphens);

      if (key === 'name') {
        setName(value);
        setNameError(hasInvalidChars || hasOddHyphens);
      } else if (key === 'description') {
        setDescription(value);
        setDescriptionError(hasInvalidChars || hasOddHyphens);
      }
    }
  };

  const save = e => {
    e.preventDefault();
    const input = {
      name,
      slug,
      description,
      isPrivate,
      channelId,
    };

    setIsLoading(true);

    // if privacy changed in this edit
    if (channel.isPrivate !== isPrivate) {
    }

    editChannel(input)
      .then(({ data }: EditChannelType) => {
        const { editChannel: channel } = data;

        setIsLoading(false);

        // the mutation returns a channel object. if it exists,
        if (channel !== undefined) {
          dispatch(addToastWithTimeout('success', 'Channel saved!'));
        }
        return;
      })
      .catch(err => {
        setIsLoading(false);

        dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const triggerDeleteChannel = (e, channelId) => {
    e.preventDefault();
    const message = (
      <div>
        <p>
          Are you sure you want to delete{' '}
          <b>
            {channelData.community.name}/{name}
          </b>
          ?
        </p>
        <p>All conversations posted in this channel will be deleted.</p>
        <p>
          All messages, reactions, and media shared in this channel will be
          deleted.
        </p>
        <p>
          <b>This cannot be undone.</b>
        </p>
      </div>
    );

    return dispatch(
      openModal('DELETE_DOUBLE_CHECK_MODAL', {
        id: channelId,
        entity: 'channel',
        message,
        redirect: `/${channelData.community.slug}`,
      })
    );
  };

  if (!channel) {
    return (
      <NullCard
        bg="channel"
        heading={"This channel doesn't exist yet."}
        copy={'Want to make it?'}
      >
        {/* TODO: wire up button */}
        <PrimaryOutlineButton>Create</PrimaryOutlineButton>
      </NullCard>
    );
  } else {
    return (
      <SectionCard>
        <Location>
          <Link to={`/${channel.community.slug}/${channel.slug}`}>
            View Channel
          </Link>
        </Location>
        <SectionTitle>Channel Settings</SectionTitle>
        <Form onSubmit={save}>
          <Input
            defaultValue={name}
            id="name"
            onChange={handleChange}
            dataCy="channel-name-input"
          >
            Name
          </Input>
          {nameError && (
            <Error>Channel name can`t have invalid characters.</Error>
          )}
          <UnderlineInput defaultValue={slug} disabled>
            {`URL: /${channel.community.slug}/`}
          </UnderlineInput>
          <TextArea
            id="description"
            defaultValue={description}
            onChange={handleChange}
            dataCy="channel-description-input"
          >
            Description
          </TextArea>
          {descriptionError && (
            <Error>
              Oops, there may be some invalid characters - try fixing that up.
            </Error>
          )}
          {/* {slug !== 'general' &&
            <Checkbox
              id="isPrivate"
              checked={isPrivate}
              onChange={handleChange}
            >
              Private channel
            </Checkbox>} */}
          {isPrivate ? (
            <Description>
              Only channel members can see the threads, messages, and members
              in this channel. You can manually approve users who request to
              join this channel.
            </Description>
          ) : channel.community.isPrivate ? (
            <Description>
              Members in your private community will be able to join this
              channel, post threads and messages, and will be able to see
              other members.
            </Description>
          ) : (
            <Description>
              Anyone on Spectrum can join this channel, post threads and
              messages, and will be able to see other members.
            </Description>
          )}

          {// if the user is moving from private to public
          channel.isPrivate && !isPrivate && (
            <Notice>
              When a private channel is made public all pending users will be
              added as members of the channel. Blocked users will remain
              blocked from viewing all content in this channel but in the
              future any new person will be able to join.
            </Notice>
          )}

          <Actions>
            <PrimaryOutlineButton
              onClick={save}
              disabled={nameError || descriptionError}
              loading={isLoading}
              data-cy="save-button"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </PrimaryOutlineButton>
            {slug !== 'general' && (
              <TertiaryActionContainer>
                <Tooltip content={`Delete ${name}`}>
                  <span>
                    <Icon
                      glyph="delete"
                      color="text.placeholder"
                      hoverColor="warn.alt"
                      onClick={e => triggerDeleteChannel(e, channel.id)}
                      data-cy="delete-channel-button"
                    />
                    </span>
                  </Tooltip>
                </TertiaryActionContainer>
              )}
            </Actions>

          {slug === 'general' && (
            <GeneralNotice>
              The General channel is the default channel for your community.
              It can't be deleted or private, but you can still change the
              name and description.
            </GeneralNotice>
          )}
        </Form>
      </SectionCard>
    );
  }
};

const Channel = compose(
  deleteChannelMutation,
  editChannelMutation,
  withRouter
)(ChannelWithData);
export default connect()(Channel);
