// @flow
import * as React from 'react';
import Icon from 'src/components/icon';
import {
  hasDismissedDesktopAppUpsell,
  dismissDesktopAppUpsell,
  isDesktopApp,
  DESKTOP_APP_MAC_URL,
} from 'src/helpers/desktop-app-utils';
import { isMac } from 'src/helpers/is-os';
import { OutlineButton } from 'src/components/button';
import {
  Container,
  Card,
  AppIcon,
  CloseIconContainer,
  Content,
  Title,
  Subtitle,
} from './style';

const DesktopAppUpsell = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const desktopUpsellVisible =
      isMac() && !isDesktopApp() && !hasDismissedDesktopAppUpsell();

    if (desktopUpsellVisible) {
      setIsVisible(true);
    }
  }, []);

  const close = () => {
    dismissDesktopAppUpsell();
    return setIsVisible(false);
  };

  const download = () => {
    dismissDesktopAppUpsell();
    return setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Container>
      <Card>
        <AppIcon src={'/img/homescreen-icon-72x72.png'} />
        <CloseIconContainer onClick={close}>
          <Icon glyph="view-close" size={20} />
        </CloseIconContainer>
        <Content>
          <Title>Download Spectrum for Mac</Title>
          <Subtitle>A better way to keep up with your communities.</Subtitle>

          <a href={DESKTOP_APP_MAC_URL} onClick={download}>
            <OutlineButton>Download</OutlineButton>
          </a>
        </Content>
      </Card>
    </Container>
  );
};

export default DesktopAppUpsell;
