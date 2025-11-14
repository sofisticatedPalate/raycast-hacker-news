// use a third-party dependency to parse the RSS feed: rss-parser
// define our command state as a TypeScript interface
// use React's useEffect hook to parse the RSS feed after the command did mount
// print the top stories to the console
// render a list and show the loading indicator as long as we load the stories

// *** REFACTOR ***
// Added the necessary imports for ActionPanel and Action from 
// raycast/api
// Replaced the simple List component with a fully-featured list that:
// Maps through each story in state.items
// Displays the story title and author
// Shows the publication date in the accessories
// Includes actions to open the story in a browser or copy the URL
// Handles loading and error states
// The list will now show each story with its title, author, and publication date. You can:
// Click on any story to open it in your default browser
// Press Cmd + . to copy the story URL to your clipboard
// The list will show a loading indicator while fetching the stories and handle any errors that might occur during the fetch.

import { List, ActionPanel, Action } from "@raycast/api";
import { useEffect, useState } from "react";
import Parser from "rss-parser";

const parser = new Parser();

interface State {
  items?: Parser.Item[];
  error?: Error;
}

export default function Command() {
  const [state, setState] = useState<State>({});

  useEffect(() => {
    async function fetchStories() {
      try {
        const feed = await parser.parseURL("https://hnrss.org/frontpage?description=0&count=25");
        setState({ items: feed.items });
      } catch (error) {
        setState({
          error: error instanceof Error ? error : new Error("Something went wrong"),
        });
      }
    }

    fetchStories();
  }, []);

  return (
    <List isLoading={!state.items && !state.error}>
      {state.error ? (
        <List.EmptyView
          title="Error loading Hacker News"
          description={state.error.message || String(state.error)}
          icon={Icon.ExclamationMark}
        />
      ) : (
        state.items?.map((item, index) => (
          <List.Item
            key={item.guid || index}
            title={item.title || 'No title'}
            subtitle={item.creator || 'Unknown author'}
            accessories={[
              { text: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : '' },
            ]}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={item.link || ''} />
                <Action.CopyToClipboard
                  title="Copy URL"
                  content={item.link || ''}
                  shortcut={{ modifiers: ["cmd"], key: "." }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
