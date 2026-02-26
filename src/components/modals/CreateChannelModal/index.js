// @flow
import * as React from 'react';
import { useState, useRef } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import compose from 'recompose/compose';
import { withRouter } from 'react-router';
import slugg from 'slugg';
import { CHANNEL_SLUG_DENY_LIST } from 'shared/slug-deny-lists';
import { withApollo } from 'react-apollo';
import { closeModal } from 'src/actions/modals';
import { addToastWithTimeout } from 'src/actions/toasts';
import { throttle } from 'src/helpers/utils';
import { getChannelBySlugAndCommunitySlugQuery } from 'shared/graphql/queries/channel/getChannel';
import type { GetChannelType } from 'shared/graphql/queries/channel/getChannel';
import type { GetCommunityType } from 'shared/graphql/queries/community/getCommunity';
import createChannelMutation from 'shared/graphql/mutations/channel/createChannel';
import type { Dispatch } from 'redux';
import { withCurrentUser } from 'src/components/withCurrentUser';

import ModalContainer from '../modalContainer';
import { TextButton, PrimaryOutlineButton } from 'src/components/button';
import { modalStyles, UpsellDescription } from '../styles';
import {
  whiteSpaceRegex,
  oddHyphenRegex,
} from 'src/views/viewHelpers/textValidationHelper';
import {
  Input,
  UnderlineInput,
  TextArea,
  Error,
  Checkbox,
} from '../../formElements';
import { Form, Actions } from './style';

type State = {
  name: string,
  slug: string,
  description: string,
  isPrivate: boolean,
  slugTaken: boolean,
  slugError: boolean,
  descriptionError: boolean,
  nameError: boolean,
  createError: boolean,
  loading: boolean,
};

type Props = {
  client: Object,
  dispatch: Dispatch<Object>,
  isOpen: boolean,
  community: GetCommunityType,
  createChannel: Function,
};

