// @flow
import * as React from 'react';

const Privacy = () => {
  React.useEffect(() => {
    window.location.href =
      'https://help.github.com/en/github/site-policy/github-privacy-statement';
  }, []);

  return null;
};

export default Privacy;
