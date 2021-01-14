import React, {useEffect} from 'react';
import {Grid, Header, Button} from 'semantic-ui-react';

function App() {

  useEffect(() => {

  }, [])

  async function handleButton() {
    await fetch('/api/test');
  }
  
  return (
    <Grid>
      <Grid.Row stretched>
        <Header size='huge'>Tesoro GRAM SE Spektrum GUI</Header>
      </Grid.Row>
      <Grid.Row columns={2} divided stretched>
        <Grid.Column width={10} color="grey">
          Profile Settings
          <Button onClick={handleButton}>

          </Button>
        </Grid.Column>
        <Grid.Column width={6} color="blue">
          About
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={2} divided stretched>
        <Grid.Column width={6} color="red">
          Spectrum Settings
        </Grid.Column>
        <Grid.Column width={10} color="green">
          Keyboard Layout
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

export default App;
