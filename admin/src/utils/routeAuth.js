import * as React from 'react';
import { Route } from 'react-router';
import compose from 'recompose/compose';
import { isAdmin } from '../api/queries';

const Protect = (props) => {
  const [isAuthed, setIsAuthed] = React.useState(false);
  const prevPropsRef = React.useRef();

  React.useEffect(() => {
    const { data } = props;
    const prevData = prevPropsRef.current && prevPropsRef.current.data;

    if (prevData && prevData.loading && !data.loading && data.meta) {
      setIsAuthed(data.meta.isAdmin);
    }

    prevPropsRef.current = props;
  });

  const { component: Component, ...rest } = props;

  if (isAuthed) {
    return <Route {...rest} render={props => <Component {...props} />} />;
  }

  return null;
};

export default compose(isAdmin)(Protect);
