// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { throttle } from 'src/helpers/utils';
import searchThreads from 'shared/graphql/queries/search/searchThreads';
import ThreadFeed from 'src/components/threadFeed';
import { SearchContainer, SearchInput } from '../style';
import type { GetChannelType } from 'shared/graphql/queries/channel/getChannel';

const SearchThreadFeed = compose(searchThreads)(ThreadFeed);

type Props = {
  channel: GetChannelType,
};

const Search = (props: Props) => {
  const { channel } = props;
  const [searchString, setSearchString] = React.useState('');
  const [sendStringToServer, setSendStringToServer] = React.useState('');

  const search = React.useRef(throttle((searchString) => {
    // don't start searching until at least 3 characters are typed
    if (searchString.length < 3) return;

    // start the input loading spinner
    setSendStringToServer(searchString);
  }, 500)).current;

  const handleChange = (e: any) => {
    const searchString = e.target.value.toLowerCase().trim();

    // set the searchstring to state
    setSearchString(searchString);

    // trigger a new search based on the search input
    // $FlowIssue
    search(searchString);
  };

  return (
    <div>
      <SearchContainer>
        <SearchInput
          defaultValue={searchString}
          autoFocus={true}
          type="text"
          placeholder={`Search all threads in ${channel.name}...`}
          onChange={handleChange}
          data-cy="channel-search-input"
        />
      </SearchContainer>
      {searchString && sendStringToServer && (
        <SearchThreadFeed
          search
          viewContext="channelProfile"
          channelId={channel.id}
          queryString={sendStringToServer}
          filter={{ channelId: channel.id }}
          channel={channel}
        />
      )}
    </div>
  );
};

export default compose()(Search);
