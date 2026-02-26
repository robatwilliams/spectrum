// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import { closeModal } from '../../../actions/modals';
import ModalContainer from '../modalContainer';
import { TextButton, WarnButton } from '../../button';
import { Actions, Message } from './style';
import { modalStyles } from '../styles';
import { ENTER } from '../../../helpers/keycodes';

import type { Dispatch } from 'redux';

type Props = {
  dispatch: Dispatch<Object>,
  isOpen: boolean,
  modalProps: any,
};

const CloseComposerConfirmation = (props: Props) => {
  const { dispatch, isOpen, modalProps } = props;
  const { message, ...callbacks } = modalProps;

  const close = React.useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  const closeConfirmed = React.useCallback((functionsArray) => {
    // functionArgs contains some of the action you want to execute when
    // confirmation is accepted (yes clicked)
    for (const func of functionsArray) {
      func();
    }

    close();
  }, [close]);

  const handleKeyPress = React.useCallback((e) => {
    const enter = e.keyCode === ENTER;

    const functions = Object.keys(callbacks).map(k => callbacks[k]);

    if (enter) {
      closeConfirmed(functions);
    }
  }, [callbacks, closeConfirmed]);

  React.useEffect(() => {
    // $FlowIssue
    document.addEventListener('keydown', handleKeyPress, false);

    return () => {
      // $FlowIssue
      document.removeEventListener('keydown', handleKeyPress, false);
      close();
    };
  }, [handleKeyPress, close]);

  const functions = Object.keys(callbacks).map(k => callbacks[k]);

  const styles = modalStyles();

  return (
    <Modal
      ariaHideApp={false}
      isOpen={isOpen}
      onRequestClose={close}
      shouldCloseOnOverlayClick={true}
      style={styles}
      closeTimeoutMS={330}
    >
      <ModalContainer
        dataCy="discard-draft-modal"
        title={'Discard Draft'}
        closeModal={close}
      >
        <Message>
          {message ? message : 'Are you sure you want to discard this draft?'}
        </Message>

        <Actions>
          <TextButton
            color={'text.placeholder'}
            hoverColor={'warn.default'}
            onClick={close}
            data-cy={'discard-draft-cancel'}
          >
            Cancel
          </TextButton>

          <WarnButton
            gradientTheme={'warn'}
            color={'warn.default'}
            hoverColor={'warn.default'}
            data-cy={'discard-draft-discard'}
            onClick={() => closeConfirmed(functions)}
          >
            Discard
          </WarnButton>
        </Actions>
      </ModalContainer>
    </Modal>
  );
};

const mapStateToProps = state => ({
  isOpen: state.modals.isOpen,
  modalProps: state.modals.modalProps,
});

// $FlowIssue
export default connect(mapStateToProps)(CloseComposerConfirmation);