const CreateChannelModal = (props: Props) => {
  const { client, dispatch, isOpen, community, createChannel } = props;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [slugTaken, setSlugTaken] = useState(false);
  const [slugError, setSlugError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [createError, setCreateError] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkSlugRef = useRef(null);

  if (!checkSlugRef.current) {
    checkSlugRef.current = throttle((slug: string) => {
      const communitySlug = community.slug;

      if (CHANNEL_SLUG_DENY_LIST.indexOf(slug) > -1) {
        setSlug(slug);
        setSlugTaken(true);
      } else {
        // check the db to see if this channel slug exists
        client
          .query({
            query: getChannelBySlugAndCommunitySlugQuery,
            variables: {
              channelSlug: slug,
              communitySlug,
            },
          })
          .then(({ data }: { data: { channel: GetChannelType } }) => {
            if (CHANNEL_SLUG_DENY_LIST.indexOf(slug) > -1) {
              setSlugTaken(true);
            } else if (!data.loading && data && data.channel && data.channel.id) {
              setSlugTaken(true);
            } else {
              setSlugTaken(false);
            }
          })
          .catch(() => {
            // do nothing
          });
      }
    }, 500);
  }

  const close = () => {
    dispatch(closeModal());
  };

  const changeName = e => {
    const nameValue = e.target.value;
    let lowercaseName = nameValue.toLowerCase().trim();
    let slugValue = slugg(lowercaseName);

    let hasInvalidChars = nameValue.search(whiteSpaceRegex) >= 0;
    let hasOddHyphens = nameValue.search(oddHyphenRegex) >= 0;
    if (hasInvalidChars || hasOddHyphens || nameValue.length > 20) {
      setNameError(true);

      return;
    }

    setName(nameValue);
    setSlug(slugValue);
    setNameError(false);

    // $FlowIssue
    checkSlugRef.current(slugValue);
  };

  const changeSlug = e => {
    let slugValue = e.target.value;
    let lowercaseSlug = slugValue.toLowerCase().trim();
    slugValue = slugg(lowercaseSlug);

    if (slugValue.length >= 24) {
      setSlugError(true);
      return;
    }

    if (CHANNEL_SLUG_DENY_LIST.indexOf(slugValue) > -1) {
      setSlug(slugValue);
      setSlugTaken(true);
      return;
    }

    setSlug(slugValue);
    setSlugError(false);

    // $FlowIssue
    checkSlugRef.current(slugValue);
  };

  const changeDescription = e => {
    const descriptionValue = e.target.value;

    let hasInvalidChars = descriptionValue.search(whiteSpaceRegex) >= 0;
    let hasOddHyphens = descriptionValue.search(oddHyphenRegex) >= 0;
    if (hasInvalidChars || hasOddHyphens || descriptionValue.length >= 140) {
      setDescriptionError(true);
      return;
    }

    setDescription(descriptionValue);
    setDescriptionError(false);
  };

  const changePrivate = e => {
    const value = e.target.checked;

    setIsPrivate(value);
  };

  const create = e => {
    e.preventDefault();

    // if an error is present, ensure the client cant submit the form
    if (slugTaken || nameError || descriptionError || slugError) {
      setCreateError(true);

      return;
    }

    // clientside checks have passed
    setCreateError(false);
    setLoading(true);

    // all non-private channels should be set to default for now
    const isDefault = !isPrivate;

    // create the mutation input
    const input = {
      communityId: community.id,
      name,
      slug,
      description,
      isPrivate,
      isDefault,
    };

    createChannel(input)
      .then(() => {
        close();
        dispatch(
          addToastWithTimeout('success', 'Channel successfully created!')
        );
        return;
      })
      .catch(err => {
        setLoading(false);

        dispatch(addToastWithTimeout('error', err.toString()));
      });
  };

  const styles = modalStyles(420);

  return (
    <Modal
      /* TODO(@mxstbr): Fix this */
      ariaHideApp={false}
      isOpen={isOpen}
      contentLabel={'Create a Channel'}
      onRequestClose={close}
      shouldCloseOnOverlayClick={true}
      style={styles}
      closeTimeoutMS={330}
    >
      {/*
        We pass the closeModal dispatch into the container to attach
        the action to the 'close' icon in the top right corner of all modals
      */}
      <ModalContainer title={'Create a Channel'} closeModal={close}>
        <Form>
          <Input
            id="name"
            defaultValue={name}
            onChange={changeName}
            autoFocus={true}
          >
              Channel Name
            </Input>

            {nameError && (
              <Error>
                Channel name has to be between 1 and 20 characters long and
                can`t have invalid characters.
              </Error>
            )}

            <UnderlineInput defaultValue={slug} onChange={changeSlug}>
              {`/${community.slug}/`}
            </UnderlineInput>

            {slugTaken && (
              <Error>
                This url is already taken - feel free to change it if you’re set
                on the name {name}!
              </Error>
            )}

            {slugError && <Error>Slugs can be up to 24 characters long.</Error>}

            <TextArea
              id="slug"
              defaultValue={description}
              onChange={changeDescription}
            >
              Describe it in 140 characters or less
            </TextArea>

            {descriptionError && (
              <Error>
                Oops, there may be some invalid characters or the text is too
                big (max: 140 characters) - try trimming that up.
              </Error>
            )}

            <Checkbox
              id="isPrivate"
              checked={isPrivate}
              onChange={changePrivate}
              dataCy="create-channel-modal-toggle-private-checkbox"
            >
              Private channel
            </Checkbox>

            <UpsellDescription>
              Private channels protect all conversations and messages, and all
              new members must be manually approved.
            </UpsellDescription>

            <Actions>
              <TextButton onClick={close}>Cancel</TextButton>
              <PrimaryOutlineButton
                disabled={!name || !slug || slugTaken}
                loading={loading}
                onClick={create}
              >
                {loading ? 'Creating...' : 'Create Channel'}
              </PrimaryOutlineButton>
            </Actions>

            {createError && (
              <Error>
                Please fix any errors above before creating this community.
              </Error>
            )}
          </Form>
        </ModalContainer>
      </Modal>
    );
};

const map = state => ({
  isOpen: state.modals.isOpen,
});
export default compose(
  // $FlowIssue
  connect(map),
  withApollo,
  withCurrentUser,
  createChannelMutation,
  withRouter
)(CreateChannelModal);
