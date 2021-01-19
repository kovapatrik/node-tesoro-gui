import React, {useEffect, useState} from 'react';
import {Grid, Header, Button, Menu, Dropdown, Segment} from 'semantic-ui-react';
import {ChromePicker} from 'react-color';
import InputRange from 'react-input-range';
import {io} from 'socket.io-client';

const socket = io('/');

function App() {

  const [profileState, setProfileState] = useState({_id: 0, r: 0, g: 0, b:0, effect: 0, effect_color: 0, brightness: 0})
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const alpha = 1;
  useEffect(() => {
    socket.on('profile server', async(data:any) => {
      setProfileState(data);
    });
  }, [])

  function handleProfileSendButton() {
    setButtonDisabled(true);
    socket.emit('profile save', profileState, () => {
      socket.emit('profile send', {}, () => {
        setButtonDisabled(false);
      });
    });
  }

  function handleProfileSaveButton() {
    setButtonDisabled(true);
    socket.emit('profile save', profileState, () => {
        setButtonDisabled(false);
    });
  }

  function handleProfileChanges(name : string, data: any) {
    if (name === '_id') {
      socket.emit('profile change', data, (res:any) => {
        setProfileState(res.profile);
      });
    } else {
      if (name === 'color') {
        setProfileState({...profileState, r: data.r, g: data.g, b: data.b});
      } else {
        setProfileState({...profileState, ...{[name]: data}});
      }
    }
  }

  const profileNumOptions = [
    { key: 1, content: 'Profile 1', value: 1},
    { key: 2, content: 'Profile 2', value: 2},
    { key: 3, content: 'Profile 3', value: 3},
    { key: 4, content: 'Profile 4', value: 4},
    { key: 5, content: 'Profile 5', value: 5},
    { key: 6, content: 'PC', value: 6},
  ]

  const profileEffectOptions = [
    {key: 0, text: 'Standard', value: 0},
    {key: 1, text: 'Trigger', value: 1},
    {key: 2, text: 'Ripple', value: 2},
    {key: 3, text: 'Firework', value: 3},
    {key: 4, text: 'Radiation', value: 4},
    {key: 5, text: 'Breathing', value: 5},
    {key: 6, text: 'Wave', value: 6},
    {key: 7, text: 'Spectrum', value: 7},
    {key: 8, text: 'RECL1', value: 8},
    {key: 9, text: 'RECL2', value: 9},
  ]

  const profileEffectColorOptions = [
    {key: 0, text: 'Static', value: 0},
    {key: 1, text: 'Cycle', value: 1},
  ]
  
  return (
    <div>
      <Header size='huge'>Tesoro GRAM SE Spectrum GUI</Header>
      <Grid>
        <Grid.Row columns={2} divided>
          <Grid.Column width={10}>
            <Segment.Group>
              <Segment color='purple'><Header size='large'>Profile Settings</Header></Segment>
              <Segment.Group>
                <Segment color='purple' inverted>
                  <Header size='medium'>Profile Number</Header>
                  <Menu compact items={profileNumOptions} activeIndex={profileState._id-1}  onItemClick={(_, d) => handleProfileChanges('_id', d.value)}/>
                </Segment>
                <Segment>
                  <Header size='medium'>Profile Effect</Header>
                  <Dropdown options={profileEffectOptions} selection value={profileState.effect} onChange={(_, d) => handleProfileChanges('effect', d.value)}></Dropdown>
                </Segment>
                <Segment color='purple' inverted>
                  <Header size='medium'>Profile Effect Color</Header>
                  <Dropdown options={profileEffectColorOptions} selection value={profileState.effect_color} onChange={(_, d) => handleProfileChanges('effect_color', d.value)}></Dropdown>
                </Segment>
                <Segment>
                  <Header size='medium'>Profile Brightness</Header>
                  <InputRange minValue={0} maxValue={4} formatLabel={value => `${value*25}`} value={profileState.brightness} onChange={(value) => handleProfileChanges('brightness', value)}/>
                </Segment>
                <Segment color='purple' inverted>
                  <Header size='medium'>Profile Color</Header>
                  <ChromePicker onChange={(d, _) => handleProfileChanges('color', d.rgb)} onChangeComplete={(d, _) => handleProfileChanges('color', d.rgb)} color={{r: profileState.r, g: profileState.g, b: profileState.b, a: alpha}}/>
                </Segment>
                <Segment>
                  <Button color='purple' onClick={handleProfileSaveButton} disabled={buttonDisabled}>Save Profile Settings</Button>
                  <Button color='purple' onClick={handleProfileSendButton} disabled={buttonDisabled}>Send Profile Settings</Button>
                </Segment>
              </Segment.Group>
            </Segment.Group>
          </Grid.Column>
          <Grid.Column width={6} color="blue">
            About
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2} divided>
          <Grid.Column width={6} color="red">
            Spectrum Settings
          </Grid.Column>
          <Grid.Column width={10} color="green">
            Keyboard Layout
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
}

export default App;
