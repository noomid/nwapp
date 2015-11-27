var yodUpdater = angular.module('yodUpdater', [])
	.factory('updater', [
		'$location', 'helper', 'settings', '$location', 'notification',
		function($location, helper, settings, $location, notification){
			var _fs = helper.req('fs'),
			  	_gui = helper.req('nw.gui'),
			  	_pkg = JSON.parse(_fs.readFileSync('manifest.json', 'utf8')),
			  	_updater = helper.req('node-webkit-updater'),
			  	_upd = new _updater(_pkg),
			  	_server = settings.get('server', '').replace(/\/$/, '') + '/',
			  	_manifest = _pkg,
			  	_filename;

		  	_pkg.manifestUrl = _server + _pkg.manifestUrl.replace(/^\//, '');
		  	_pkg.packages.win.url = _server + _pkg.packages.win.url.replace(/^\//, '');

			return {
				downloadStarted: false,
				updateRunning: false,
				checkNewVersion: function(afterDownload, beforeDownload){
					_upd.checkNewVersion(function(error, newVersionExists, manifest) {
						if(beforeDownload){
							beforeDownload(newVersionExists, manifest);
						}
				        if (!error && newVersionExists) {
				        	_manifest = manifest;
				        	
				        	if(this.downloadStarted === false){
				        		this.downloadStarted = true;
				        		console.log('download start');
					            _upd.download(function(error, filename) {
					            	console.log('download end, error:');
					            	console.log(error);
					                if (!error) {
					                	_filename = filename;
					                	notification.update('Вышло новое<br />обновление');
					                	afterDownload();
					                }
					            });
				        	}
				        }
				    }.bind(this));
				},
				unpack: function(){
					if(_filename && this.updateRunning === false){
						console.log('unpack');
						this.updateRunning = true;
						_upd.unpack(_filename, function(error, newAppPath) {
	                    	console.log('unpack end, error:');
	                    	console.log(error);
	                        if (!error) {
	                            _upd.runInstaller(newAppPath, [_upd.getAppPath(), _upd.getAppExec()],{});
	                            helper.closeApp();
	                        }
	                    }, _manifest);
					}
				},
				installUpdate: function(){
					this.updateRunning = true;
					$location.path('/update');
					var copyPath = _gui.App.argv[0],
			   			execPath = _gui.App.argv[1];

		   			console.log('install run');
		   			console.log('copy path: '+copyPath);
		   			console.log('exec path: '+execPath);
		   			_upd.install(copyPath, function(err) {
		   				console.log('install end, error:');
		   				console.log(err);
				        if(!err) {
				            _gui.Shell.openItem(execPath)
				            helper.closeApp();
				        }
				    });
				},
				getManifest: function(){

					return _manifest;
				}
			}
	}]);