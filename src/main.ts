import { app, BrowserWindow, ipcMain } from 'electron';
import AsyncNedb from 'nedb-async';
import { ProfileState, SpectrumState, TesoroGramSE, Profile, Spectrum } from 'node-tesoro';
import path from 'path';

const profiles = new AsyncNedb<ProfileState>({filename: './data/profiles.db', autoload: true});
const spectrums = new AsyncNedb<SpectrumState>({filename: './data/spectrums.db', autoload: true});

profiles.ensureIndex({fieldName: '_id'});
spectrums.ensureIndex({fieldName: '_id'});

const defaultProfileState : ProfileState = {
  r: 255,
  g: 76,
  b: 0,
  effect: Profile.Effect.Spectrum,
  effect_color: Profile.EffectColor.Static,
  brightness: Profile.Brightness.B100
}

const keyboard = new TesoroGramSE('hungarian', handleKeyboardInput);

const defaultSpectrumState : SpectrumState = {
  keys: keyboard.keys,
  effect: Spectrum.Effect.Standard
}

let profileState : ProfileState;
let spectrumState : SpectrumState|undefined;

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

async function handleKeyboardInput(data: any) {
    if (data) {
      if ('_id' in data) {
          await serverGetProfile(data._id);
      } else {
          profileState = {...profileState, ...data};
          await profiles.asyncUpdate({'_id': profileState._id}, profileState);
      }
      ipcMain.emit('profile server', profileState)
    }
  }

ipcMain.handle('profile connect', async () => {
  await serverGetProfile(1);
  return profileState;
});

ipcMain.handle('spectrum connect', async () => {
  const t = await spectrums.asyncFindOne({});
  if (t) {
      spectrumState = t;
  } else {
      spectrumState = undefined;
  }
  return {layout: keyboard.layout_str, spectrums: spectrums.getAllData().map(d => {return d._id}), spectrumState}
});

ipcMain.handle('profile change', async (_,data) => {
    await serverGetProfile(data);
    await keyboard.changeProfile(profileState._id!);
    return {profile: profileState};
});

ipcMain.handle('profile save', async(_,data) => {
    profileState = {...profileState, ...data};
    await profiles.asyncUpdate({'_id': profileState._id}, {...profileState}, {upsert: true});
    return 1;
});

ipcMain.handle('profile send', async() => {
    await keyboard.sendProfileSettings(profileState);
    return 1;
});

ipcMain.handle('spectrum change', async(_, data) => {
    await serverGetSpectrum(data);
    return {spectrumState, spectrums: spectrums.getAllData().map(d => {return d._id})};
});

ipcMain.handle('spectrum save', async(_,data) => {
    spectrumState = {...spectrumState, ...data};
    await spectrums.asyncUpdate({'_id': spectrumState!._id}, {...spectrumState}, {upsert: true});
    return 1;
});
    
ipcMain.handle('spectrum send', async() => {
    await keyboard.sendSpectrumSettings(spectrumState!);
    return 1;
});

ipcMain.handle('spectrum rename', async(_,data) => {
    const spectrum = await spectrums.asyncFindOne({"_id": data});
    if (spectrum) {
        return {error: true};
    } else {
        await spectrums.asyncRemove({"_id": spectrumState!._id});
        spectrumState!._id = data;
        await spectrums.asyncInsert(spectrumState!);
        return {error: false, spectrumState, spectrums: spectrums.getAllData().map(d => {return d._id})};
    }
});

ipcMain.handle('spectrum delete', async() => {
    await spectrums.asyncRemove({'_id': spectrumState!._id});
    const t = await spectrums.asyncFindOne({});
    if (t) {
        spectrumState = t;
    } else {
        spectrumState = undefined;
    }
    return {spectrumState, spectrums: spectrums.getAllData().map(d => {return d._id}) };
})

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true, // is default value after Electron v5
      contextIsolation: false, // protect against prototype pollution
      // enableRemoteModule: false, // turn off remote
      // preload: path.join(__dirname, 'preload.ts') // use a preload script
    }
  });

  win.loadURL(path.join(__dirname, 'index.html'));
}
1
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});