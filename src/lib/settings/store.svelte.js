import './types.d.js';
import value from './default.js';

class Settings {
	/** @type {string} */
	_api_key = $state('');

	/** @type {string} */
	_thread_id = $state('');

	/** @type {Models} */
	// @ts-ignore
	_model = $state('');

	/** @type {boolean} */
	_closed = $state(false);

  constructor() {
    this._api_key = localStorage.getItem('api_key') || value.api_key;
    this._thread_id = localStorage.getItem('thread_id') || value.thread_id;
    // @ts-ignore
    this._model = localStorage.getItem('model') || value.model;
    this._closed = localStorage.getItem('closed') === 'true' || value.closed;
  }

	/** @returns {string} */
	get api_key() {
		return this._api_key;
	}

	/** @returns {string} */
	get thread_id() {
		return this._thread_id;
	}

	/** @returns {Models} */
	get model() {
		return this._model;
	}

	/** @returns {boolean} */
	get closed() {
		return this._closed;
	}

	/** @param {string} value */
	set api_key(value) {
		localStorage.setItem('api_key', value);
		this._api_key = value;
	}

	/** @param {string} value */
	set thread_id(value) {
		localStorage.setItem('thread_id', value);
		this._thread_id = value;
	}

	/** @param {Models} value */
	set model(value) {
		localStorage.setItem('model', value);
		this._model = value;
	}

	/** @param {boolean} value */
	set closed(value) {
		localStorage.setItem('closed', value ? 'true' : 'false');
		this._closed = value;
	}
}

const settings = new Settings();

export default settings;
