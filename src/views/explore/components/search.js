// @flow
import * as React from 'react';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { Link } from 'react-router-dom';
import { Button } from 'src/components/button';
import { debounce } from 'src/helpers/utils';
import { searchCommunitiesQuery } from 'shared/graphql/queries/search/searchCommunities';
import type { SearchCommunitiesType } from 'shared/graphql/queries/search/searchCommunities';
import { Spinner } from 'src/components/globals';
import { addToastWithTimeout } from 'src/actions/toasts';
import OutsideClickHandler from 'src/components/outsideClickHandler';
import { ESC, ENTER, ARROW_DOWN, ARROW_UP } from 'src/helpers/keycodes';
import {
  SearchWrapper,
  SearchInput,
  SearchInputWrapper,
  SearchSpinnerContainer,
  SearchResultsDropdown,
  SearchResult,
  SearchResultTextContainer,
  SearchResultNull,
  SearchResultImage,
  SearchResultMetaWrapper,
  SearchResultName,
  SearchResultMetadata,
  SearchLink,
  SearchIcon,
} from '../style';

type Props = {
  client: Object,
  history: Object,
  dispatch: Dispatch<Object>,
};

const Search = (props: Props) => {
  const { client, history, dispatch } = props;
  const [searchString, setSearchString] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchIsLoading, setSearchIsLoading] = React.useState(false);
  const [focusedSearchResult, setFocusedSearchResult] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(true);
  const inputRef = React.useRef(null);

  const search = React.useRef(
    debounce(
      (searchString: string) => {
        if (!searchString || searchString.length === 0) return;

        // start the input loading spinner
        setSearchIsLoading(true);

        // trigger the query
        client
          .query({
            query: searchCommunitiesQuery,
            variables: { queryString: searchString, type: 'COMMUNITIES' },
          })
          .then(
            ({
              data: { search },
            }: {
              data: { search: SearchCommunitiesType },
            }) => {
              if (
                !search ||
                !search.searchResultsConnection ||
                search.searchResultsConnection.edges.length === 0
              ) {
                setSearchResults([]);
                setSearchIsLoading(false);
                setFocusedSearchResult('');
                return;
              }

              const results = search.searchResultsConnection.edges;

              const sorted = results
                .slice()
                .map(c => c && c.node)
                .sort((a, b) => {
                  if (!b) return 0;
                  if (!a) return 0;
                  return b.metaData.members - a.metaData.members;
                });

              setSearchResults(sorted);
              setSearchIsLoading(false);
              setFocusedSearchResult(sorted && sorted[0] ? sorted[0].id : null);
            }
          )
          .catch(err => dispatch(addToastWithTimeout('error', err.message)));
      },
      500,
      false
    )
  );

  const handleKeyPress = (e: any) => {
    const input = inputRef.current;
    const searchResultIds =
      searchResults && searchResults.map(community => community.id);
    const indexOfFocusedSearchResult = searchResultIds.indexOf(
      focusedSearchResult
    );

    // if person presses escape
    if (e.keyCode === ESC) {
      setIsFocused(false);

      // $FlowFixMe
      input && input.focus();
      return;
    }

    if (e.keyCode === ENTER) {
      if (
        searchResults.length === 0 ||
        searchResults[indexOfFocusedSearchResult] === undefined
      )
        return;
      const slug = searchResults[indexOfFocusedSearchResult].slug;
      history.push(`/${slug}`);
      return;
    }

    if (e.keyCode === ARROW_DOWN) {
      if (indexOfFocusedSearchResult === searchResults.length - 1) return;
      if (searchResults.length <= 1) return;

      const resultToFocus = searchResults[indexOfFocusedSearchResult + 1];
      if (!resultToFocus) return;

      setFocusedSearchResult(resultToFocus.id);
      return;
    }

    if (e.keyCode === ARROW_UP) {
      if (indexOfFocusedSearchResult === 0) return;
      if (searchResults.length <= 1) return;

      const resultToFocus = searchResults[indexOfFocusedSearchResult - 1];
      if (!resultToFocus) return;

      setFocusedSearchResult(resultToFocus.id);
      return;
    }
  };

  const handleChange = (e: any) => {
    const string = e.target.value.toLowerCase().trim();

    if (e.target.value.length === 0) {
      setSearchIsLoading(false);
      setSearchString('');
      return;
    }

    // set the searchstring to state
    setSearchString(e.target.value);
    setSearchIsLoading(true);

    // trigger a new search based on the search input
    // $FlowIssue
    search.current(string);
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress, false);

    return () => {
      document.removeEventListener('keydown', handleKeyPress, false);
    };
  });

  const onFocus = (e: any) => {
    const val = e.target.value;
    if (!val || val.length === 0) return;

    const string = val.toLowerCase().trim();

    // $FlowIssue
    search.current(string);

    setIsFocused(true);
  };

  const hideSearchResults = () => {
    setIsFocused(false);
  };

  return (
    <SearchWrapper>
      {searchIsLoading && (
        <SearchSpinnerContainer>
          <Spinner size={16} color={'brand.default'} />
        </SearchSpinnerContainer>
      )}
      <SearchInputWrapper>
        <SearchIcon glyph="search" onClick={onFocus} />
        <SearchInput
          data-cy="explore-community-search-input"
          ref={inputRef}
          type="text"
          value={searchString}
          placeholder="Search for communities or topics..."
          onChange={handleChange}
          onFocus={onFocus}
        />
      </SearchInputWrapper>

      {// user has typed in a search string
      isFocused && searchString && (
        <OutsideClickHandler onOutsideClick={hideSearchResults}>
          <SearchResultsDropdown>
            {searchResults.length > 0 &&
              !searchIsLoading &&
              searchResults.map(community => {
                return (
                  <SearchResult
                    focused={focusedSearchResult === community.id}
                    key={community.id}
                  >
                    <SearchLink to={`/${community.slug}`}>
                      <SearchResultImage
                        community={community}
                        showHoverProfile={false}
                      />
                      <SearchResultTextContainer>
                        <SearchResultMetaWrapper>
                          <SearchResultName>{community.name}</SearchResultName>
                          {community.metaData && (
                            <SearchResultMetadata>
                              {community.metaData.members.toLocaleString()}{' '}
                              members
                            </SearchResultMetadata>
                          )}
                        </SearchResultMetaWrapper>
                      </SearchResultTextContainer>
                    </SearchLink>
                  </SearchResult>
                );
              })}

            {searchResults.length === 0 && !searchIsLoading && isFocused && (
              <SearchResult>
                <SearchResultTextContainer>
                  <SearchResultNull>
                    <p>No communities found matching “{searchString}”</p>
                    <Link to={'/new/community'}>
                      <Button>Create a Community</Button>
                    </Link>
                  </SearchResultNull>
                </SearchResultTextContainer>
              </SearchResult>
            )}

            {searchIsLoading && isFocused && (
              <SearchResult>
                <SearchResultTextContainer>
                  <SearchResultNull>
                    <p>Searching for “{searchString}”</p>
                  </SearchResultNull>
                </SearchResultTextContainer>
              </SearchResult>
            )}
          </SearchResultsDropdown>
        </OutsideClickHandler>
      )}
    </SearchWrapper>
  );
};

export default compose(
  connect(),
  withApollo,
  withRouter
)(Search);
