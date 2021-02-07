import { TesoroGramSE, Profile, ProfileState, Spectrum, SpectrumState } from 'node-tesoro';
import express from 'express';
import AsyncNedb from 'nedb-async';
import { Server, Socket } from 'socket.io';

const PORT = process.env.PORT || 5000;

const profiles = new AsyncNedb<ProfileState>({filename: './data/profiles.db', autoload: true});
const spectrums = new AsyncNedb<SpectrumState>({filename: './data/spectrums.db', autoload: true});

profiles.ensureIndex({fieldName: '_id'});
spectrums.ensureIndex({fieldName: '_id'});

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/', express.static('public'));

const server = app.listen(PORT, ()=> console.log(`Running on ${PORT}`));

const io = new Server(server);

const keyboard = new TesoroGramSE('hungarian', handleKeyboardInput);

const defaultProfileState : ProfileState = {
    r: 255,
    g: 76,
    b: 0,
    effect: Profile.Effect.Spectrum,
    effect_color: Profile.EffectColor.Static,
    brightness: Profile.Brightness.B100
}
 
const defaultSpectrumState : SpectrumState = {
    keys: keyboard.keys,
    effect: Spectrum.Effect.Standard
}

let profileState : ProfileState;
let spectrumState : SpectrumState|undefined;

async function handleKeyboardInput(data: any) {
    if (data) {
        if ('_id' in data) {
            await serverGetProfile(data._id);
        } else {
            profileState = {...profileState, ...data};
            await profiles.asyncUpdate({'_id': profileState._id}, profileState);
        }
        io.emit('profile server', profileState);
    }
}

async function serverGetProfile(num: number) {
    const next_profile = await profiles.asyncFindOne({'_id': num});
    if (next_profile) {
        profileState = next_profile;
        // await profiles.asyncUpdate({'_id': num}, profileState); // Needed if it's important which profile was the last one
    } else {
        const new_profile = {...defaultProfileState, _id: num};
        await profiles.asyncInsert(new_profile);
        profileState = new_profile;
    }
}

async function serverGetSpectrum(name: string) {
    const next_spectrum = await spectrums.asyncFindOne({'_id': name});
    if (next_spectrum) {
        spectrumState = next_spectrum;
        // await spectrums.asyncUpdate({'_id': name}, next_spectrum); // Needed if it's important which spectrum was the last one
    } else {
        const new_spectrum = {_id: name, ...defaultSpectrumState };
        await spectrums.asyncInsert(new_spectrum);
        spectrumState = new_spectrum;
    }
}

io.on('connect', async (socket: Socket) => { 

    await serverGetProfile(1);
    io.emit('profile server', profileState);

    const t = await spectrums.asyncFindOne({});
    if (t) {
        spectrumState = t;
    } else {
        spectrumState = undefined;
    }

    io.emit('spectrum server', {layout: keyboard.layout_str, spectrums: spectrums.getAllData().map(d => {return d._id}), spectrumState} );

    socket.on('profile change', async(data,cb) => {
        await serverGetProfile(data);
        cb({profile: profileState});
        await keyboard.changeProfile(profileState._id!);
    });

    socket.on('profile save', async(data,cb) => {
        profileState = {...profileState, ...data};
        await profiles.asyncUpdate({'_id': profileState._id}, {...profileState}, {upsert: true});
        cb();
    });

    socket.on('profile send', async(_, cb) => {
        await keyboard.sendProfileSettings(profileState);
        cb();
    });

    socket.on('spectrum change', async(data, cb) => {
        await serverGetSpectrum(data);
        cb({spectrumState, spectrums: spectrums.getAllData().map(d => {return d._id})});
    });

    socket.on('spectrum save', async(data,cb) => {
        spectrumState = {...spectrumState, ...data};
        await spectrums.asyncUpdate({'_id': spectrumState!._id}, {...spectrumState}, {upsert: true});
        cb();
    });
    
    socket.on('spectrum send', async(_, cb) => {
        await keyboard.sendSpectrumSettings(spectrumState!);
        cb();
    });

    socket.on('spectrum rename', async(data,cb) => {
        const spectrum = await spectrums.asyncFindOne({"_id": data});
        if (spectrum) {
            cb({error: true});
        } else {
            await spectrums.asyncRemove({"_id": spectrumState!._id});
            spectrumState!._id = data;
            await spectrums.asyncInsert(spectrumState!);
            cb({error: false, spectrumState, spectrums: spectrums.getAllData().map(d => {return d._id})});
        }
    });

    socket.on('spectrum delete', async(cb) => {
        await spectrums.asyncRemove({'_id': spectrumState!._id});
        const t = await spectrums.asyncFindOne({});
        if (t) {
            spectrumState = t;
        } else {
            spectrumState = undefined;
        }
        cb({spectrumState, spectrums: spectrums.getAllData().map(d => {return d._id}) });
    })
});