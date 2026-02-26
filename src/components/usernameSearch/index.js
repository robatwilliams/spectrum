// @flow
import * as React from 'react';
import slugg from 'slugg';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo';
import { getUserByUsernameQuery } from 'shared/graphql/queries/user/getUser';
import type { GetUserType } from 'shared/graphql/queries/user/getUser';
import { debounce } from 'src/helpers/utils';
import { Spinner } from '../globals';
import { Input, Loading } from './style';

type Props = {
  client: Object,
  username: string,
  label: string,
  size: string,
  onValidationResult: ({
    error: string,
    success: string,
    username?: string,
  }) => void,
  onError: ?(err: Error) => void,
  dataCy?: string,
};

const UsernameSearch = (props: Props) => {
  const { client, username: initialUsername, onValidationResult, onError, label, size, dataCy, ...rest } = props;
  const [username, setUsername] = React.useState(slugg(initialUsername));
  const [isSearching, setIsSearching] = React.useState(false);

  const isUsernameValid = (username) => username.length > 0 && username.length <= 20;

  const notifyParentWithValidationResult = (username) => {
    if (username.length > 20) {
      onValidationResult({
        error: 'Usernames can be up to 20 characters',
        success: '',
      });
    } else if (username.length === 0) {
      onValidationResult({
        error: 'Be sure to set a username so that people can find you!',
        success: '',
      });
    } else {
      onValidationResult({
        error: '',
        success: '',
      });
    }
  };

  const search = React.useRef(debounce((username: string) => {
    // username in state could not be the same as username argument here
    // so dont make a call with previous username
    if (!isUsernameValid(username)) return;

    // username argument here is already validated
    setIsSearching(true);

    // check the db to see if this channel slug exists
    client
      .query({
        query: getUserByUsernameQuery,
        variables: {
          username,
        },
      })
      .then(({ data: { user } }: { data: { user: GetUserType } }) => {
        if (user && user.id) {
          onValidationResult({
            error: 'That username has already been taken.',
            success: '',
            username,
          });
        } else {
          onValidationResult({
            error: '',
            success: 'That username is available!',
            username,
          });
        }
        setIsSearching(false);
      })
      .catch(err => {
        onError && onError(err);
        setIsSearching(false);
      });
  }, 500, false)).current;

  React.useEffect(() => {
    // if no username was able to be suggested, don't kick off a search
    // with an empty string
    if (username.length === 0) return;

    // $FlowIssue
    search(username);
  }, []);

  const handleChange = e => {
    const username = slugg(e.target.value.trim());

    setIsSearching(false);
    setUsername(username);

    if (!isUsernameValid(username)) {
      return notifyParentWithValidationResult(username);
    }

    onValidationResult({
      error: '',
      success: '',
    });

    // $FlowIssue
    return search(username);
  };

  return (
    <React.Fragment>
      <Input
        {...rest}
        size={size}
        defaultValue={username}
        onChange={handleChange}
        dataCy={dataCy}
      >
        {label && label}
        {isSearching && (
          <Loading size={size}>
            <Spinner size={16} color={'brand.default'} />
          </Loading>
        )}
      </Input>
    </React.Fragment>
  );
};

export default compose(
  withApollo,
  connect()
)(UsernameSearch);
