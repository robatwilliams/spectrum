// @flow
import * as React from 'react';
import { withRouter } from 'react-router';
import { withApollo } from 'react-apollo';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { PrimaryOutlineButton } from 'src/components/button';
import Icon from 'src/components/icon';
import { SERVER_URL, CLIENT_URL } from 'src/api/constants';
import GithubProfile from 'src/components/githubProfile';
import { GithubSigninButton } from 'src/components/loginButtonSet/github';
import {
  Input,
  TextArea,
  Error,
  Success,
  PhotoInput,
  CoverInput,
} from 'src/components/formElements';
import UsernameSearch from 'src/components/usernameSearch';
import { StyledLabel } from 'src/components/formElements/style';
import {
  Form,
  Actions,
  ImageInputWrapper,
  Location,
  GithubSignin,
} from '../style';
import editUserMutation from 'shared/graphql/mutations/user/editUser';
import type { EditUserType } from 'shared/graphql/mutations/user/editUser';
import { addToastWithTimeout } from 'src/actions/toasts';
import {
  PRO_USER_MAX_IMAGE_SIZE_STRING,
  PRO_USER_MAX_IMAGE_SIZE_BYTES,
} from 'src/helpers/images';
import { Notice } from 'src/components/listItems/style';
import { SectionCard, SectionTitle } from 'src/components/settingsViews/style';
import type { Dispatch } from 'redux';
import type { GetCurrentUserSettingsType } from 'shared/graphql/queries/user/getCurrentUserSettings';
import isEmail from 'validator/lib/isEmail';

type State = {
  website: ?string,
  name: string,
  username: string,
  description: ?string,
  image: string,
  coverPhoto: string,
  file: ?Object,
  coverFile: ?Object,
  descriptionError: boolean,
  nameError: boolean,
  createError: boolean,
  isLoading: boolean,
  photoSizeError: string,
  usernameError: string,
  email: string,
  emailError: string,
  didChangeEmail: boolean,
};

type Props = {
  dispatch: Dispatch<Object>,
  client: Object,
  editUser: Function,
  user: GetCurrentUserSettingsType,
};

