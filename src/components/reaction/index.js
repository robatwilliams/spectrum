// @flow
import { openModal } from 'src/actions/modals';
import type { GetMessageType } from 'shared/graphql/queries/message/getMessage';
import type { Dispatch } from 'redux';

type Props = {
  toggleReaction: Function,
  dispatch: Dispatch<Object>,
  currentUser?: Object,
  me: boolean,
  message: GetMessageType,
  render: Function,
};

const Reaction = (props: Props) => {
  const { toggleReaction, message, dispatch, currentUser, me, render } = props;

  const triggerMutation = () => {
    if (!currentUser) {
      return dispatch(openModal('LOGIN_MODAL', {}));
    }

    return toggleReaction({
      messageId: message.id,
      type: 'like',
    });
  };

  const {
    reactions: { hasReacted, count },
  } = message;
  const mutation = me ? () => {} : triggerMutation;

  return render({ me, hasReacted, count, mutation });
}

export default Reaction;
