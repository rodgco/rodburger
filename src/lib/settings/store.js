import Store from 'svelegante';
import value from './default';
import './types.d';

/** @extends{Store<SettingsData>} */
class Settings extends Store {}

const settings = new Settings(value, {
	storage: 'localStorage',
	key: 'settings',
	load: true
});

export default settings;