const UserWithData = (props: Props) => {
  const { user, editUser, dispatch } = props;

  const [website, setWebsite] = React.useState(user.website ? user.website : '');
  const [name, setName] = React.useState(user.name ? user.name : '');
  const [username, setUsername] = React.useState(user.username ? user.username : '');
  const [description, setDescription] = React.useState(user.description ? user.description : '');
  const [image, setImage] = React.useState(user.profilePhoto);
  const [coverPhoto, setCoverPhoto] = React.useState(user.coverPhoto);
  const [file, setFile] = React.useState(null);
  const [coverFile, setCoverFile] = React.useState(null);
  const [descriptionError, setDescriptionError] = React.useState(false);
  const [nameError, setNameError] = React.useState(false);
  const [createError, setCreateError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [photoSizeError, setPhotoSizeError] = React.useState('');
  const [usernameError, setUsernameError] = React.useState('');
  const [email, setEmail] = React.useState(user.email ? user.email : '');
  const [emailError, setEmailError] = React.useState('');
  const [didChangeEmail, setDidChangeEmail] = React.useState(false);

  const changeName = e => {
    const name = e.target.value;
    if (name.length > 50) {
      setName(name);
      setNameError(true);
      return;
    }
    setName(name);
    setNameError(false);
  };

  const changeEmail = e => {
    const email = e.target.value;

    if (!email || email.length === 0) {
      setEmail(email);
      setEmailError("Your email can't be blank");
      setDidChangeEmail(false);
      return;
    }

    setEmail(email);
    setEmailError('');
    setDidChangeEmail(false);
  };

  const changeDescription = e => {
    const description = e.target.value;
    if (description.length >= 140) {
      setDescriptionError(true);
      return;
    }

    setDescription(description);
    setDescriptionError(false);
  };

  const changeWebsite = e => {
    const website = e.target.value;
    setWebsite(website);
  };

  const setProfilePhoto = e => {
    let reader = new FileReader();
    let file = e.target.files[0];

    if (!file) return;

    setIsLoading(true);

    if (file && file.size > PRO_USER_MAX_IMAGE_SIZE_BYTES) {
      setPhotoSizeError(`Try uploading a file less than ${PRO_USER_MAX_IMAGE_SIZE_STRING}.`);
      setIsLoading(false);
      return;
    }

    reader.onloadend = () => {
      setFile(file);
      // $FlowFixMe
      setImage(reader.result);
      setPhotoSizeError('');
      setIsLoading(false);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const setCoverPhotoHandler = e => {
    let reader = new FileReader();
    let file = e.target.files[0];

    if (!file) return;

    setIsLoading(true);

    if (file && file.size > PRO_USER_MAX_IMAGE_SIZE_BYTES) {
      setPhotoSizeError(`Try uploading a file less than ${PRO_USER_MAX_IMAGE_SIZE_STRING}.`);
      setIsLoading(false);
      return;
    }

    reader.onloadend = () => {
      setCoverFile(file);
      // $FlowFixMe
      setCoverPhoto(reader.result);
      setPhotoSizeError('');
      setIsLoading(false);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const save = e => {
    e.preventDefault();

    if (!isEmail(email)) {
      setEmailError('Please add a valid email address.');
      return;
    }

    if (email !== user.email) {
      setDidChangeEmail(true);
    }

    if (photoSizeError || usernameError || emailError) {
      return;
    }

    setIsLoading(true);

    const input = {
      name,
      description,
      website,
      file,
      coverFile,
      username,
      email,
    };

    editUser(input)
      .then(({ data: { editUser: editedUser } }: { data: { editUser: EditUserType } }) => {
        setIsLoading(false);

        // the mutation returns a user object. if it exists,
        if (editedUser !== undefined) {
          dispatch(addToastWithTimeout('success', 'Changes saved!'));
          setFile(null);
        }

        return;
      })
      .catch(err => {
        setIsLoading(false);
        dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const handleUsernameValidation = ({ error, username: newUsername }) => {
    // we want to reset error if was typed same username which was set before
    const usernameErr = user.username === newUsername ? '' : error;
    setUsernameError(usernameErr);
    setUsername(newUsername);
  };

  const handleOnError = err => {
    dispatch(addToastWithTimeout('error', err.message));
  };

  const postAuthRedirectPath = `${CLIENT_URL}/users/${username}/settings`;

  return (
      <SectionCard data-cy="user-edit-form">
        <Location>
          <Icon glyph="view-back" size={16} />
          <Link to={`/users/${username}`}>Return to Profile</Link>
        </Location>
        <SectionTitle>Profile Settings</SectionTitle>
        <Form onSubmit={save}>
          <ImageInputWrapper>
            <CoverInput
              onChange={setCoverPhotoHandler}
              defaultValue={coverPhoto}
              preview={true}
            />
            <PhotoInput
              type={'user'}
              onChange={setProfilePhoto}
              defaultValue={image}
            />
          </ImageInputWrapper>

          {photoSizeError && (
            <Notice style={{ marginTop: '32px' }}>{photoSizeError}</Notice>
          )}

          <div style={{ height: '8px' }} />

          <Input
            type="text"
            defaultValue={name}
            onChange={changeName}
            placeholder={"What's your name?"}
            dataCy="user-name-input"
          >
            Name
          </Input>

          {nameError && <Error>Names can be up to 50 characters.</Error>}

          <UsernameSearch
            type={'text'}
            label="Username"
            size={'small'}
            username={username}
            placeholder="Set a username..."
            onValidationResult={handleUsernameValidation}
            onError={handleOnError}
            dataCy="user-username-input"
          />

          {usernameError && (
            <Notice style={{ marginTop: '16px' }}>{usernameError}</Notice>
          )}

          <TextArea
            defaultValue={description}
            onChange={changeDescription}
            placeholder={'Introduce yourself to the class...'}
            dataCy="user-description-input"
          >
            Bio
          </TextArea>

          {descriptionError && <Error>Bios can be up to 140 characters.</Error>}

          <Input
            defaultValue={website}
            onChange={changeWebsite}
            dataCy="user-website-input"
          >
            Optional: Add your website
          </Input>

          <Input
            type="text"
            defaultValue={email}
            onChange={changeEmail}
            placeholder={'Email address'}
            dataCy="user-email-input"
          >
            Email
          </Input>

          {didChangeEmail && (
            <Success>A confirmation email has been sent to {email}.</Success>
          )}
          {emailError && <Error>{emailError}</Error>}

          <GithubProfile
            id={user.id}
            render={profile => {
              if (!profile) {
                return (
                  <GithubSignin>
                    <StyledLabel>Connect your GitHub Profile</StyledLabel>
                    <GithubSigninButton
                      href={`${SERVER_URL}/auth/github?r=${postAuthRedirectPath}`}
                      preferred={true}
                      showAfter={false}
                      onClickHandler={null}
                      verb={'Connect'}
                    />
                  </GithubSignin>
                );
              } else {
                return (
                  <Input
                    disabled
                    defaultValue={`github.com/${profile.username}`}
                  >
                    <div>
                      Your GitHub Profile ·{' '}
                      <span>
                        <a
                          href={`${SERVER_URL}/auth/github?r=${postAuthRedirectPath}`}
                        >
                          Refresh username
                        </a>
                      </span>
                    </div>
                  </Input>
                );
              }
            }}
          />

          <Actions>
            <PrimaryOutlineButton
              disabled={
                !name ||
                nameError ||
                !username ||
                !!usernameError ||
                isLoading ||
                !!emailError
              }
              loading={isLoading}
              onClick={save}
              data-cy="save-button"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </PrimaryOutlineButton>
          </Actions>

          {createError && (
            <Error>Please fix any errors above to save your profile.</Error>
          )}
        </Form>
      </SectionCard>
    );
};

const UserSettings = compose(
  editUserMutation,
  withRouter,
  withApollo,
  connect()
)(UserWithData);
export default UserSettings;
