var yodNotifications = angular.module('yodNotifications', [])                                                                                                                                                                        
 	.factory('notification', ['helper', 'tray', 'settings',
 		function(helper, tray, settings) {   
	 		var _opened_orders = {},
	 			_opened_error = null,
	 			_opened_update = null,
	 			_server = settings.get('server', '').replace(/\/$/, ''),
	 			_reminder_timer = null,
	 			_reminder_periodicity = 15000,
	           	_notify = helper.req('nw-notify'),
	           	_sound_files = {
	           		order: helper.getRootPath() + 'sounds/notification.ogg',
	           		error: helper.getRootPath() + 'sounds/notification-error.ogg'
	           	},
	           	_play_sound = function(type){
	           		if(!settings.getApp('disable_sound')){
		           		var audio = new Audio(_sound_files[type]);
						audio.play();
					}
	           	},
	           	_format_time = function(time){
					var seconds, minutes, hours;

			        seconds = time % 60;
			        minutes = Math.floor((time % 3600) / 60);
			        hours = Math.floor(time / 3600);
			        if (hours < 10) {
			            hours = '0' + hours;
			        }
			        if (minutes < 10) {
			            minutes = '0' + minutes;
			        }
			        if (seconds < 10) {
			            seconds = '0' + seconds;
			        }

			        return hours + ':' + minutes + ':' + seconds;
	 			},
	 			_error_template = function(text){
	           		return '<div id="error"><b>'+text+'</b></div>';
	           	},
	 			_update_template = function(text){
	 				return '<div id="update"><b>'+text+'</b></div>';
	 			},
	 			_order_template = function(order){
	 				var timer_html = (order.remaining_time > 0) ? _format_time(order.remaining_time) : 'Просрочен',
	 					html = '<div id="timer" data-remaining="'+order.remaining_time+'" data-start="'+Date.now()+'" class="timer">'+timer_html+'</div>\
						<div class="hover">\
							<b>Новый заказ</b> <span class="order_id">№'+order.id+'</span>\
						</div>';
	 				
 					return html;
	 			},
	           	_show = function(options){
	           		if(!settings.getApp('disable_notification')){
						return _notify.notify({
							text: options.body || '',
							url: options.url || null,
							onCloseFunc: options.onClose || null,
							onClickFunc: options.onClick || null
						});
					}
					return false;
				},
				_on_close = function(test){
					if(_opened_orders.hasOwnProperty(this.id)){
						delete _opened_orders[this.id];
					}
					else if(this.text.indexOf('id="error"') !== -1){
						_opened_error = null;
					}
					else if(this.text.indexOf('id="update"') !== -1){
						_opened_update = null;
					}
					var icon = null,
						has_orders = !!Object.keys(_opened_orders).length,
						has_errors = !!_opened_error;

					if(has_errors && !has_orders){
						icon = 'error';
					}
					if(has_orders && !has_errors){
						icon = 'order';
					}
					if(!has_errors && !has_orders){
						icon = 'default';
	 				}
	 				if(icon !== null){
	 					tray.changeIcon(icon);
	 				}
				},
				_start_reminder = function(){
					if(!_reminder_timer){
						_reminder_timer = setInterval(function(){
							if(!Object.keys(_opened_orders).length){
								clearInterval(_reminder_timer);
								_reminder_timer = null;
								return;
							}
							_play_sound('order');
						}, _reminder_periodicity);
					}
				},
				_close_by_id = function(id){
					var i = 0;
					while(typeof this.getWindow(i) !== 'undefined'){
						if(this.getWindow(i).window.document.getElementById(id)){
							this.close(i);
							break;
						}
						i += 1;
					}
				};
			
			_notify.setConfig({
			    appPath: helper.getRootPath(),
			    appIcon: helper.getRootPath() + 'images/popup_icon.png',
			    displayTime: 666*666*666,
			    width: 200,
			    height: 80,
			    borderRadius: 10,
			    padding: 10
			});
	    	return {
	    		update: function(text){
	    			if(!_opened_update){
	    				_show({
	    					body: _update_template(text),
	    					onClose: _on_close,
	    					onClick: function(){
	    						var gui = helper.req('nw.gui'),
	    							win = gui.Window.get();

    							win.show();
    							this.closeUpdate();
	    					}.bind(this)
    					});
    					_play_sound('order');
    					_opened_update = true;
	    			}
	    		},
	    		order: function(order){
	    			var win_id = _show({
	 					body: _order_template(order), 
	 					onClose: _on_close,
	 					url: _server+'/partners/order/'+order.id+'/'
 					});
 					_play_sound('order');
 					if(win_id !== false){
		 				_opened_orders[win_id] = order.id;
		 				tray.changeIcon('order');
		 				_start_reminder();
 					}
	    		},
				error: function(body){
					if(_opened_error){
						_close_by_id.bind(this)('error');
					}
					
					var win_id = _show({
						body: _error_template(body),
						onClose: _on_close
					});
					_play_sound('error');

					if(win_id !== false){
						_opened_error = true;
						tray.changeIcon('error');
					}
				},
				close: function(i){
					return _notify.closeOne(i);
				},
				closeError: function(){
					if(_opened_error){
						_close_by_id.bind(this)('error');
					}
				},
				closeUpdate: function(){
					if(_opened_update){
						_close_by_id.bind(this)('update');
					}
				},
				getWindow: function(i){
					return _notify.getWindow(i);
				},
				closeAll: function(){
					_notify.closeAll(true);
					_opened_error = false;
					_opened_update = false;
					_opened_orders = {};
					tray.changeIcon('default');
				}
	   		}
    }]);