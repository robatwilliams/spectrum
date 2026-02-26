// @flow
import React, { useState } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import editCommunityMutation from 'shared/graphql/mutations/community/editCommunity';
import type { EditCommunityType } from 'shared/graphql/mutations/community/editCommunity';
import type { GetCommunityType } from 'shared/graphql/queries/community/getCommunity';
import { openModal } from 'src/actions/modals';
import Tooltip from 'src/components/tooltip';
import { addToastWithTimeout } from 'src/actions/toasts';
import { PrimaryOutlineButton } from 'src/components/button';
import { Notice } from 'src/components/listItems/style';
import Icon from 'src/components/icon';
import {
  Input,
  UnderlineInput,
  TextArea,
  PhotoInput,
  Error,
  CoverInput,
} from 'src/components/formElements';
import {
  Form,
  FormTitle,
  Description,
  Actions,
  TertiaryActionContainer,
  ImageInputWrapper,
  DeleteCoverWrapper,
  DeleteCoverButton,
} from 'src/components/editForm/style';
import { SectionCard, SectionTitle } from 'src/components/settingsViews/style';
import type { Dispatch } from 'redux';

type Props = {
  community: GetCommunityType,
  dispatch: Dispatch<Object>,
  editCommunity: Function,
};

const EditForm = (props: Props) => {
  const { community, editCommunity, dispatch } = props;

  const [name, setName] = useState(community.name);
  const [slug, setSlug] = useState(community.slug);
  const [description, setDescription] = useState(community.description ? community.description : '');
  const [communityId, setCommunityId] = useState(community.id);
  const [website, setWebsite] = useState(community.website ? community.website : '');
  const [image, setImage] = useState(community.profilePhoto);
  const [coverPhoto, setCoverPhoto] = useState(community.coverPhoto);
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [nameError, setNameError] = useState(false);
  const [communityData, setCommunityData] = useState(community);
  const [photoSizeError, setPhotoSizeError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const changeName = e => {
    const name = e.target.value;

    if (name.length > 20) {
      setName(name);
      setNameError(true);

      return;
    }

    setName(name);
    setNameError(false);
  };

  const changeDescription = e => {
    const description = e.target.value;
    setDescription(description);
  };

  const changeSlug = e => {
    const slug = e.target.value;
    setSlug(slug);
  };

  const changeWebsite = e => {
    const website = e.target.value;
    setWebsite(website);
  };

  const setCommunityPhoto = e => {
    let reader = new FileReader();
    let file = e.target.files[0];

    if (!file) return;

    setIsLoading(true);

    if (file && file.size > 3000000) {
      setPhotoSizeError(true);
      setIsLoading(false);
      return;
    }

    reader.onloadend = () => {
      setFile(file);
      // $FlowFixMe
      setImage(reader.result);
      setPhotoSizeError(false);
      setIsLoading(false);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const setCommunityCover = e => {
    let reader = new FileReader();
    let file = e.target.files[0];

    if (!file) return;

    setIsLoading(true);

    if (file && file.size > 3000000) {
      setPhotoSizeError(true);
      setIsLoading(false);
      return;
    }

    reader.onloadend = () => {
      setCoverFile(file);
      // $FlowFixMe
      setCoverPhoto(reader.result);
      setPhotoSizeError(false);
      setIsLoading(false);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const save = e => {
    e.preventDefault();
    const input = {
      name,
      description,
      website,
      file,
      coverFile,
      coverPhoto,
      communityId,
    };

    if (photoSizeError) {
      return;
    }

    setIsLoading(true);

    editCommunity(input)
      .then(({ data }: EditCommunityType) => {
        const { editCommunity: community } = data;

        setIsLoading(false);

        // community was returned
        if (community !== undefined) {
          dispatch(
            addToastWithTimeout('success', 'Community saved!')
          );
        }
        return;
      })
      .catch(err => {
        setIsLoading(false);

        dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const triggerDeleteCommunity = (e, communityId) => {
    e.preventDefault();
    const message = (
      <div>
        <p>
          Are you sure you want to delete your community, <b>{name}</b>?
        </p>{' '}
        <p>
          <b>{communityData.metaData.members} members</b> will be removed from
          the community and the channels you’ve created will be deleted.
        </p>
        <p>
          All threads, messages, reactions, and media shared in your community
          will be deleted.
        </p>
        <p>This cannot be undone.</p>
      </div>
    );

    return dispatch(
      openModal('DELETE_DOUBLE_CHECK_MODAL', {
        id: communityId,
        entity: 'community',
        message,
      })
    );
  };

  const deleteCoverPhoto = e => {
    e.preventDefault();
    setCoverPhoto('');
    setCoverFile(null);
  };

  if (!community) {
      return (
        <SectionCard>
          <FormTitle>This community doesn’t exist yet.</FormTitle>
          <Description>Want to make it?</Description>
          <Actions>
            <PrimaryOutlineButton>Create</PrimaryOutlineButton>
          </Actions>
        </SectionCard>
      );
    }

    return (
      <SectionCard>
        <SectionTitle>Community Settings</SectionTitle>
        <Form onSubmit={save}>
          <ImageInputWrapper>
            {coverPhoto && !/default_images/.test(coverPhoto) && (
              <DeleteCoverWrapper>
                <DeleteCoverButton onClick={e => deleteCoverPhoto(e)}>
                  <Icon glyph="view-close-small" size={'16'} />
                </DeleteCoverButton>
              </DeleteCoverWrapper>
            )}
            <CoverInput
              onChange={setCommunityCover}
              defaultValue={coverPhoto}
              preview={true}
              allowGif
            />

            <PhotoInput
              type={'community'}
              onChange={setCommunityPhoto}
              defaultValue={image}
            />
          </ImageInputWrapper>

          <Input
            dataCy="community-settings-name-input"
            defaultValue={name}
            onChange={changeName}
          >
            Name
          </Input>
          <UnderlineInput defaultValue={slug} disabled>
            spectrum.chat/
          </UnderlineInput>

          {nameError && (
            <Error>Community names can be up to 20 characters long.</Error>
          )}

          <TextArea
            defaultValue={description}
            onChange={changeDescription}
            dataCy="community-settings-description-input"
          >
            Description
          </TextArea>

          <Input
            defaultValue={website}
            onChange={changeWebsite}
            dataCy="community-settings-website-input"
          >
            Optional: Add your community’s website
          </Input>

          <Actions>
            <PrimaryOutlineButton
              loading={isLoading}
              onClick={save}
              disabled={photoSizeError}
              type="submit"
              data-cy="community-settings-edit-save-button"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </PrimaryOutlineButton>
            <TertiaryActionContainer>
              {community.communityPermissions.isOwner && (
                <Tooltip content={`Delete ${name}`}>
                  <span>
                    <Icon
                      glyph="delete"
                      color="text.placeholder"
                      hoverColor={'warn.alt'}
                      onClick={e =>
                        triggerDeleteCommunity(e, community.id)
                      }
                    />
                  </span>
                </Tooltip>
              )}
            </TertiaryActionContainer>
          </Actions>

          {photoSizeError && (
            <Notice style={{ marginTop: '16px' }}>
              Photo uploads should be less than 3mb
            </Notice>
          )}
        </Form>
      </SectionCard>
    );
};

export default compose(
  connect(),
  editCommunityMutation,
  withRouter
)(EditForm);
