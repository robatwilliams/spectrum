// @flow
import React from 'react';
import compose from 'recompose/compose';
import { withRouter, type Location, type History } from 'react-router';
import querystring from 'querystring';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { addToastWithTimeout } from 'src/actions/toasts';

type Props = {
  location: Location,
  history: History,
  dispatch: Dispatch<Object>,
};

const QueryParamToastDispatcher = (props: Props) => {
  const { location, history, dispatch } = props;

  const getParams = (props: Props) => {
    return querystring.parse(props.location.search.replace('?', ''));
  };

  const hasValidToastParams = (params: Object) => {
    const validToastTypes = ['success', 'error', 'neutral'];
    return (
      params.toastType &&
      validToastTypes.indexOf(params.toastType) >= 0 &&
      params.toastMessage
    );
  };

  /*
    There could be many parameters besides toastMessage and toastType.
    This component only cares about changes to these two specific params though,
    so we can filter down to an object with only what we need and use that to
    determine whether we need to dispatch a new toast or not
  */
  const filterToastParams = (params: Object) => ({
    toastMessage: params['toastMessage'],
    toastType: params['toastType'],
  });

  const cleanLocation = () => {
    const params = getParams(props);
    const clean = {};
    Object.keys(params).map(key => {
      if (!key || key === 'toastMessage' || key === 'toastType') return null;
      clean[key] = params[key];
      return null;
    });
    const cleanParams = querystring.stringify(clean);
    /*
      We decode the cleanParams in order to preserver special characters in the url
      For example, the url /spectrum/general/another-thread~thread-2?m=MTQ4MzIyNTIwMDAwMg== 
      has two equals signs at the end. If we don't decode the cleanParams it will become
      spectrum/general/another-thread~thread-2?m=MTQ4MzIyNTIwMDAwMg%3D%3D
    */
    return history.push({ search: decodeURIComponent(cleanParams) });
  };

  React.useEffect(() => {
    const params = filterToastParams(getParams(props));
    if (hasValidToastParams(params)) {
      dispatch(addToastWithTimeout(params.toastType, params.toastMessage));
      cleanLocation();
    }
  }, []);

  React.useEffect(() => {
    const params = filterToastParams(getParams(props));
    if (hasValidToastParams(params)) {
      dispatch(addToastWithTimeout(params.toastType, params.toastMessage));
      cleanLocation();
    }
  }, [location.search]);

  return null;
};

export default compose(
  withRouter,
  connect()
)(QueryParamToastDispatcher);
