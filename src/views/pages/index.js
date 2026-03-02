// @flow
import * as React from 'react';
import Nav from './components/nav';
import Support from './support';
import Features from './features';
import Home from './home';
import Terms from './terms';
import Privacy from './privacy';
import Faq from './faq';
import Apps from './apps';
import { StyledViewGrid } from './style';

type Props = {
  match: Object,
};

const Pages = (props: Props) => {
  const renderPage = () => {
    switch (props.match.path) {
      case '/support': {
        return <Support {...props} />;
      }
      case '/features': {
        return <Features {...props} />;
      }
      case '/terms':
      case '/terms.html': {
        return <Terms {...props} />;
      }
      case '/privacy':
      case '/privacy.html': {
        return <Privacy {...props} />;
      }
      case '/faq': {
        return <Faq {...props} />;
      }
      case '/apps': {
        return <Apps {...props} />;
      }
      case '/':
      case '/about':
      default: {
        return <Home {...props} />;
      }
    }
  };

  const {
    match: { path },
  } = props;
  const dark = path === '/' || path === '/about';

  return (
    <StyledViewGrid>
      <div style={{ position: 'relative' }}>
        <Nav
          dark={dark ? 'true' : undefined}
          location={props.match.path.substr(1)}
        />
        {renderPage()}
      </div>
    </StyledViewGrid>
  );
};

export default Pages;
