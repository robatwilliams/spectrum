// @flow
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { withRouter } from 'react-router';
import slugg from 'slugg';
import { withApollo } from 'react-apollo';
import { Notice } from 'src/components/listItems/style';
import { CommunityAvatar } from 'src/components/avatar';
import { throttle } from 'src/helpers/utils';
import { addToastWithTimeout } from 'src/actions/toasts';
import { COMMUNITY_SLUG_DENY_LIST } from 'shared/slug-deny-lists';
import createCommunityMutation from 'shared/graphql/mutations/community/createCommunity';
import type { CreateCommunityType } from 'shared/graphql/mutations/community/createCommunity';
import { getCommunityBySlugQuery } from 'shared/graphql/queries/community/getCommunity';
import { searchCommunitiesQuery } from 'shared/graphql/queries/search/searchCommunities';
import { PrimaryOutlineButton } from 'src/components/button';
import {
  whiteSpaceRegex,
  oddHyphenRegex,
} from 'src/views/viewHelpers/textValidationHelper';
import Icon from 'src/components/icon';
 
import {
  Input,
  UnderlineInput,
  TextArea,
  PhotoInput,
  CoverInput,
  Error,
  Checkbox,
} from 'src/components/formElements';
import {
  ImageInputWrapper,
  Spacer,
  CommunitySuggestionsWrapper,
  CommunitySuggestion,
  CommunitySuggestionsText,
  PrivacySelector,
  PrivacyOption,
  PrivacyOptionLabel,
  PrivacyOptionText,
  DeleteCoverWrapper,
  DeleteCoverButton,
} from './style';
import { FormContainer, Form, Actions } from '../../style';
import type { Dispatch } from 'redux';

type Props = {
  client: Object,
  createCommunity: Function,
  communityCreated: Function,
  dispatch: Dispatch<Object>,
  name: string,
};

