var yodApp = angular.module('yodApp', [])
	.factory('app', 
 		['helper',
 		function(helper){
	 		var gui = helper.req('nw.gui'),
	 			_win = gui.Window.get();
	 			

	 		return {
	 			close: function(){
	 				helper.req('nw-notify').closeAll();
	 				_win.close(true);
	 			}
	 		}
 	}]);