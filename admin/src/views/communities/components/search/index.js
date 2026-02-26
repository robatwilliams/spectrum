import React, { useState, useEffect, useRef } from 'react';
import { findDOMNode } from 'react-dom';
import compose from 'recompose/compose';
import pure from 'recompose/pure';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router';
import { ESC, BACKSPACE, ARROW_DOWN, ARROW_UP } from 'src/helpers/keycodes';
import { Spinner } from '../../../../components/globals';
import { throttle } from '../../../../helpers/utils';
import { SEARCH_COMMUNITIES_QUERY } from '../../../../api/queries';
import { ENTER } from 'src/helpers/keycodes';
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

const Search = (props) => {
  const [searchString, setSearchString] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchIsLoading, setSearchIsLoading] = useState(false);
  const [focusedSearchResult, setFocusedSearchResult] = useState('');
  const inputRef = useRef(null);

  const search = useRef(
    throttle((string: string) => {
      const { client } = props;

      setSearchIsLoading(true);

      client
        .query({
          query: SEARCH_COMMUNITIES_QUERY,
          variables: {
            queryString: string,
            type: 'COMMUNITIES',
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
    }, 200)
  ).current;

  const handleKeyPress = (e: any) => {
    // create a reference to the input - we will use this to call .focus()
    // after certain events (like pressing backspace or enter)
    const input = findDOMNode(inputRef.current);

    // create temporary arrays of IDs from the searchResults and selectedUsers
    // to more easily manipulate the ids
    const searchResultIds = searchResults && searchResults.map(user => user.id);

    const indexOfFocusedSearchResult = searchResultIds.indexOf(
      focusedSearchResult
    );

    // if person presses esc, clear all results, stop loading
    if (e.keyCode === ESC) {
      setSearchResults([]);
      setSearchIsLoading(false);

      return;
    }

    if (e.keyCode === BACKSPACE) {
      if (searchString.length > 0) return;
      return input && input.focus();
    }

    if (e.keyCode === ESC) {
      setSearchResults([]);
      setSearchIsLoading(false);

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
      return goToCommunity(searchResults[indexOfFocusedSearchResult].slug);
    }
  };

  const goToCommunity = slug => {
    const { history } = props;
    setSearchResults([]);
    setSearchIsLoading(false);
    setFocusedSearchResult('');
    setSearchString('');
    return history.push(`/communities/${slug}`);
  };

  const handleChange = (e: any) => {
    const string = e.target.value.toLowerCase().trim();

    setSearchString(e.target.value);

    search(string);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress, false);

    return () => {
      document.removeEventListener('keydown', handleKeyPress, false);
    };
  }, [searchString, searchResults, focusedSearchResult]);

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
        placeholder="Search for communities..."
        onChange={handleChange}
        autoFocus={true}
      />

      {// user has typed in a search string
      searchString && (
        //if there are selected users already, we manually shift
        // the search results position down
        <SearchResultsDropdown>
          {searchResults.length > 0 &&
            searchResults.map(community => {
              return (
                <SearchResult
                  focused={focusedSearchResult === community.id}
                  key={community.id}
                  onClick={() => goToCommunity(community.slug)}
                >
                  <SearchResultImage
                    isOnline={community.isOnline}
                    size={32}
                    radius={8}
                    src={community.profilePhoto}
                  />
                  <SearchResultTextContainer>
                    <SearchResultDisplayName>
                      {community.name}
                    </SearchResultDisplayName>
                    {community.metaData && (
                      <SearchResultUsername>
                        {community.metaData.members} members
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
                  No communities found matching "{searchString}"
                </SearchResultNull>
              </SearchResultTextContainer>
            </SearchResult>
          )}
        </SearchResultsDropdown>
      )}
    </ComposerInputWrapper>
  );
};

export default compose(withApollo, withRouter, connect(), pure)(Search);
