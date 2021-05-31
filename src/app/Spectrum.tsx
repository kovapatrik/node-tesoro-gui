import { useState, useEffect } from 'react';
import { RGBColor, ChromePicker } from 'react-color';
import { Grid, Segment, Header, Dropdown, Menu, Button, Input } from 'semantic-ui-react';
import TesoroKeyboard from './TesoroKeyboard';
const { ipcRenderer } = window.require("electron");

interface SpectrumState {
    key?: string,
    value?: string,
    text?: string,
    effect?: number,
    keys?: any
};

export default function Spectrum() {

    const [spectrumColor, setSpectrumColor] = useState<RGBColor>({r: 255, g: 0, b: 0});
    const [spectrums, setSpectrums] = useState<SpectrumState[]>([]);
    const [spectrumState, setSpectrumState] = useState<SpectrumState>({});
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [renameField, setRenameField] = useState('');
    const [renameRes, setRenameRes] = useState<boolean|undefined>(undefined);
    const [activeButtons, setActiveButtons] =  useState<{[key: string]: HTMLElement}>({});
    const [disabledSelectColor, setDisabledSelectColor] = useState(true);

    const [layout, setLayout] = useState<any>();

    useEffect(() => {

        async function spectrumConnect() {
            const data = await ipcRenderer.invoke('spectrum connect');
            setLayout(data.layout);
            for (const d of data.spectrums) {
                setSpectrums(prevState => ([
                    ...prevState,
                    {key: d, value: d, text: d}
                ]));
            }
            if (data.spectrumState === undefined) {
                setSpectrumState({key: undefined, value: undefined, text: undefined, effect: undefined, keys: undefined});
            } else {
                setSpectrumState({key: data.spectrumState._id, value: data.spectrumState._id, text: data.spectrumState._id, effect: data.spectrumState.effect, keys: data.spectrumState.keys});
            }   
        }
        spectrumConnect();
    });

    function handleEffectChange(effect: number) {
        setSpectrumState({...spectrumState, effect});
    }

    async function handleChange(data:any) {
        const res = await ipcRenderer.invoke('spectrum change', data.value);
        setSpectrums([]);
        for (const d of res.spectrums) {
            setSpectrums(prevState => ([
                ...prevState,
                {key: d, value: d, text: d}
            ]));
        }
        setSpectrumState({key: res.spectrumState._id, value: res.spectrumState._id, text: res.spectrumState._id, effect: res.spectrumState.effect, keys: res.spectrumState.keys});
        // setCurrentSpectrum(spectrums.find((el) => {return data.value === el.value})!);
    }

    async function handleSpectrumSaveButton() {
        setButtonDisabled(true);
        await ipcRenderer.invoke('spectrum save', {keys: spectrumState!.keys, effect: spectrumState!.effect});
        setButtonDisabled(false);
    }

    async function handleSpectrumSendButton() {
        setButtonDisabled(true);
        await ipcRenderer.invoke('spectrum save', {keys: spectrumState!.keys, effect: spectrumState!.effect});
        await await ipcRenderer.invoke('spectrum send');
        setButtonDisabled(false);
    }

    async function renameSpectrum() {
        setRenameRes(undefined);
        const res = await ipcRenderer.invoke('spectrum rename', renameField);
        setRenameRes(res.error);
        if (!res.error) {
            setSpectrums([]);
            for (const d of res.spectrums) {
                setSpectrums(prevState => ([
                    ...prevState,
                    {key: d, value: d, text: d}
                ]));
            }
            setSpectrumState({key: res.spectrumState._id, value: res.spectrumState._id, text: res.spectrumState._id, effect: res.spectrumState.effect, keys: res.spectrumState.keys});
        }
    }

    async function deleteSpectrum() {
        const res = await ipcRenderer.invoke('spectrum delete');
        setSpectrums([]);
        for (const d of res.spectrums) {
            setSpectrums(prevState => ([
                ...prevState,
                {key: d, value: d, text: d}
            ]));
        }
        if (res.spectrumState === undefined) {
            setSpectrumState({key: undefined, value: undefined, text: undefined, effect: undefined, keys: undefined});
        } else {
            setSpectrumState({key: res.spectrumState._id, value: res.spectrumState._id, text: res.spectrumState._id, effect: res.spectrumState.effect, keys: res.spectrumState.keys});
        }   
    }

    function selectColorFromButton() {
        const el = Object.values(activeButtons)[0];
        const in_color = el.style.backgroundColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        setSpectrumColor({r: parseInt(in_color![1]), g: parseInt(in_color![2]), b: parseInt(in_color![3])})
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
                        <Dropdown allowAdditions search selection options={spectrums} value={spectrumState?.value}
                                  onChange={(_, data) => handleChange(data)}/>
                        <Button onClick={deleteSpectrum} disabled={spectrumState.value === undefined} className={'spectrumProfileButton'}>Delete Spectrum</Button>
                        <br/>
                        <Input className={'renameField'} onChange={(_, d) => setRenameField(d.value)} />
                        <Button onClick={renameSpectrum} disabled={spectrumState.value === undefined} className={'spectrumProfileButton'}>Rename Spectrum</Button>
                        {renameRes !== undefined ?
                            renameRes === false ? 
                                <p>Rename Successful</p>
                            :   <p>Rename Failed</p>
                        : ''
                        }
                    </Segment>
                    <Segment>
                        <Header size='medium'>Spectrum Effect</Header>
                        <Menu compact items={spectrumEffectOptions} onItemClick={(_, d) => handleEffectChange(d.value)} activeIndex={spectrumState.effect}/>
                        {/* activeIndex={currentSpectrum!.effect} */}
                    </Segment>
                    <Segment color='teal' inverted>
                        <Header size='medium'>Spectrum Color</Header>
                        <ChromePicker disableAlpha={true} onChange={(d, _) => setSpectrumColor(d.rgb)} color={spectrumColor} className={'colorPicker'}/>
                        <Button className={'spectrumButton'} onClick={selectColorFromButton} disabled={disabledSelectColor}>Select Current Key Color</Button>
                        <p>You must select only 1 key to use this button</p>
                    </Segment>
                    {spectrumState.keys ?
                        <TesoroKeyboard key={spectrumState.key} color={spectrumColor} disabled={buttonDisabled} layout={layout} 
                                        keys={spectrumState.keys} setSpectrumState={setSpectrumState} activeButtons={activeButtons} setActiveButtons={setActiveButtons} 
                                        setDisabledSelectColor={setDisabledSelectColor}/>
                    : <Segment>
                        <Header size='medium'>Select or add a spectrum profile...</Header>
                      </Segment>
                    }
                    
                    <Segment inverted color='teal'>
                        <Button onClick={handleSpectrumSaveButton} disabled={buttonDisabled || spectrums.length === 0} className={'spectrumButton'}>Save Spectrum Settings</Button>
                        <Button onClick={handleSpectrumSendButton} disabled={buttonDisabled || spectrums.length === 0} className={'spectrumButton'}>Send Spectrum Settings</Button>
                        
                    </Segment>
                </Segment.Group>
            </Segment.Group>
            
        </Grid.Column>
    );
}