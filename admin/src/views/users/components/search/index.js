// @flow
import * as React from 'react';
import { findDOMNode } from 'react-dom';
import compose from 'recompose/compose';
import pure from 'recompose/pure';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router';
import {
  ESC,
  BACKSPACE,
  ENTER,
  ARROW_DOWN,
  ARROW_UP,
} from 'src/helpers/keycodes';
import { Spinner } from '../../../../components/globals';
import { throttle } from '../../../../helpers/utils';
import { searchUsersQuery } from 'shared/graphql/queries/search/searchUsers';
import {
  ComposerInputWrapper,
  SearchSpinnerContainer,
  ComposerInput,
  SearchResultsDropdown,
  SearchResult,
  SearchResultNull,
  SearchResultUsername,
  SearchResultDisplayName,
  SearchResultTextContainer,
  SearchResultImage,
} from './style';

type State = {
  searchString: string,
  searchResults: Array<any>,
  searchIsLoading: boolean,
  focusedSearchResult: string,
};

type Props = {
  client: Object,
  history: Object,
};

const Search = (props: Props) => {
  const { client, history } = props;

  const [searchString, setSearchString] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchIsLoading, setSearchIsLoading] = React.useState(false);
  const [focusedSearchResult, setFocusedSearchResult] = React.useState('');

  const inputRef = React.useRef(null);

  const search = React.useMemo(() => {
    const searchFn = (queryString: string) => {
      setSearchIsLoading(true);

      client
        .query({
          query: searchUsersQuery,
          variables: {
            queryString,
            type: 'USERS',
          },
        })
        .then(({ data: { search } }) => {
          const hasSearchResults =
            search &&
            search.searchResultsConnection &&
            search.searchResultsConnection.edges.length > 0;
          if (!hasSearchResults) {
            setSearchResults([]);
            setSearchIsLoading(false);
            setFocusedSearchResult('');
            return;
          }

          const searchResults = search.searchResultsConnection.edges.map(
            e => e.node
          );

          setSearchResults(searchResults);
          setSearchIsLoading(false);
          setFocusedSearchResult(searchResults[0]);
        });
    };

    // only kick off search query every 200ms
    return throttle(searchFn, 200);
  }, [client]);

  const goToUser = (username) => {
    setSearchResults([]);
    setSearchIsLoading(false);
    setFocusedSearchResult('');
    setSearchString('');
    return history.push(`/users/${username}`);
  };

  const handleKeyPress = React.useCallback((e: any) => {
    // create a reference to the input - we will use this to call .focus()
    // after certain events (like pressing backspace or enter)
    const input = findDOMNode(inputRef.current);

    // create temporary arrays of IDs from the searchResults and selectedUsers
    // to more easily manipulate the ids
    const searchResultIds = searchResults && searchResults.map(user => user.id);

    const indexOfFocusedSearchResult = searchResultIds.indexOf(
      focusedSearchResult
    );

    if (e.keyCode === ESC) {
      setSearchResults([]);
      setSearchIsLoading(false);

      return;
    }

    if (e.keyCode === BACKSPACE) {
      if (searchString.length > 0) return;
      // $FlowFixMe
      return input && input.focus();
    }

    if (e.keyCode === ESC) {
      setSearchResults([]);
      setSearchIsLoading(false);

      // $FlowFixMe
      return input && input.focus();
    }

    if (e.keyCode === ARROW_DOWN) {
      if (indexOfFocusedSearchResult === searchResults.length - 1) return;
      if (searchResults.length === 1) return;

      // 2
      setFocusedSearchResult(searchResults[indexOfFocusedSearchResult + 1].id);

      return;
    }

    if (e.keyCode === ARROW_UP) {
      // 1
      if (indexOfFocusedSearchResult === 0) return;
      if (searchResults.length === 1) return;

      // 2
      setFocusedSearchResult(searchResults[indexOfFocusedSearchResult - 1].id);

      return;
    }

    if (e.keyCode === ENTER) {
      if (!searchResults[indexOfFocusedSearchResult]) return;
      return goToUser(searchResults[indexOfFocusedSearchResult].username);
    }
  }, [searchString, searchResults, focusedSearchResult]);

  const handleChange = (e: any) => {
    const string = e.target.value.toLowerCase().trim();

    setSearchString(e.target.value);

    search(string);
  };

  React.useEffect(() => {
    document.removeEventListener('keydown', handleKeyPress, false);
  }, []);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress, false);

    return () => {
      document.removeEventListener('keydown', handleKeyPress, false);
    };
  }, [handleKeyPress]);

  return (
    <ComposerInputWrapper>
      {searchIsLoading && (
        <SearchSpinnerContainer>
          <Spinner size={16} color={'brand.default'} />
        </SearchSpinnerContainer>
      )}

      <ComposerInput
        ref={inputRef}
        type="text"
        value={searchString}
        placeholder="Search for people..."
        onChange={handleChange}
        autoFocus={true}
      />

      {// user has typed in a search string
      searchString && (
        //if there are selected users already, we manually shift
        // the search results position down
        <SearchResultsDropdown>
          {searchResults.length > 0 &&
            searchResults.map(user => {
              return (
                <SearchResult
                  focused={focusedSearchResult === user.id}
                  key={user.id}
                  onClick={() => goToUser(user.username)}
                >
                  <SearchResultImage
                    isOnline={user.isOnline}
                    size={32}
                    radius={32}
                    src={user.profilePhoto}
                  />
                  <SearchResultTextContainer>
                    <SearchResultDisplayName>
                      {user.name}
                    </SearchResultDisplayName>
                    {user.username && (
                      <SearchResultUsername>
                        @{user.username}
                      </SearchResultUsername>
                    )}
                  </SearchResultTextContainer>
                </SearchResult>
              );
            })}

          {searchResults.length === 0 && (
            <SearchResult>
              <SearchResultTextContainer>
                <SearchResultNull>
                  No users found matching "{searchString}"
                </SearchResultNull>
              </SearchResultTextContainer>
            </SearchResult>
          )}
        </SearchResultsDropdown>
      )}
    </ComposerInputWrapper>
  );
}

export default compose(
  withApollo,
  withRouter,
  connect(),
  pure
)(Search);
