import React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import {io} from 'socket.io-client';
import Profile from './Profile';
import Spectrum from './Spectrum';

const socket = io('/');

export default function App() {
  
  return (
    <div>
      <Header size='huge'>Tesoro GRAM SE Spectrum GUI</Header>
      <Grid>
        <Grid.Row columns={2} stretched>
          <Profile socket={socket}/>
          <Spectrum socket={socket}/>
        </Grid.Row>
        
        {/* <Grid.Row stretched centered>
          <TesoroKeyboard socket={socket}/>
        </Grid.Row> */}
      </Grid>
    </div>
  );
}