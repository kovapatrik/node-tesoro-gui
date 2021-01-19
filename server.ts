import {TesoroGramSE, Profile, ProfileState} from 'node-tesoro';
import express from 'express';
import AsyncNedb from 'nedb-async';
import {Server, Socket} from 'socket.io';

const PORT = process.env.PORT || 5000;

const profiles = new AsyncNedb<ProfileState>({filename: './data/profiles.db', autoload: true});
profiles.ensureIndex({fieldName: '_id'});

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/', express.static('public'));

const server = app.listen(PORT, ()=> console.log(`Running on ${PORT}`));

const io = new Server(server);

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

async function handleKeyboardInput(data: any) {
    if (data) {
        if ('_id' in data) {
            await serverGetProfile(data._id);
        } else {
            profileState = {...profileState, ...data};
        }
        io.emit('profile server', profileState);
    }
}

async function serverGetProfile(num: number) {
    const next_profile = await profiles.asyncFindOne({'_id': num});
    if (next_profile) {
        profileState = next_profile;
    } else {
        const new_profile = {...defaultProfileState, _id: num};
        await profiles.asyncInsert(new_profile);
        profileState = new_profile;
    }
}

const keyboard = new TesoroGramSE('hungarian', handleKeyboardInput);

io.on('connect', (socket: Socket) => {
    console.log(socket.id);

    socket.on('profile get', async(data,cb) => {
        const { _id } = data;
        await serverGetProfile(_id);
        cb({profile: profileState});
    });

    socket.on('profile save', async(data) => {
        profileState = {...profileState, ...data};
        await profiles.asyncUpdate({'_id': profileState._id}, {...profileState}, {upsert: true});
    });

    socket.on('profile change', async() => {
        await keyboard.changeProfile(profileState._id!);
    });

    socket.on('profile send', async() => {
        if (keyboard.profile_state._id != profileState._id) {
            await keyboard.changeProfile(profileState._id!);
        }
        keyboard.setProfileSettings(profileState);
        await keyboard.sendProfileSettings();
    });
});