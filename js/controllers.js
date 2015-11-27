var yodControllers = angular.module('yodControllers', []);

yodControllers.controller('LoginCtrl', ['$rootScope', '$scope', 'user', '$location', 'helper', 'settings', 'notification',
  function($rootScope, $scope, user, $location, helper, settings, notification) {
    var loginInProcess = false;
    $scope.user = {
      email: user.getEmail()
    };

  	$scope.login = function(){
      if(loginInProcess === false){
        loginInProcess = true;
    		user.authorize($scope.user, function(authorized, rsp){
          loginInProcess = false;
          if(authorized){
            $location.path('/settings');
          }
          else{
            $scope.user_error = rsp.message;
          }
        }, function(){
          loginInProcess = false;
          notification.error('Сбой соеденения с&nbsp;сервером');
        });
      }
  	}

    $scope.openPartners = function(){
      var gui = helper.req('nw.gui'),
          server = settings.get('server').replace(/\/$/, '') + '/';
      gui.Shell.openExternal(server + 'partners/');
    }

    $scope.rememberUser = function(){
      $scope.user.remember = !$scope.user.remember;
    }
  }]);

yodControllers.controller('ConnectionCtrl', ['$scope', 'settings', function($scope, settings){
  $scope.ftp_dir = settings.getFtp('dir');
  $scope.changeFtpDir = function(){
    settings.setFtp('dir', this.ftp_dir);
  }
}]);

yodControllers.controller('UpdateCtrl', ['$scope', 'updater', function($scope, updater){
  $scope.manifest = updater.getManifest();
  $scope.updateRunning = updater.updateRunning;
  $scope.runInstall = updater.unpack;
}]);

yodControllers.controller('SettingsCtrl', ['$scope', 'settings', function($scope, settings){
    
    $scope.settings = settings;
}]);
