var yodTray = angular.module('yodTray', [])                                                                                                                                                                        
 	.factory('tray', ['helper', 'app', function(helper, app) {   

		var gui = helper.req('nw.gui'),
			_icons = {
				default: 'images/32x32-default.png',
				order: 'images/32x32-order.png',
				error: 'images/32x32-connection-failed.png'
			},
			_win = gui.Window.get(),
			_tray, _menu;

		return {
			create: function(menu){
				_tray = new gui.Tray({ title: 'Yod', icon: _icons.default });

				if(menu.length){
					_menu = new gui.Menu();
					menu.forEach(function(item){
						_menu.append(new gui.MenuItem(item));
					});
					_tray.menu = _menu;
				}
				
				// _menu.append(new gui.MenuItem({ 
				// 	type: 'normal', 
				// 	label: 'Выйти',
				// 	click: function(){
				// 		app.close();
				// 	}
				// }));
				// _menu.append(new gui.MenuItem({ 
				// 	type: 'normal', 
				// 	label: 'Проверить наличие обновлений',
				// 	click: function(){
						
				// 	}
				// }));
				

				_tray.on('click', function() {
			        _win.show();
		      	});
			},
			changeIcon: function(icon){
				_tray.icon = _icons[icon];
			}
		}
    }]);