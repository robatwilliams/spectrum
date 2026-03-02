// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { Checkbox } from 'src/components/formElements';
import WebPushManager from 'src/helpers/web-push-manager';
import { addToastWithTimeout } from 'src/actions/toasts';
import { subscribeToWebPush } from 'shared/graphql/subscriptions';
import { ListContainer, Notice } from 'src/components/listItems/style';
import { SectionCard, SectionTitle } from 'src/components/settingsViews/style';
import { EmailListItem } from '../style';
import type { Dispatch } from 'redux';

type Props = {
  subscribeToWebPush: Function,
  dispatch: Dispatch<Object>,
  smallOnly?: boolean,
  largeOnly?: boolean,
};

const NotificationSettings = (props: Props) => {
  const [webPushBlocked, setWebPushBlocked] = React.useState(false);
  const [subscription, setSubscription] = React.useState(null);
  const {
    subscribeToWebPush: subscribeToWebPushProp,
    dispatch,
    smallOnly,
    largeOnly,
  } = props;

  React.useEffect(() => {
    WebPushManager.getPermissionState().then(result => {
      if (result === 'denied') {
        setWebPushBlocked(true);
      }
    });
    WebPushManager.getSubscription().then(subscription => {
      setSubscription(subscription || false);
    });
  }, []);

  const subscribeToWebPushHandler = () => {
    WebPushManager.subscribe()
      .then(subscription => {
        setSubscription(subscription);
        setWebPushBlocked(false);
        return subscribeToWebPushProp(subscription);
      })
      .catch(err => {
        return dispatch(
          addToastWithTimeout(
            'error',
            "Oops, we couldn't enable browser notifications for you. Please try again!"
          )
        );
      });
  };

  const unsubscribeFromWebPush = () => {
    WebPushManager.unsubscribe()
      .then(result => {
        if (result) {
          setSubscription(false);
        } else {
          return dispatch(
            addToastWithTimeout(
              'error',
              "Oops, we couldn't disable browser notifications for you. Please try again!"
            )
          );
        }
      })
      .catch(() => {
        return dispatch(
          addToastWithTimeout(
            'error',
            "Oops, we couldn't disable browser notifications for you. Please try again!"
          )
        );
      });
  };

  const onChange = !subscription
    ? subscribeToWebPushHandler
    : unsubscribeFromWebPush;

  return (
    <SectionCard smallOnly={smallOnly} largeOnly={largeOnly}>
      <SectionTitle>Notification Preferences</SectionTitle>
      <ListContainer>
        <EmailListItem>
          {subscription !== null && (
            <Checkbox
              checked={!!subscription}
              disabled={webPushBlocked}
              onChange={onChange}
            >
              Enable browser push notifications
            </Checkbox>
          )}
          {webPushBlocked && (
            <Notice>
              <strong>
                You have blocked browser push notifications on this device!
              </strong>{' '}
              Unblock them by following{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://support.sendpulse.com/456261-How-to-Unblock-Web-Push-Notifications"
              >
                these steps
              </a>
              .
            </Notice>
          )}
        </EmailListItem>
      </ListContainer>
    </SectionCard>
  );
};

export default compose(
  subscribeToWebPush,
  connect()
)(NotificationSettings);
