var yodSettings = angular.module('yodSettings', [])                                                                                                                                                                        
 	.factory('settings', ['helper', 'app', function(helper, app){
		var fs = helper.req('fs'),
			gui = helper.req('nw.gui'),
			AutoLaunch = helper.req('auto-launch'),
			_app_launcher = new AutoLaunch({
				name: 'YOD.app'
			}),
			_win = gui.Window.get(),
			_data_path = helper.getRootDir() + 'data/',
			_settings_filename = (fs.existsSync(_data_path+'settings.local.json')) ? _data_path + 'settings.local.json' : _data_path + 'settings.json',
			_settings = (fs.existsSync(_settings_filename)) ? JSON.parse(fs.readFileSync(_settings_filename, 'utf8')) : {},
			_path = (_settings.is_production) ? 'production' : 'develop',
			_save_settings = function(){
				_settings.app = _app;
				_settings[_path].ftp = _ftp;
				
				fs.writeFileSync(_settings_filename, JSON.stringify(_settings, null, "\t"));
			},
			_app_titles = {
				disable_sound: 'Отключить звук',
				disable_notification: 'Отключить уведомления',
				launch_on_startup: 'Запускать при старте системы',
				run_hidden: 'Запускать в свернутом виде',
				hide_on_close: 'Сворачивать при закрытии',
				on_top: 'Поверх всех окон',
				load_price: 'Загрузка прайс-листа'
			},
			_win_on_close,
			_app = _settings.app || {},
			_ftp = (_settings[_path]) ? _settings[_path].ftp || {} : {};

		for(setting in _app_titles){
			if(!_app.hasOwnProperty(setting)){
				_app[setting] = false;
			}
		}

		return {
			get: function(what, def){
				
				if(_settings[_path] && _settings[_path].hasOwnProperty(what)){
					return _settings[_path][what];
				}
				else if(_settings.hasOwnProperty(what)){
					return _settings[what];
				}
				return def;
			},
			set: function(what, value){

				if(_settings[_path] && _settings[_path].hasOwnProperty(what)){
					_settings[_path][what] = value;
				}
				else{
					_settings[what] = value;
				}
				_save_settings();
				return value;
			},
			getApp: function(what){
				if(what){
					return !!_app[what];
				}
				return _app;
			},
			setApp: function(what, value){
				_app[what] = value;
				_save_settings();
				this.init();
			},
			getFtp: function(what){
				if(what){
					return _ftp[what] || '';
				}

				return _ftp;
			},
			setFtp: function(what, value){
				_ftp[what] = value;
				_save_settings();
			},
			getAppTitle: function(what){
				return _app_titles[what];
			},
			init: function(){
				if(typeof _win_on_close === 'function'){
					_win.removeListener('close', _win_on_close);
				}
				_win_on_close = !this.getApp('hide_on_close')? app.close : function(){
					_win.hide();
				};
				_win.on('close', _win_on_close);

				_win.setAlwaysOnTop(this.getApp('on_top'));

				if(this.getApp('launch_on_startup')){
					_app_launcher.enable();
				}
				else{
					_app_launcher.disable();
				}
			}
		}
 	}]);