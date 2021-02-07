import { useState, useEffect } from 'react';
import { RGBColor, ChromePicker } from 'react-color';
import { Grid, Segment, Header, Dropdown, Menu, Button} from 'semantic-ui-react';
import TesoroKeyboard from './TesoroKeyboard';

import socket from 'socket.io-client'

interface SpectrumState {
    key?: string,
    value?: string,
    text?: string,
    effect?: number,
    keys?: any
};

export default function Spectrum({socket} : {socket : socket.Socket}) {

    const [spectrumColor, setSpectrumColor] = useState<RGBColor>({r: 255, g: 0, b: 0});
    const [spectrums, setSpectrums] = useState<SpectrumState[]>([]);
    const [spectrumState, setSpectrumState] = useState<SpectrumState>({value: ' '});
    const [buttonDisabled, setButtonDisabled] = useState(false)

    const [layout, setLayout] = useState<any>();

    useEffect(() => {

        socket.on('spectrum server', (data:any) => {
            setLayout(data.layout);
            for (const d of data.spectrums) {
                setSpectrums(prevState => ([
                    ...prevState,
                    {key: d, value: d, text: d}
                ]));
            }
            setSpectrumState({key: data.spectrumState._id, value: data.spectrumState._id, text: data.spectrumState._id, effect: data.spectrumState.effect, keys: data.spectrumState.keys});
        });
    })

    function handleEffectChange(effect: number) {
        setSpectrumState({...spectrumState, effect});
    }

    function handleChange(data:any) {
        socket.emit('spectrum change', data.value, (res:any) => {
            setSpectrums([]);
            for (const d of res.spectrums) {
                setSpectrums(prevState => ([
                    ...prevState,
                    {key: d, value: d, text: d}
                ]));
            }
            setSpectrumState({key: res.spectrumState._id, value: res.spectrumState._id, text: res.spectrumState._id, effect: res.spectrumState.effect, keys: res.spectrumState.keys});
        });
        // setCurrentSpectrum(spectrums.find((el) => {return data.value === el.value})!);
    }

    function handleSpectrumSaveButton() {
        setButtonDisabled(true);
        socket.emit('spectrum save', {keys: spectrumState!.keys, effect: spectrumState!.effect}, () => {
            setButtonDisabled(false);
        })
    }

    function handleSpectrumSendButton() {
        setButtonDisabled(true);
        socket.emit('spectrum save', {keys: spectrumState!.keys, effect: spectrumState!.effect}, () => {
            socket.emit('spectrum send', {}, () => {
                setButtonDisabled(false);
            });
        });
    }

    const spectrumEffectOptions = [
        { key: 0, content: 'Standard', value: 0 },
        { key: 1, content: 'Breathing', value: 1 },
        { key: 2, content: 'Trigger', value: 2 },
    ];

    return (
        <Grid.Column width={10}>
            <Segment.Group>
                <Segment color='teal'><Header size='large'>Spectrum Settings</Header></Segment>
                <Segment.Group>
                    <Segment color='teal' inverted>
                        <Header size='medium'>Spectrum Layout</Header>
                        <Dropdown allowAdditions search selection options={spectrums} value={spectrumState.value}
                                  onChange={(_, data) => handleChange(data)}/>
                    </Segment>
                    <Segment>
                        <Header size='medium'>Spectrum Effect</Header>
                        <Menu compact items={spectrumEffectOptions}  onItemClick={(_, d) => handleEffectChange(d.value)} activeIndex={spectrumState.effect}/>
                        {/* activeIndex={currentSpectrum!.effect} */}
                    </Segment>
                    <Segment color='teal' inverted>
                        <Header size='medium'>Spectrum Color</Header>
                        <ChromePicker disableAlpha={true} onChange={(d, _) => setSpectrumColor(d.rgb)} color={spectrumColor}/>
                    </Segment>
                    {spectrumState.keys ?
                        <TesoroKeyboard key={spectrumState.key} color={spectrumColor} disabled={buttonDisabled} layout={layout} keys={spectrumState.keys} setSpectrumState={setSpectrumState}/>
                    : <Segment>
                        <Header size='medium'>Select a spectrum...</Header>
                      </Segment>
                    }
                    
                    <Segment inverted color='teal'>
                        <Button onClick={handleSpectrumSaveButton} disabled={buttonDisabled} className={'spectrumButton'}>Save Spectrum Settings</Button>
                        <Button onClick={handleSpectrumSendButton} disabled={buttonDisabled} className={'spectrumButton'}>Send Spectrum Settings</Button>
                        
                    </Segment>
                </Segment.Group>
            </Segment.Group>
            
        </Grid.Column>
    );
}