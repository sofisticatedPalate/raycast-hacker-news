import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import Parser from "rss-parser";

// RSS parser instance for fetching Hacker News stories
const parser = new Parser();

// TypeScript interface defining the command's state structure
interface State {
  items?: Parser.Item[];  // Array of parsed RSS items (stories)
  error?: Error;          // Error state if fetching fails
}

export default function Command() {
  const [state, setState] = useState<State>({});

  // useEffect hook to fetch RSS feed after component mounts
  useEffect(() => {
    async function fetchStories() {
      try {
        // Fetch and parse Hacker News RSS feed (25 stories, no descriptions)
        const feed = await parser.parseURL("https://hnrss.org/frontpage?description=0&count=25");
        setState({ items: feed.items });
      } catch (error) {
        // Handle any errors during fetch and update error state
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
        // Error view displayed when RSS fetch fails
        <List.EmptyView
          title="Error loading Hacker News"
          description={state.error.message || String(state.error)}
          icon={Icon.ExclamationMark}
        />
      ) : (
        // Map through stories and render each as a list item
        state.items?.map((item, index) => (
          <List.Item
            key={item.guid || index}
            title={item.title || 'No title'}
            subtitle={item.creator || 'Unknown author'}
            accessories={[
              { text: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : '' },
            ]}
            actions={
              // Action panel with options to open story or copy URL
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
