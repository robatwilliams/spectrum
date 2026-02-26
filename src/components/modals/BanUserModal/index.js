// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import compose from 'recompose/compose';
import { closeModal } from 'src/actions/modals';
import { addToastWithTimeout } from 'src/actions/toasts';
import type { GetUserType } from 'shared/graphql/queries/user/getUser';
import banUserMutation from 'shared/graphql/mutations/user/banUser';
import type { Dispatch } from 'redux';
import ModalContainer from '../modalContainer';
import { TextButton, WarnButton } from 'src/components/button';
import { modalStyles } from '../styles';
import { TextArea, Error } from '../../formElements';
import { Form, Actions, Subtitle } from './style';
import { withCurrentUser } from 'src/components/withCurrentUser';

type Props = {
  dispatch: Dispatch<Object>,
  isOpen: boolean,
  user: GetUserType,
  currentUser: Object,
  banUser: Function,
};

const BanUserModal = (props: Props) => {
  const { dispatch, isOpen, user, banUser } = props;
  const [reason, setReason] = React.useState('');
  const [reasonError, setReasonError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const close = () => {
    dispatch(closeModal());
  };

  const changeReason = e => {
    const reason = e.target.value;

    setReason(reason);
    setReasonError(false);
  };

  const submit = e => {
    e.preventDefault();

    if (!reason || reason.length === 0) {
      return setReasonError(false);
    }

    setIsLoading(true);

    const input = {
      userId: user.id,
      reason,
    };

    banUser(input)
      .then(() => {
        setIsLoading(false);
        close();
        return dispatch(
          addToastWithTimeout('success', 'User has been banned.')
        );
      })
      .catch(err => {
        setIsLoading(false);
        return dispatch(addToastWithTimeout('error', err.toString()));
      });
  };

  const styles = modalStyles(420);

  return (
    <Modal
      /* TODO(@mxstbr): Fix this */
      ariaHideApp={false}
      isOpen={isOpen}
      contentLabel={`Ban ${user.name}`}
      onRequestClose={close}
      shouldCloseOnOverlayClick={true}
      style={styles}
      closeTimeoutMS={330}
    >
      <ModalContainer
        title={`Ban ${user.name} (@${user.username})`}
        closeModal={close}
      >
        <Subtitle>
          Banning a user is very hard to undo. Please be sure you want this
          user to be permanently banned before completing this step.
        </Subtitle>
        <Form>
          <TextArea
            defaultValue={reason}
            onChange={changeReason}
            placeholder={'Add a reason for banning this user...'}
          />

          {reasonError && (
            <Error>
              Please be sure to add a reason for banning this user for our
              records.
            </Error>
          )}

          <Actions>
            <TextButton onClick={close}>Cancel</TextButton>
            <WarnButton
              disabled={!reason || reason.length === 0}
              loading={isLoading}
              onClick={submit}
            >
              {isLoading ? 'Banning...' : 'Ban User'}
            </WarnButton>
          </Actions>
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
  withCurrentUser,
  banUserMutation
)(BanUserModal);
