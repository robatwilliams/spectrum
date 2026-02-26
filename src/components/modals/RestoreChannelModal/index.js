// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import compose from 'recompose/compose';
import { closeModal } from 'src/actions/modals';
import { addToastWithTimeout } from 'src/actions/toasts';
import type { GetChannelType } from 'shared/graphql/queries/channel/getChannel';
import restoreChannel from 'shared/graphql/mutations/channel/restoreChannel';
import ModalContainer from '../modalContainer';
import { TextButton, PrimaryOutlineButton } from 'src/components/button';
import { modalStyles, Description } from '../styles';
import { Form, Actions } from './style';
import type { Dispatch } from 'redux';
import { withCurrentUser } from 'src/components/withCurrentUser';

type Props = {
  dispatch: Dispatch<Object>,
  isOpen: boolean,
  channel: GetChannelType,
  id: string,
  restoreChannel: Function,
};

const RestoreChannelModal = (props: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const close = () => {
    props.dispatch(closeModal());
  };

  const restore = (e: any) => {
    e.preventDefault();
    const { channel, dispatch } = props;

    return props
      .restoreChannel({ channelId: channel.id })
      .then(() => {
        dispatch(addToastWithTimeout('success', 'Channel restored'));
        setIsLoading(false);
        return close();
      })
      .catch(err => {
        dispatch(addToastWithTimeout('error', err.message));
        setIsLoading(false);
      });
  };

  const { isOpen } = props;

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
      <ModalContainer title={'Restore Channel'} closeModal={close}>
        <Form>
          <Description>
            Are you sure you want to restore this channel? Members will be
            able to start new conversations and join this channel.
          </Description>

          <Actions>
            <TextButton onClick={close}>Cancel</TextButton>
            <PrimaryOutlineButton loading={isLoading} onClick={restore}>
              {isLoading ? 'Restoring...' : 'Restore Channel'}
            </PrimaryOutlineButton>
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
  restoreChannel
)(RestoreChannelModal);
