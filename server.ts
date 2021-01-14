import HID from 'node-hid';
import {TesoroGramSE, Profile} from 'node-tesoro';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const keyboard = new TesoroGramSE(new HID.HID(HID.devices()
                      .filter(x => x.path && x.productId == 0x2057 && x.interface == 1 && x.path.includes("col05"))[0].path!), 
                      'hungarian');

app.get('/api/test', (req, res)=> {
    keyboard.changeProfile(Profile.ProfileSelect.Profile1);
});

if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/lib')));
    // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, 'client/lib', 'index.html'));
    });
}

app.listen(port, () => console.log(`Listening on port ${port}`));