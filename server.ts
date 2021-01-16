import HID from 'node-hid';
import {TesoroGramSE, Profile, ProfileState} from 'node-tesoro';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let profileState : ProfileState = {
    profile_num: Profile.ProfileSelect.Profile1,
    r: 255,
    g: 76,
    b: 0,
    effect: Profile.Effect.Spectrum,
    effect_color: Profile.EffectColor.Static,
    brightness: Profile.Brightness.B100
}

const keyboard = new TesoroGramSE(new HID.HID(HID.devices()
                      .filter(x => x.path && x.productId == 0x2057 && x.interface == 1 && x.path.includes("col05"))[0].path!), 
                      'hungarian', profileState);

// Getters
app.get('/api/profile', (req, res) => {
    res.send({profile: profileState});
    res.end();
});
// Setters
app.post('/api/profile', (req, res) => {
    let recv_data = req.body;
    if ('color' in recv_data) {
        let color = recv_data.color;
        delete recv_data.color;
        profileState = {...profileState, ...recv_data, r: color.r, g: color.g, b: color.b};
    } else {
        profileState = {...profileState, ...recv_data};
    }
    res.send('ok');
    res.end();
})



if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/lib')));
    // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, 'client/lib', 'index.html'));
    });
}

app.listen(port, () => console.log(`Listening on port ${port}`));