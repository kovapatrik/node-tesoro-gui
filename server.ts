import HID from 'node-hid';
import {TesoroGramSE, Profile, ProfileState} from 'node-tesoro';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import AsyncNedb from 'nedb-async';

const profiles = new AsyncNedb<ProfileState>({filename: './data/profiles.db', autoload: true});
profiles.ensureIndex({fieldName: '_id'});

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const defaultProfileState : ProfileState = {
    _id: undefined,
    r: 255,
    g: 76,
    b: 0,
    effect: Profile.Effect.Spectrum,
    effect_color: Profile.EffectColor.Static,
    brightness: Profile.Brightness.B100
}

let profileState : ProfileState;

async function getDefaultState() {
    const t = await profiles.asyncFind({});
    console.log(t);
}

//getDefaultState();

const keyboard = new TesoroGramSE(new HID.HID(HID.devices()
                      .filter(x => x.path && x.productId == 0x2057 && x.interface == 1 && x.path.includes("col05"))[0].path!), 
                      'hungarian');

// Getters
app.post('/get/profile', async (req, res) => {
    const next_profile = await profiles.asyncFindOne({'_id': req.body._id});
    if (next_profile) {
        profileState = next_profile;
    } else {
        const new_profile = {...defaultProfileState, _id: req.body._id};
        await profiles.asyncInsert(new_profile);
        profileState = new_profile;
    }
    res.send({profile: profileState});
    res.end();
});
// Setters
app.post('/save/profile', async (req, res) => {
    let recv_data = req.body;
    if ('color' in recv_data) {
        let color = recv_data.color;
        delete recv_data.color;
        profileState = {...profileState, ...recv_data, r: color.r, g: color.g, b: color.b};
    } else {
        profileState = {...profileState, ...recv_data};
    }

    await profiles.asyncUpdate({'_id': profileState._id}, {...profileState}, {upsert: true});
    

    res.send('ok');
    res.end();
})
// Keyboard API
app.post('/change/profile', async (req, res) => {
    // query db for profile
    let recv_data = req.body;
    console.log('change profile', profileState._id);
    await keyboard.changeProfile(recv_data._id);
    res.end();
})
app.get('/send/profile', async (_, res) => {
    console.log('send profile');
    if (keyboard.profile_state._id != profileState._id) {
        await keyboard.changeProfile(profileState._id!);
    }
    keyboard.setProfileSettings(profileState);
    await keyboard.sendProfileSettings();
    res.end();
})



if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/lib')));
    // Handle React routing, return all requests to React app
    app.get('*', function(_, res) {
        res.sendFile(path.join(__dirname, 'client/lib', 'index.html'));
    });
}

app.listen(port, () => console.log(`Listening on port ${port}`));