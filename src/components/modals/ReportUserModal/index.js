// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import compose from 'recompose/compose';
import { closeModal } from 'src/actions/modals';
import { addToastWithTimeout } from 'src/actions/toasts';
import type { GetUserType } from 'shared/graphql/queries/user/getUser';
import reportUserMutation from 'shared/graphql/mutations/user/reportUser';
import type { Dispatch } from 'redux';
import ModalContainer from '../modalContainer';
import { TextButton, PrimaryOutlineButton } from 'src/components/button';
import { modalStyles } from '../styles';
import { TextArea, Error } from '../../formElements';
import { Form, Actions } from './style';
import { withCurrentUser } from 'src/components/withCurrentUser';

type Props = {
  dispatch: Dispatch<Object>,
  isOpen: boolean,
  user: GetUserType,
  currentUser: Object,
  reportUser: Function,
};

const ReportUserModal = (props: Props) => {
  const [reason, setReason] = React.useState('');
  const [reasonError, setReasonError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const close = () => {
    props.dispatch(closeModal());
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

    // create the mutation input
    const input = {
      userId: props.user.id,
      reason,
    };

    props
      .reportUser(input)
      .then(() => {
        setIsLoading(false);
        close();
        return props.dispatch(
          addToastWithTimeout(
            'success',
            'Your report has been sent to the Spectrum team. Thank you!'
          )
        );
      })
      .catch(err => {
        setIsLoading(false);
        return props.dispatch(addToastWithTimeout('error', err.toString()));
      });
  };

  const { isOpen, user } = props;

  const styles = modalStyles(420);

  return (
    <Modal
      /* TODO(@mxstbr): Fix this */
      ariaHideApp={false}
      isOpen={isOpen}
      contentLabel={`Report ${user.name}`}
      onRequestClose={close}
      shouldCloseOnOverlayClick={true}
      style={styles}
      closeTimeoutMS={330}
    >
      {/*
        We pass the closeModal dispatch into the container to attach
        the action to the 'close' icon in the top right corner of all modals
      */}
      <ModalContainer title={`Report ${user.name}`} closeModal={close}>
        <Form>
          <TextArea
            id="slug"
            defaultValue={reason}
            onChange={changeReason}
            placeholder={'Add a reason for reporting this user...'}
          >
            Reason:
          </TextArea>

          {reasonError && (
            <Error>
              Please be sure to add a reason for reporting this user so the
              Spectrum team can take appropriate action.
            </Error>
          )}

          <Actions>
            <TextButton onClick={close}>Cancel</TextButton>
            <PrimaryOutlineButton
              disabled={!reason || reason.length === 0}
              loading={isLoading}
              onClick={submit}
            >
              {isLoading ? 'Sending...' : 'Send report'}
            </PrimaryOutlineButton>
          </Actions>
        </Form>
      </ModalContainer>
    </Modal>
  );
}

const map = state => ({
  isOpen: state.modals.isOpen,
});

export default compose(
  // $FlowIssue
  connect(map),
  withCurrentUser,
  reportUserMutation
)(ReportUserModal);
