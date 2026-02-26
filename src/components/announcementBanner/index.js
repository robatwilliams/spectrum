// @flow
import * as React from 'react';
import { useState, useEffect } from 'react';
import Icon from 'src/components/icon';
import { Bar, Content, Dismiss } from './style';
import { getItemFromStorage, storeItem } from 'src/helpers/localStorage';

const lsKey = 'hasDismissedPrivacyTermsRedirectBanner';

const Banner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hidden = getItemFromStorage(lsKey);
    if (!hidden) setVisible(true);
  }, []);

  const dismiss = () => {
    storeItem(lsKey, true);
    return setVisible(false);
  };

  if (!visible) return null;
  
  return (
    <Bar>
      <Content>
        <Icon glyph="announcement" size="24" />
        <p>
          Spectrum has updated its{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={
              'https://help.github.com/en/github/site-policy/github-privacy-statement'
            }
          >
            Privacy Statement
          </a>
          {', and '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={
              'https://help.github.com/en/github/site-policy/github-terms-of-service'
            }
          >
            Terms of Service
          </a>
          .
        </p>
      </Content>
      <Dismiss onClick={dismiss}>×</Dismiss>
    </Bar>
  );
};

export default Banner;
