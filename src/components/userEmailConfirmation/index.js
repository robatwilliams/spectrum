// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { addToastWithTimeout } from 'src/actions/toasts';
import updateUserEmailMutation from 'shared/graphql/mutations/user/updateUserEmail';
import { Button } from 'src/components/button';
import { Input, Error } from '../formElements';
import isEmail from 'validator/lib/isEmail';
import { EmailForm } from './style';
import { Notice } from '../listItems/style';
import type { GetUserType } from 'shared/graphql/queries/user/getUser';
import type { Dispatch } from 'redux';

type Props = {
  render: Function,
  user: GetUserType,
  updateUserEmail: Function,
  dispatch: Dispatch<Object>,
};

const UserEmailConfirmation = (props: Props) => {
  const { user, updateUserEmail, dispatch } = props;

  const [isLoading, setIsLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');
  const [email, setEmail] = React.useState('');

  const mutate = () => {
    if (!email || email.length === 0 || !isEmail(email)) {
      setIsLoading(false);
      setEmailError('Please enter a working email address');
      return;
    }

    return updateUserEmail(email)
      .then(() => {
        dispatch(
          addToastWithTimeout('success', `Confirmation email sent to ${email}`)
        );
        setIsLoading(false);
        setEmailError('');
      })
      .catch(err => {
        dispatch(addToastWithTimeout('error', err.message));
        setIsLoading(false);
        setEmailError(err.message);
      });
  };

  const init = e => {
    e.preventDefault();
    if (!updateUserEmail) return;
    setIsLoading(true);
    return mutate();
  };

  const handleEmailChange = e => {
    setEmail(e.target.value);
    setEmailError('');
  };

  return (
    <React.Fragment>
      <EmailForm
        onSubmit={init}
        style={{ marginTop: '8px', marginBottom: '8px' }}
      >
        <Input
          type="email"
          defaultValue={email}
          onChange={handleEmailChange}
          placeholder={'Add your email address'}
        >
          Email Address
        </Input>

        <Button onClick={init} loading={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </EmailForm>

      {user.pendingEmail && (
        <Notice>
          A confirmation link was sent to {user.pendingEmail}. Click the
          confirmation link and then return to this page. You can resend the
          confirmation here, or enter a new email address.
        </Notice>
      )}

      {emailError && <Error>{emailError}</Error>}
    </React.Fragment>
  );
};

export default compose(
  updateUserEmailMutation,
  // $FlowIssue
  connect()
)(UserEmailConfirmation);
