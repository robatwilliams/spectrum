// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import {
  getCommunityById,
  type GetCommunityType,
} from 'shared/graphql/queries/community/getCommunity';
import { Loading } from 'src/components/loading';
import viewNetworkHandler, {
  type ViewNetworkHandlerType,
} from 'src/components/viewNetworkHandler';
import {
  SectionCard,
  SectionTitle,
  SectionSubtitle,
  SectionCardFooter,
} from 'src/components/settingsViews/style';
import BrandedLoginToggle from './brandedLoginToggle';
import { TextButton, OutlineButton } from 'src/components/button';
import { TextArea, Error } from 'src/components/formElements';
import saveBrandedLoginSettings from 'shared/graphql/mutations/community/saveBrandedLoginSettings';
import { addToastWithTimeout } from 'src/actions/toasts';
import type { Dispatch } from 'redux';

type Props = {
  data: {
    community: GetCommunityType,
  },
  ...$Exact<ViewNetworkHandlerType>,
  saveBrandedLoginSettings: Function,
  dispatch: Dispatch<Object>,
};

const BrandedLogin = (props: Props) => {
  const [messageValue, setMessageValue] = React.useState(null);
  const [messageLengthError, setMessageLengthError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { data, saveBrandedLoginSettings, dispatch } = props;

  React.useEffect(() => {
    if (data.community && data.community.brandedLogin) {
      setMessageValue(data.community.brandedLogin.message);
    }
  }, [data.community]);

  const handleChange = e => {
    setMessageValue(e.target.value);
    setMessageLengthError(e.target.value.length > 280 ? true : false);
  };

  const saveCustomMessage = e => {
    e.preventDefault();

    if (messageValue && messageValue.length > 280) {
      setMessageLengthError(true);
      return;
    }

    setIsLoading(true);

    return saveBrandedLoginSettings({
      message: messageValue,
      id: data.community.id,
    })
      .then(() => {
        setMessageLengthError(false);
        setIsLoading(false);
        return dispatch(addToastWithTimeout('success', 'Saved!'));
      })
      .catch(err => {
        setMessageLengthError(false);
        setIsLoading(false);
        return dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const { community } = data;
  const isLoadingData = props.isLoading;

  if (community) {
    const { brandedLogin } = community;
    return (
      <SectionCard data-cy="community-settings-branded-login">
        <SectionTitle>Branded Login</SectionTitle>
        <SectionSubtitle>
          Display a custom login message when people are signing up to Spectrum
          directly from your community’s profile
        </SectionSubtitle>

        <BrandedLoginToggle settings={brandedLogin} id={community.id} />

        <form onSubmit={saveCustomMessage}>
          {brandedLogin.isEnabled && (
            <TextArea
              defaultValue={brandedLogin.message}
              placeholder={'Set a custom message for the login screen'}
              onChange={handleChange}
              dataCy="community-settings-branded-login-input"
            />
          )}

          {messageLengthError && (
            <Error>Custom login messages should be under 280 characters.</Error>
          )}

          {brandedLogin.isEnabled && (
            <SectionCardFooter
              style={{
                flexDirection: 'row-reverse',
                justifyContent: 'flex-start',
              }}
            >
              <OutlineButton
                style={{ alignSelf: 'flex-start', marginLeft: '8px' }}
                onSubmit={saveCustomMessage}
                onClick={saveCustomMessage}
                disabled={messageLengthError}
                loading={isLoading}
                data-cy="community-settings-branded-login-save"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </OutlineButton>

              <TextButton
                to={`/${community.slug}/login`}
                style={{ alignSelf: 'flex-start', marginRight: '8px' }}
                data-cy="community-settings-branded-login-preview"
              >
                Preview
              </TextButton>
            </SectionCardFooter>
          )}
        </form>
      </SectionCard>
    );
  }

  if (isLoadingData) {
    return (
      <SectionCard>
        <Loading />
      </SectionCard>
    );
  }

  return null;
};

export default compose(
  getCommunityById,
  viewNetworkHandler,
  saveBrandedLoginSettings,
  connect()
)(BrandedLogin);
