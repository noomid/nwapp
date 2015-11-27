var init = angular.module('init', [])                                                                                                                                                     
 	.run(['$rootScope', 'user', 'helper', 'notification', 'tray', 'settings', 'app', 'connection', 'updater', '$location',
 	function($rootScope, user, helper, notification, tray, settings, app, connection, updater, $location) {   
 		var fs = helper.req('fs'),
 			gui = helper.req('nw.gui'),
 			win = gui.Window.get(),
 			checkNewVersion = function(before){
 				updater.checkNewVersion(function(){
					$rootScope.$apply(function(){
						$location.path('/update');
					});
				}, before);
 			};

		if(gui.App.argv.length) {
		   updater.installUpdate();
		   return;
		}
		else{
			checkNewVersion();
			setInterval(checkNewVersion, 1000*60*60*24);
		}
		tray.create([
			{
				type: 'normal', 
				label: 'Проверить наличие обновлений',
				click: function(){
					checkNewVersion(function(exists, manifest){
						if(exists){
							notification.update('Началась загрузка обновления '+manifest.version);
						}
						else{
							notification.update('У вас самая актуальная версия');
						}
					});
				}
			},
			{
				type: 'normal', 
				label: 'Выйти',
				click: app.close
			}
		]);
		
		connection.watchFile();
			
		settings.init();

		if(user.authorized && settings.getApp('run_hidden')){
			win.hide();
		}

 		if(user.isSaved()){
 			var auth_data = user.getAuthData();
 			
 			if(auth_data.user && (Date.now() - (auth_data.time + 1000*60*60*24) < 0)){
				user.login(auth_data.user);
 			}
 		}

 		win.window.document.addEventListener('keypress', function(e){
 			if(e.ctrlKey && e.charCode == 21){
 				win.showDevTools();
 			}
 		});
    }]);