var yodUser = angular.module('yodUser', [])                                                                                                                                                                        
 	.factory('user', 
 		['$http', '$resource', 'settings', 'helper', '$location', 'notification', 'tray',
 		function($http, $resource, settings, helper, $location, notification, tray) {
			var server = settings.get('server', '').replace(/\/$/, '') + '/api',
				Session = $resource(server + '/session/:action.json', {action: '@action'}),
				Orders = $resource(server + '/notification/:action.json', {action: '@action'}),
				fs = helper.req('fs'),
				_remember_file = helper.getRootDir() + 'data/auth_data.json',
				_remember = function(user){
					fs.writeFile(_remember_file, JSON.stringify({
							time: Date.now(),
							user: user,
							logged: true
						}, null, "\t")); 
				},
				_on_error = function(){
					if(this.connected){
						notification.error('Сбой соеденения с&nbsp;сервером');
						this.connected = false;
					}
					_timer = setTimeout(_get_orders.bind(this), _periodicity);
				},
				_get_orders = function(first_time){
					var on_error = (!first_time)? _on_error.bind(this) : function(){
							notification.error('Сбой соеденения с&nbsp;сервером');
							_timer = setTimeout(_get_orders.bind(this), _periodicity);
						}.bind(this);
					Orders.save({action: 'orders'}, {time: _last_time}, function(rsp){
						_timer = setTimeout(_get_orders.bind(this), _periodicity);
						if(rsp.status === 'ok'){
							console.log('connected status: '+this.connected);
							if(this.connected === false){
								notification.closeError();
							}
							this.connected = true;
							if(rsp.time_now){
								_last_time = rsp.time_now;
							}
							if(rsp.orders.length){
								rsp.orders.forEach(function(order){
									notification.order(order);
								});
							}
						}
	 					if(rsp.status === 'auth_error'){
							this.logout();
	 					}
					}.bind(this), on_error);
				},
	 			_last_time = null,
	 			_timer,
	 			_periodicity = 60000,
				_error = null;
			
	 		return {
	 			authorized: false,
	 			connected: false,
	 			getEmail: function(){
	 				if(this.email){
	 					return this.email;
	 				}
	 				if(fs.existsSync(_remember_file)){
	 					return this.getAuthData().user.email;
	 				}
	 			},
	 			isSaved: function(){
	 				if(fs.existsSync(_remember_file)){
	 					var auth_data = this.getAuthData();
	 					if(auth_data.logged){
	 						return true;
	 					}
	 				}
	 				return false;
	 			},
	 			getAuthData: function(){
	 				return JSON.parse(fs.readFileSync(_remember_file, 'utf8'))
	 			},
	 			login: function(user){
	 				this.authorized = true;
					$http.defaults.headers.common['X-AuthToken'] = user.hash_app;
					this.__proto__ = user;
					this.watchOrders();
	 			},
	 			logout: function(){
	 				this.authorized = false;
	 				this.connected = false;
	 				_last_time = null;
 					$http.defaults.headers.common['X-AuthToken'] = '';	
 					this.stopWatchingOrders();
 					notification.closeAll();
 					fs.exists(_remember_file, function(exists){
 						if(exists){
 							var auth_data = this.getAuthData();
 							auth_data.logged = false;
 							fs.writeFile(_remember_file, JSON.stringify(auth_data, null, "\t")); 
 						}
 					}.bind(this));
 					tray.changeIcon('default');
 					$location.path('/login');
	 			},
	 			authorize: function(user_data, success_cb, error_cb){
 					Session.save({action: 'login'}, {
 						login_data: {
 							email: user_data.email,
 							password: user_data.password
 						}
 					}, function(rsp){
 						if(rsp.status === 'ok'){
 							if(user_data.remember){
 								_remember(rsp.user);
 							}
 							this.login(rsp.user);
 						}
 						else{
							_error = rsp.message;
 						}
 						success_cb(this.authorized, rsp);
 					}.bind(this), error_cb);
	 			},
	 			hasError: function(){
	 				return _error !== null;
	 			},
	 			getError: function(){
	 				if(this.hasError){
	 					return _error;
	 				}
	 			},
	 			watchOrders: function(){
	 				var get_orders = _get_orders.bind(this);
	 				get_orders(true);
	 			},
	 			stopWatchingOrders: function(){
					clearInterval(_timer);
	 			}
	 		}
    }]);