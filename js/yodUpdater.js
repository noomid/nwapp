var yodUpdater = angular.module('yodUpdater', [])
	.factory('updater', [
		'$location', 'helper', 'settings', '$location',
		function($location, helper, settings, $location){
			var _fs = helper.req('fs'),
			  	_gui = helper.req('nw.gui'),
			  	_pkg = JSON.parse(_fs.readFileSync('manifest.json', 'utf8')),
			  	_updater = helper.req('node-webkit-updater'),
			  	_upd = new _updater(_pkg),
			  	_server = settings.get('server').replace(/\/$/, '') + '/',
			  	_manifest = _pkg,
			  	_filename;

		  	_pkg.manifestUrl = _server + _pkg.manifestUrl.replace(/^\//, '');
		  	_pkg.packages.win.url = _server + _pkg.packages.win.url.replace(/^\//, '');

			return {
				updateRunning: false,
				checkNewVersion: function(afterDownload, beforeDownload){
					_upd.checkNewVersion(function(error, newVersionExists, manifest) {
						beforeDownload(newVersionExists);
				        if (!error && newVersionExists) {
				        	_manifest = manifest;
				        	console.log('download start');
				            _upd.download(function(error, filename) {
				            	console.log('download end, error:');
				            	console.log(error);
				                if (!error) {
				                	_filename = filename;
				                	afterDownload();
				                }
				            });
				        }
				    });
				},
				unpack: function(){
					if(_filename){
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
				            // _gui.App.quit();
				            helper.closeApp();
				        }
				    });
				},
				getManifest: function(){

					return _manifest;
				}
			}
	}]);