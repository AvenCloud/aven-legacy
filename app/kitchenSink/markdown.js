({ React, Page, Markdown }) => {
  class MarkdownExample extends React.Component {
    static title = "Markdown";
    render() {
      return (
        <Page title="Markdown">
          <Markdown
            content={`
    # Aven Framework
    ## [Open source on GitHub](https://github.com/AvenDevelopment/aven)
    
    ![Aven Cloud](https://github.com/AvenCloud/aven/raw/master/graphics/AvenLogo.png)
  
    An opinionated attempt to make applications dramatically easier to develop and deploy. Use JS and React to target all platforms, update code and application data using the same real-time database.
  
    ## A Full Stack ReactJS Framework
  
    - Use SQLite backend in development, and PostgreSQL in production
    - Depends on NodeJS, React, React Native, Babel
    - Universal caching layer designed to make apps fast by default
    - Simple realtime database with smart cache and offline client functionality
    - Full Authentication and permission system
    - Simple module system
    - Use one JavaScript codebase for:
        - Backend logic
        - Server-rendered React sites
        - Client React apps and PWAs
        - React Native apps on iOS and Android
  

    ## Examples

        `}
          />
        </Page>
      );
    }
  }

  return MarkdownExample;
};