const CreateCommunityForm = (props: Props) => {
  const { name: propName, createCommunity, communityCreated, dispatch, client } = props;

  const [name, setName] = useState(propName || '');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [image, setImage] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [slugTaken, setSlugTaken] = useState(false);
  const [slugError, setSlugError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [createError, setCreateError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeCoC, setAgreeCoC] = useState(false);
  const [photoSizeError, setPhotoSizeError] = useState(false);
  const [communitySuggestions, setCommunitySuggestions] = useState(null);
  const [isPrivate, setIsPrivateState] = useState(false);

  const checkSlug = useCallback(slug => {
    // check the db to see if this channel slug exists
    client
      .query({
        query: getCommunityBySlugQuery,
        variables: {
          slug,
        },
      })
      .then(({ data }) => {
        if (COMMUNITY_SLUG_DENY_LIST.indexOf(slug) > -1) {
          setSlugTaken(true);
          return;
        }
        // if the community exists
        if (!data.loading && data && data.community && data.community.id) {
          setSlugTaken(true);
        } else {
          setSlugTaken(false);
        }
      })
      .catch(err => {
        dispatch(addToastWithTimeout('success', err.message));
      });
  }, [client, dispatch]);

  const changeName = e => {
    if (communitySuggestions) {
      setCommunitySuggestions(null);
    }

    const nameValue = e.target.value;
    // replace any non alpha-num characters to prevent bad community slugs
    // (/[\W_]/g, "-") => replace non-alphanum with hyphens
    // (/-{2,}/g, '-') => replace multiple hyphens in a row with one hyphen
    let lowercaseName = nameValue
      .toLowerCase()
      .trim()
      .replace(/[\W_]/g, '-')
      .replace(/-{2,}/g, '-');
    let slugValue = slugg(lowercaseName);

    let hasInvalidChars = nameValue.search(whiteSpaceRegex) >= 0;
    let hasOddHyphens = nameValue.search(oddHyphenRegex) >= 0;
    if (hasInvalidChars || hasOddHyphens || nameValue.length > 20) {
      setNameError(true);
      return;
    }

    if (COMMUNITY_SLUG_DENY_LIST.indexOf(slugValue) > -1) {
      setName(nameValue);
      setSlug(slugValue);
      setSlugTaken(true);
    } else {
      setName(nameValue);
      setSlug(slugValue);
      setNameError(false);
      setSlugTaken(false);

      // $FlowIssue
      checkSlug(slugValue);
    }
  };

  const changeSlug = e => {
    let slugValue = e.target.value;
    // replace any non alpha-num characters to prevent bad community slugs
    // (/[\W_]/g, "-") => replace non-alphanum with hyphens
    // (/-{2,}/g, '-') => replace multiple hyphens in a row with one hyphen
    let lowercaseSlug = slugValue
      .toLowerCase()
      .trim()
      .replace(/[\W_]/g, '-')
      .replace(/-{2,}/g, '-');
    slugValue = slugg(lowercaseSlug);

    if (slugValue.length >= 24) {
      setSlug(slugValue);
      setSlugError(true);
      return;
    }

    if (COMMUNITY_SLUG_DENY_LIST.indexOf(slugValue) > -1) {
      setSlug(slugValue);
      setSlugTaken(true);
    } else {
      setSlug(slugValue);
      setSlugError(false);
      setSlugTaken(false);

      // $FlowIssue
      checkSlug(slugValue);
    }
  };

  const checkSuggestedCommunities = () => {
    if (name && name.length > 1 && slug && slug.length > 1 && !slugError) {
      // if the user has found a valid url, do a community search to see if they might be creating a duplicate community
      client
        .query({
          // TODO: @BRIAN SWITCH THIS AFTER SEARCH IS MERGED IN
          query: searchCommunitiesQuery,
          variables: {
            queryString: slug,
            type: 'COMMUNITIES',
          },
        })
        .then(({ data: { search } }) => {
          if (
            !search ||
            !search.searchResultsConnection ||
            search.searchResultsConnection.edges.length === 0
          ) {
            setCommunitySuggestions(null);
            return;
          }

          const suggestions = search.searchResultsConnection.edges.map(
            c => c.node
          );

          const filtered =
            suggestions &&
            suggestions
              .slice()
              .sort((a, b) => b.metaData.members - a.metaData.members)
              .slice(0, 5);

          if (filtered && filtered.length > 0) {
            setCommunitySuggestions(filtered);
          } else {
            setCommunitySuggestions(null);
          }
        })
        .catch(err => {
          dispatch(addToastWithTimeout('success', err.message));
        });
    }
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

  const changeWebsite = e => {
    const websiteValue = e.target.value;
    setWebsite(websiteValue);
  };

  const changeCoC = () => {
    setAgreeCoC(!agreeCoC);
  };

  const setCommunityPhoto = e => {
    let reader = new FileReader();
    let fileValue = e.target.files[0];

    if (!fileValue) return;

    if (fileValue.size > 3000000) {
      setPhotoSizeError(true);
      return;
    }

    reader.onloadend = () => {
      setFile(fileValue);
      // $FlowFixMe
      setImage(reader.result);
      setPhotoSizeError(false);
    };

    if (fileValue) {
      reader.readAsDataURL(fileValue);
    }
  };

  const setCommunityCover = e => {
    let reader = new FileReader();
    let fileValue = e.target.files[0];

    if (!fileValue) return;

    if (fileValue.size > 3000000) {
      setPhotoSizeError(true);
      return;
    }

    reader.onloadend = () => {
      setCoverFile(fileValue);
      // $FlowFixMe
      setCoverPhoto(reader.result);
      setPhotoSizeError(false);
    };

    if (fileValue) {
      reader.readAsDataURL(fileValue);
    }
  };

  const deleteCoverPhoto = e => {
    e.preventDefault();
    setCoverPhoto('');
    setCoverFile(null);
  };

  const create = e => {
    e.preventDefault();

    // if an error is present, ensure the client cant submit the form
    if (
      slugTaken ||
      nameError ||
      descriptionError ||
      slugError ||
      photoSizeError ||
      !name ||
      !slug ||
      !agreeCoC
    ) {
      setCreateError(true);
      return;
    }

    // clientside checks have passed
    setCreateError(false);
    setIsLoading(true);

    // create the mutation input
    const input = {
      name,
      slug,
      description,
      website,
      file,
      coverFile,
      isPrivate,
    };

    // create the community
    createCommunity(input)
      .then(({ data }: CreateCommunityType) => {
        const { createCommunity: createdCommunity } = data;
        communityCreated(createdCommunity);
        dispatch(
          addToastWithTimeout('success', 'Community created!')
        );
        return;
      })
      .catch(err => {
        setIsLoading(false);
        dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const setPrivate = () => {
    setIsPrivateState(true);
  };

  const setPublic = () => {
    setIsPrivateState(false);
  };

  const suggestionString = slugTaken
    ? communitySuggestions && communitySuggestions.length > 0
      ? 'Were you looking for one of these communities?'
      : null
    : "This community name and url are available! We also found communities that might be similar to what you're trying to create, just in case you would rather join an existing community instead!";

  return (
      <FormContainer data-cy="create-community-form">
        <Form>
          <ImageInputWrapper>
            {coverPhoto && !/default_images/.test(coverPhoto) && (
              <DeleteCoverWrapper>
                <DeleteCoverButton onClick={deleteCoverPhoto}>
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

          {photoSizeError && (
            <Notice style={{ marginTop: '32px' }}>
              Photo uploads should be less than 3mb
            </Notice>
          )}

          <Spacer height={8} />

          <Input
            defaultValue={name}
            onChange={changeName}
            autoFocus={!(window.innerWidth < 768)}
            onBlur={checkSuggestedCommunities}
            dataCy="community-name-input"
          >
            What is your community called?
          </Input>

          {nameError && (
            <Error>
              Community name has to be between 1 and 20 characters long and
              can`t have invalid characters.
            </Error>
          )}

          <UnderlineInput
            defaultValue={slug}
            onChange={changeSlug}
            onBlur={checkSuggestedCommunities}
            dataCy="community-slug-input"
          >
            spectrum.chat/
          </UnderlineInput>

          {slugTaken && (
            <Error>
              This url is already taken - feel free to change it if you’re set
              on the name {name}!
            </Error>
          )}

          {slugError && <Error>Slugs can be up to 24 characters long.</Error>}

          {suggestionString &&
            !nameError &&
            !slugError &&
            communitySuggestions &&
            communitySuggestions.length > 0 && (
              <CommunitySuggestionsText>
                {suggestionString}
              </CommunitySuggestionsText>
            )}

          <CommunitySuggestionsWrapper>
            {!nameError &&
              !slugError &&
              communitySuggestions &&
              communitySuggestions.length > 0 &&
              communitySuggestions.map(suggestion => {
                return (
                  <Link to={`/${suggestion.slug}`} key={suggestion.id}>
                    <CommunitySuggestion>
                      <CommunityAvatar
                        size={20}
                        community={suggestion}
                        isClickable={false}
                        showHoverProfile={false}
                      />
                      <strong>{suggestion.name}</strong>{' '}
                      {suggestion.metaData.members.toLocaleString()} members
                    </CommunitySuggestion>
                  </Link>
                );
              })}
          </CommunitySuggestionsWrapper>

          <TextArea
            defaultValue={description}
            onChange={this.changeDescription}
            dataCy="community-description-input"
          >
            Describe it in 140 characters or less
          </TextArea>

          {descriptionError && (
            <Error>
              Oops, there may be some invalid characters or the text is too big
              (max: 140 characters) - try trimming that up.
            </Error>
          )}

          <Input
            defaultValue={website}
            onChange={this.changeWebsite}
            dataCy="community-website-input"
          >
            Optional: Add your community’s website
          </Input>

          <PrivacySelector>
            <PrivacyOption selected={!isPrivate} onClick={setPublic}>
              <PrivacyOptionLabel>
                <input
                  type="radio"
                  value="public"
                  checked={!isPrivate}
                  onChange={setPublic}
                  data-cy="community-public-selector-input"
                />
                Public
              </PrivacyOptionLabel>
              <PrivacyOptionText>
                Anyone can join and view conversations. Public communities will
                appear in search results, and can appear as suggested
                communities to non-members. Conversations will be search
                indexed.
              </PrivacyOptionText>
            </PrivacyOption>

            <PrivacyOption selected={isPrivate} onClick={setPrivate}>
              <PrivacyOptionLabel>
                <input
                  type="radio"
                  checked={isPrivate}
                  value="private"
                  onChange={setPrivate}
                  data-cy="community-private-selector-input"
                />
                Private
              </PrivacyOptionLabel>
              <PrivacyOptionText>
                All members must be approved before they can view or join
                conversations. Private communities will not appear in search
                results or suggested communities. Conversations will not be
                search indexed.
              </PrivacyOptionText>
            </PrivacyOption>
          </PrivacySelector>

          <Checkbox
            id="isPrivate"
            checked={agreeCoC}
            onChange={changeCoC}
            dataCy="community-coc-input"
          >
            <span>
              I have read the{' '}
              <a
                href="https://github.com/withspectrum/code-of-conduct"
                target="_blank"
                rel="noopener noreferrer"
              >
                Spectrum Code of Conduct
              </a>{' '}
              and agree to enforce it in my community.
            </span>
          </Checkbox>

          {createError && (
            <Error>
              Please fix any errors above before creating this community.
            </Error>
          )}
        </Form>

        <Actions>
          <div />
          <PrimaryOutlineButton
            onClick={create}
            disabled={
              slugTaken ||
              slugError ||
              nameError ||
              createError ||
              descriptionError ||
              !name ||
              !agreeCoC
            }
            loading={isLoading}
            data-cy="community-create-button"
          >
            {isLoading ? 'Creating...' : 'Create Community & Continue'}
          </PrimaryOutlineButton>
        </Actions>
      </FormContainer>
    );
}

export default compose(
  createCommunityMutation,
  withRouter,
  connect(),
  withApollo
)(CreateCommunityForm);
