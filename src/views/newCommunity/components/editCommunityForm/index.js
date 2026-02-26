// @flow
import * as React from 'react';
import { useState } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import editCommunityMutation from 'shared/graphql/mutations/community/editCommunity';
import deleteCommunityMutation from 'shared/graphql/mutations/community/deleteCommunity';
import type { GetCommunityType } from 'shared/graphql/queries/community/getCommunity';
import { addToastWithTimeout } from 'src/actions/toasts';
import { Button } from 'src/components/button';
import { Notice } from 'src/components/listItems/style';
import {
  Input,
  UnderlineInput,
  TextArea,
  PhotoInput,
  CoverInput,
  Error,
} from 'src/components/formElements';
import { ImageInputWrapper } from 'src/components/editForm/style';
import { Actions, FormContainer, Form } from '../../style';
import type { Dispatch } from 'redux';

type Props = {
  community: GetCommunityType,
  dispatch: Dispatch<Object>,
  communityUpdated: Function,
  editCommunity: Function,
};

const CommunityWithData = (props: Props) => {
  const { community, dispatch, communityUpdated, editCommunity } = props;

  const [name, setName] = useState(community.name);
  const [slug, setSlug] = useState(community.slug);
  const [description, setDescription] = useState(community.description ? community.description : '');
  const [communityId, setCommunityId] = useState(community.id);
  const [website, setWebsite] = useState(community.website ? community.website : '');
  const [image, setImage] = useState(community.profilePhoto);
  const [coverPhoto, setCoverPhoto] = useState(community.coverPhoto);
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [communityData, setCommunityData] = useState(community);
  const [photoSizeError, setPhotoSizeError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const changeName = e => {
    const nameValue = e.target.value;

    if (nameValue.length > 20) {
      setName(nameValue);
      setNameError(true);
      return;
    }

    setName(nameValue);
    setNameError(false);
  };

  const changeDescription = e => {
    const descriptionValue = e.target.value;
    setDescription(descriptionValue);
  };

  const changeSlug = e => {
    const slugValue = e.target.value;
    setSlug(slugValue);
  };

  const changeWebsite = e => {
    const websiteValue = e.target.value;
    setWebsite(websiteValue);
  };

  const setCommunityPhoto = e => {
    let reader = new FileReader();
    let fileValue = e.target.files[0];

    if (!fileValue) return;

    setIsLoading(true);

    if (fileValue && fileValue.size > 3000000) {
      setPhotoSizeError(true);
      setIsLoading(false);
      return;
    }

    reader.onloadend = () => {
      setFile(fileValue);
      // $FlowFixMe
      setImage(reader.result);
      setPhotoSizeError(false);
      setIsLoading(false);
    };

    if (fileValue) {
      reader.readAsDataURL(fileValue);
    }
  };

  const setCommunityCover = e => {
    let reader = new FileReader();
    let fileValue = e.target.files[0];

    if (!fileValue) return;

    setIsLoading(true);

    if (fileValue && fileValue.size > 3000000) {
      setPhotoSizeError(true);
      setIsLoading(false);
      return;
    }

    reader.onloadend = () => {
      setCoverFile(fileValue);
      // $FlowFixMe
      setCoverPhoto(reader.result);
      setPhotoSizeError(false);
      setIsLoading(false);
    };

    if (fileValue) {
      reader.readAsDataURL(fileValue);
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
      communityId,
    };

    if (photoSizeError) {
      return;
    }

    setIsLoading(true);

    editCommunity(input)
      .then(({ data: { editCommunity: editedCommunity } }) => {
        const communityResult = editedCommunity;

        setIsLoading(false);

        // community was returned
        if (communityResult !== undefined) {
          dispatch(
            addToastWithTimeout('success', 'Community saved!')
          );
          communityUpdated(communityResult);
        }
        return;
      })
      .catch(err => {
        setIsLoading(false);

        dispatch(
          addToastWithTimeout(
            'error',
            `Something went wrong and we weren't able to save these changes. ${err}`
          )
        );
      });
  };

  return (
      <FormContainer>
        <Form onSubmit={save}>
          <ImageInputWrapper>
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

          <Input defaultValue={name} onChange={changeName}>
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
          >
            Description
          </TextArea>

          <Input
            defaultValue={website}
            onChange={changeWebsite}
            autoFocus={true}
          >
            Optional: Add your community’s website
          </Input>

          {photoSizeError && (
            <Notice style={{ marginTop: '16px' }}>
              Photo uploads should be less than 3mb
            </Notice>
          )}
        </Form>

        <Actions>
          <div />
          <Button
            loading={isLoading}
            onClick={save}
            disabled={photoSizeError}
          >
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </Actions>
      </FormContainer>
    );
}

const Community = compose(
  deleteCommunityMutation,
  editCommunityMutation,
  withRouter,
  connect()
)(CommunityWithData);
export default Community;
