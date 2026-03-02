// @flow
import * as React from 'react';
import slugg from 'slugg';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo';
import compose from 'recompose/compose';
import { Error, Success } from 'src/components/formElements';
import UsernameSearch from 'src/components/usernameSearch';
import { addToastWithTimeout } from 'src/actions/toasts';
import { Form, Row } from './style';
import editUserMutation from 'shared/graphql/mutations/user/editUser';
import { ContinueButton } from '../../style';
import type { Dispatch } from 'redux';

type Props = {
  client: Object,
  editUser: Function,
  save: Function,
  dispatch: Dispatch<Object>,
  user: ?Object,
};

const SetUsername = (props: Props) => {
  const { user, editUser, save, dispatch } = props;
  const isMountedRef = React.useRef(false);

  // try to intelligently suggest a starting username based on the
  // person's name, or firstname/lastname
  const initialUsername = user
    ? user.name
      ? slugg(user.name)
      : user.firstName && user.lastName
      ? `${user.firstName}-${user.lastName}`
      : ''
    : '';

  const [username, setUsername] = React.useState(initialUsername);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleUsernameValidation = ({ error, success, username }) => {
    setError(error);
    setSuccess(success);
    setUsername(username);
  };

  const saveUsername = e => {
    e.preventDefault();

    setIsLoading(true);

    const input = {
      username,
    };

    editUser(input)
      .then(() => {
        if (!isMountedRef.current) return;
        setIsLoading(false);
        setSuccess('');

        // trigger a method in the newUserOnboarding component class
        // to determine what to do next with this user - either push them
        // to community discovery or close the onboarding completely
        return save();
      })
      .catch(err => {
        if (!isMountedRef.current) return;
        setIsLoading(false);
        setSuccess('');
        dispatch(addToastWithTimeout('error', err.message));
      });
  };

  return (
    <Form onSubmit={saveUsername}>
      <Row>
        <UsernameSearch
          placeholder={'Your username...'}
          autoFocus={true}
          username={username}
          onValidationResult={handleUsernameValidation}
          dataCy={'username-search'}
        />
      </Row>

      <Row style={{ minHeight: '43px' }}>
        {error && <Error data-cy="username-search-error">{error}</Error>}
        {success && (
          <Success data-cy="username-search-success">{success}</Success>
        )}
      </Row>

      <Row>
        <ContinueButton
          onClick={saveUsername}
          disabled={!username || error}
          loading={isLoading}
          data-cy="save-username-button"
        >
          {isLoading ? 'Saving...' : 'Save and Continue'}
        </ContinueButton>
      </Row>
    </Form>
  );
};

export default compose(
  editUserMutation,
  withApollo,
  connect()
)(SetUsername);
