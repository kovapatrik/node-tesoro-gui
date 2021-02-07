import { useState } from 'react';
import { Button, Segment } from 'semantic-ui-react';
import Keyboard, { KeyboardOptions } from 'react-simple-keyboard';
import { RGBColor } from 'react-color';

export default function TesoroKeyboard({color, layout, keys, setSpectrumState, disabled} : {color: RGBColor, layout: any, keys: any, setSpectrumState: Function, disabled: boolean}) {

    const [buttonContainer, setButtonContainer] = useState<{[key: string]: HTMLElement}>({});
    const [activeButtons, setActiveButtons] =  useState<{[key: string]: HTMLElement}>({});

    // Button functions

    function setKeyColor() {

        if (color.r === 0 && color.g === 0 && color.b === 0) {
            clearSelected();
        } else {
            let in_keys = keys;
            for (const [key, el] of Object.entries(activeButtons)) {
                    el.style.backgroundColor = `rgb(${color.r},${color.g},${color.b})`;
                    el.style.opacity = '1';
                    el.style.boxShadow = `inset 0px 0px 0px 2px ${getContrast()})}`;
                    el.style.color = getContrast();
                    in_keys[key].r = color.r;
                    in_keys[key].g = color.g;
                    in_keys[key].b = color.b;
            }
            setSpectrumState((prevState:any) => ({
                ...prevState,
                keys: in_keys
            }))
        }
    }

    function toggleSelectButton(btn:string) {
        let in_change = activeButtons;
        const el = buttonContainer[btn];
        const in_color = el.style.backgroundColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (Object.keys(in_change).includes(btn)) {
            el.style.boxShadow = '';
            delete in_change[btn];
        } else {
            el.style.boxShadow = `inset 0px 0px 0px 2px ${getContrast({r:parseInt(in_color![1]), g: parseInt(in_color![2]), b: parseInt(in_color![3])})}`;
            in_change[btn] = el;
        }
        setActiveButtons(in_change);
    }

    function selectAll() {
        for (const el of Object.values(buttonContainer)) {
            const in_color = el.style.backgroundColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            el.style.boxShadow = `inset 0px 0px 0px 2px ${getContrast({r:parseInt(in_color![1]), g: parseInt(in_color![2]), b: parseInt(in_color![3])})}`;
        }
        setActiveButtons(buttonContainer);
    }

    function deselectAll() {
        for (const el of Object.values(buttonContainer)) {
            el.style.boxShadow = '';
        }
        setActiveButtons({});
    }

    function invertSelection() {
        let newActives : { [key: string]: HTMLElement } = {};
        const activeKeys = Object.keys(activeButtons);
        for (const [key, el] of Object.entries(buttonContainer)) {
            if (activeKeys.includes(key)) {
                el.style.boxShadow = '';
            } else {
                const in_color = el.style.backgroundColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                el.style.boxShadow = `inset 0px 0px 0px 2px ${getContrast({r:parseInt(in_color![1]), g: parseInt(in_color![2]), b: parseInt(in_color![3])})}`;
                newActives[key] = el;
            }
        }
        setActiveButtons(newActives);
    }

    function clearSelected() {

        let in_keys = keys;

        for (const [key, el] of Object.entries(activeButtons)) {
            console.log(key);
            el.style.backgroundColor = 'rgb(255,255,255)';
            el.style.color = 'rgb(0,0,0)';
            el.style.opacity = '0.4';

            in_keys[key].r = 0;
            in_keys[key].g = 0;
            in_keys[key].b = 0;
        }

        setSpectrumState((prevState:any) => ({
            ...prevState,
            keys: in_keys
        }))
    }

    // Helper functions

    function convertBtnText(btn:string) {
        const lhs = ["{numpadsubtract}", "{numpadadd}","{numpadenter}", "{arrowup}", "{arrowleft}","{arrowdown}", "{arrowright}"];
        const rhs = ["Num-", "Num+","NumEnter", "Up", "Left","Down", "Right"];
        
        if (lhs.includes(btn)) {
            return rhs[lhs.indexOf(btn)];
        } else if (rhs.includes(btn)) {
            return lhs[rhs.indexOf(btn)];
        } else {
            return btn;
        }
    }

    function getContrast(col=color) {    
        // Get YIQ ratio
        var yiq = ((col.r * 299) + (col.g * 587) + (col.b * 114)) / 1000;
        // Check contrast
        return (yiq >= 128) ? 'rgb(0,0,0)' : 'rgb(255,255,255)';
    }

    // Keyboard options

    function onRef(name: string, currKeyboard : Keyboard) {
        console.log(name);
        const layout : string[] = currKeyboard.options.layout!.default;
        layout.forEach((row:string) => {
            const splitted = row.split(' ');
            splitted.forEach((btn: string) => {
                const dom = currKeyboard.getButtonElement(btn);
                const converted = convertBtnText(btn);
                const key_color = keys[converted];
                let final_dom : HTMLElement;
                if (Array.isArray(dom)) {
                    final_dom = dom[0];
                } else {
                    final_dom = dom;
                }
                if (key_color.r === 0 && key_color.g === 0 && key_color.b === 0) {
                    final_dom.style.backgroundColor = 'rgb(255,255,255)';
                    final_dom.style.color = 'rgb(0,0,0)';
                    final_dom.style.opacity = '0.4';
                } else {    
                    final_dom.style.color = getContrast({r: key_color.r, g: key_color.g, b: key_color.b})
                    final_dom.style.backgroundColor = `rgb(${key_color.r},${key_color.g},${key_color.b})`;
                }
                setButtonContainer(prevState => ({
                    ...prevState,
                    [converted]: final_dom
                }))
            })
        });
    }

    function onKeyPress(btn:string) {
        toggleSelectButton(convertBtnText(btn));
    }

    const commonKeyboardOptions : KeyboardOptions = {
        'onKeyPress': onKeyPress,
        theme: "simple-keyboard hg-theme-default hg-layout-default",
        physicalKeyboardHighlight: false,
        mergeDisplay: true,
        disableButtonHold: true,
    }

    return (
        <Segment>
            {layout ?
                <div>
                    <div className="keyboardContainer">
                        <Keyboard
                            baseClass={"simple-keyboard-main"}
                            keyboardRef={r => onRef('main', r)}
                            layoutName='default'
                            {...commonKeyboardOptions}
                            {...layout.main}
                        />

                        <div className="controlArrows">
                            <Keyboard
                                baseClass={"simple-keyboard-control"}
                                keyboardRef={r => onRef('controlPad', r)}
                                {...commonKeyboardOptions}
                                {...layout.controlPad}
                            />
                            <Keyboard
                                baseClass={"simple-keyboard-arrows"}
                                keyboardRef={r => onRef('arrows', r)}
                                {...commonKeyboardOptions}
                                {...layout.arrows}
                            />
                        </div>

                        <div className="numPad">
                            <Keyboard
                                baseClass={"simple-keyboard-numpad"}
                                keyboardRef={r => onRef('numPad', r)}
                                {...commonKeyboardOptions}
                                {...layout.numPad}
                            />
                            <Keyboard
                                baseClass={"simple-keyboard-numpadEnd"}
                                keyboardRef={r => onRef('numPadEnd', r)}
                                {...commonKeyboardOptions}
                                {...layout.numPadEnd}
                            />
                        </div>
                    </div>
                    <Button color='teal' disabled={disabled} onClick={selectAll} className={'keyColorButton'}>Select All</Button>
                    <Button color='teal' disabled={disabled} onClick={deselectAll} className={'keyColorButton'}>Deselect All</Button>
                    <Button color='teal' disabled={disabled} onClick={invertSelection} className={'keyColorButton'}>Invert Selection</Button>
                    <Button color='teal' disabled={disabled} onClick={setKeyColor} className={'keyColorButton'}>Set Key Color</Button>
                    <Button color='teal' disabled={disabled} onClick={clearSelected} className={'keyColorButton'}>Clear Selected</Button>
                </div>
            : ''
            }
        </Segment>
    );
}