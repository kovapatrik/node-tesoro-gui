import React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import Profile from './Profile';
import Spectrum from './Spectrum';

export default function App() {
  
  return (
    <div>
      <Header size='huge'>Tesoro GRAM SE Spectrum GUI</Header>
      <Grid>
        <Grid.Row columns={2} stretched>
          <Profile/>
          <Spectrum/>
        </Grid.Row>
        
        {/* <Grid.Row stretched centered>
          <TesoroKeyboard socket={socket}/>
        </Grid.Row> */}
      </Grid>
    </div>
  );
}