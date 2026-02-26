// @flow
import * as React from 'react';
import { Checkbox } from 'src/components/formElements';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import enableBrandedLoginMutation from 'shared/graphql/mutations/community/enableBrandedLogin';
import disableBrandedLoginMutation from 'shared/graphql/mutations/community/disableBrandedLogin';
import { addToastWithTimeout } from 'src/actions/toasts';
import type { Dispatch } from 'redux';

type Props = {
  id: string,
  settings: {
    isEnabled: boolean,
  },
  enableBrandedLogin: Function,
  disableBrandedLogin: Function,
  dispatch: Dispatch<Object>,
};

const BrandedLoginToggle = (props: Props) => {
  const { id, settings, enableBrandedLogin, disableBrandedLogin, dispatch } = props;

  const disable = () => {
    return disableBrandedLogin({ id: id })
      .then(() => {
        return dispatch(
          addToastWithTimeout('neutral', 'Branded login disabled')
        );
      })
      .catch(err => {
        return dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const enable = () => {
    return enableBrandedLogin({ id: id })
      .then(() => {
        return dispatch(
          addToastWithTimeout('success', 'Branded login enabled')
        );
      })
      .catch(err => {
        return dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const init = () => {
    return settings.isEnabled ? disable() : enable();
  };

  const { isEnabled } = settings;

  return (
    <Checkbox checked={isEnabled} onChange={init}>
      Enable custom branded login
    </Checkbox>
  );
}

export default compose(
  connect(),
  enableBrandedLoginMutation,
  disableBrandedLoginMutation
)(BrandedLoginToggle);
