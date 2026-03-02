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

  const searchRef = React.useRef(
    throttle((str: string) => {
      // don't start searching until at least 3 characters are typed
      if (str.length < 3) return;

      // start the input loading spinner
      setSendStringToServer(str);
    }, 500)
  );

  const handleChange = (e: any) => {
    const str = e.target.value.toLowerCase().trim();

    // set the searchstring to state
    setSearchString(str);

    // trigger a new search based on the search input
    // $FlowIssue
    searchRef.current(str);
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
