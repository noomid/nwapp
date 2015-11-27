var yodConnection = angular.module('yodConnection', [])
	.factory('connection', 
 		['settings', 'helper', 'user', 'notification',
 		function(settings, helper, user, notification){
 			var _timer, _dir,
 				_start_periodicity = 60000 * 5,
 				_long_periodicity = 60000 * 30,
 				_periodicity = _start_periodicity,
 				_fs = helper.req('fs'),
 				_finded_files = [],
 				_valid_files = [],
 				_ftp_options = {
			        host: settings.getFtp('host'),
			        port: settings.getFtp('port'),
			        user: settings.getFtp('user'),
			        password: settings.getFtp('password')
			    },
			    _client = helper.req('ftp'),
			    _connection = new _client(),
 				_check_file = function(file){
 					if(_finded_files.indexOf(file) !== -1){
 						return false;
 					}
 					var pharmacy_uids = user.pharmacy_uids.map(function(uid){
 							return uid.toLowerCase();
 						}),
 						regexp = new RegExp('^' + user.partner_slug.toLowerCase() + '(' +pharmacy_uids.join('|')+ ')\.xml$');
 					
 					return regexp.test(file.toLowerCase());
 				},
 				_file_is_valid = function(file){
 					if(!_fs.existsSync(_dir + file)){
 						_finded_files.remove(file);
 						return false;
 					}
					var xml = _fs.readFileSync(_dir + file, 'utf8'),
						parser = new DOMParser(),
						dom = parser.parseFromString(xml, 'text/xml');
						
					return !dom.getElementsByTagName('parsererror').length;
 				},
 				_handle_read_dir = function(err, files){
					if(err){
						console.log(err);
						return;
					}
					console.log(files);
					files.forEach(function(file){
						if(_check_file(file)){
							_finded_files.push(file);
						}
					});
					_finded_files.forEach(function(file){
						if(_file_is_valid(file)){
							_valid_files.push(file);
						}
						else{
							notification.error('Ошибка загрузки<br />'+file+' невалидный');
						}
					});
					if(_valid_files.length){
						_connection.connect(_ftp_options);
					}
 				},
 				_watch_file = function(){
					_timer = setTimeout(function(){
 						_watch_file();
 						if(!settings.getApp('load_price') || !user.authorized){
 							return;
 						}

 						_dir = settings.getFtp('dir').replace(/\/$/, '') + '/';
 						if(_dir !== '/'){
							_fs.readdir(_dir, _handle_read_dir);
 						}
 					}, _periodicity)
 				},
 				_refresh_timer = function(){
					clearInterval(_timer);
      				_watch_file();
 				};

			_connection.ascii(function(error){
				if(error){
					console.log(error);
				}
			});
			_connection.on('ready', function(){
				_valid_files.forEach(function(file){
					var local_file = _dir+file;
					_finded_files.remove(file);
		      		_valid_files.remove(file);
		      		if(_fs.existsSync(local_file)){
						_connection.put(local_file, file, function(err) {
				      		if (err){
						      	throw err;
				      		}
				      		try{
				      			_fs.unlinkSync(local_file);
				      			if(_periodicity !== _start_periodicity){
				      				_periodicity = _start_periodicity;
				      				_refresh_timer();
				      			}
				      		}
				      		catch(error){
				      			_periodicity = _long_periodicity;
				      			_refresh_timer();
				      			notification.error('Не удалось удалить файл '+file);
				      		}
				      		
				      		_connection.end();
					    });
		      		}
				});
			});

 			return {
 				watchFile: function(){
 					_watch_file();
 				},
 				stopWatchingFile: function(){
 					clearInterval(_timer);
 					_timer = null;
 				}
 			};
	}]);