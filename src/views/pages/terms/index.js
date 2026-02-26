// @flow
import * as React from 'react';

const Terms = () => {
  React.useEffect(() => {
    window.location.href =
      'https://help.github.com/en/github/site-policy/github-terms-of-service';
  }, []);
  
  return null;
};
export default Terms;
