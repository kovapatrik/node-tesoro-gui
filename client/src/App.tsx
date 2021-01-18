import React, {SyntheticEvent, useEffect, useState} from 'react';
import {Grid, Header, Button, Menu, Dropdown, Segment, GridColumn} from 'semantic-ui-react';
import {ChromePicker} from 'react-color';
import InputRange from 'react-input-range';


function App() {

  const [profileState, setProfileState] = useState({profile_num: 0, r: 0, g: 0, b:0, effect: 0, effect_color: 0, brightness: 0})
  const alpha = 1;
  useEffect(() => {
    getProfile();
  }, [])

  async function getProfile() {
    const response = await fetch('/get/profile');
    const data = await response.json();
    setProfileState(data.profile);
  }
  async function handleProfileSendButton() {
    await handleProfileSaveButton();
    await fetch('/send/profile');
  }

  async function handleProfileSaveButton() {
    await fetch('/save/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileState)
    });
  }

  async function handleChangeProfileOnly() {
    await fetch('/change/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({profile_num: profileState.profile_num})
    });
  }

  async function handleProfileChanges(name : string, data: any) {
    if (name == 'color') {
      setProfileState({...profileState, r: data.r, g: data.g, b: data.b});
    } else {
      setProfileState({...profileState, ...{[name]: data}});
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
                  <Menu compact items={profileNumOptions} activeIndex={profileState.profile_num-1}  onItemClick={(_, d) => handleProfileChanges('profile_num', d.value)}/>
                  <Button floated='right' onClick={handleChangeProfileOnly}>Change Profile Only</Button>
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
                  <Button color='purple' onClick={handleProfileSaveButton}>Save Profile Settings</Button>
                  <Button color='purple' onClick={handleProfileSendButton}>Send Profile Settings</Button>
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
