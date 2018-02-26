({
  React,
  Text,
  Platform,
  _npm_remarkable,
  _npm_react_native_markdown_renderer,
}) => {
  if (_npm_remarkable) {
    const Remarkable = _npm_remarkable;
    const md = new Remarkable("commonmark");
    class WebMarkdown extends React.PureComponent {
      render() {
        return (
          <div
            dangerouslySetInnerHTML={{ __html: md.render(this.props.content) }}
          />
        );
      }
    }
    return WebMarkdown;
  }
  if (_npm_react_native_markdown_renderer) {
    const Markdown = _npm_react_native_markdown_renderer.default;

    return ({ content }) => <Markdown>{content}</Markdown>;
  }

  return ({ content }) => <Text>{content}</Text>;
};
