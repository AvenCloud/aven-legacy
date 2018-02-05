({ React, Team, Title }) => {
  class TestApp extends React.Component {
    render() {
      return (
        <html>
          <head>
            <title>Aven</title>
            <script
              type="text/javascript"
              dangerouslySetInnerHTML={{ __html: `//alert('hi')` }}
            />
          </head>
          <body>
            <Title>Hello2!</Title>
          </body>
        </html>
      );
    }
  }

  return TestApp;
};
