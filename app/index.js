({ React, Team, Title, AppContainer, LoadingContainer }) =>
  class TestApp extends React.Component {
    render() {
      return (
        <AppContainer title="mother">
          <LoadingContainer
            recordId="Team"
            // render={team => <Title>{team.length} members!</Title>}
          >
            {team => <Title>{team.length} members!</Title>}
          </LoadingContainer>
        </AppContainer>
      );
    }
  };
