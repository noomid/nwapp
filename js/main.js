var yod = angular.module('yod', [
  'init',
  'yodHelper',
  'yodControllers',
  'yodNotifications',
  'yodSettings',
  'yodUser',
  'yodTray',
  'yodUpdater',
  'yodApp',
  'yodConnection',
  'ngRoute',
  'ngResource'
]);

yod.run([
  '$rootScope', 
  'helper', 
  'user', 
  'settings', 
  function($rootScope, helper, user, settings){
    document.getElementById('app_title').innerHTML = 'YOD.app — v.'+helper.getVersion();
    
    $rootScope.current_user = user;
    $rootScope.is_production = settings.get('is_production', true);
    $rootScope.settings = settings;
}]);

yod.directive('dirread', ['settings', function (settings) {
    return {
        scope: {
            dirread: '='
        },
        link: function (scope, element, attributes) {
            element.bind('change', function (changeEvent) {
                scope.$apply(function () {
                    var dir = changeEvent.target.files[0].path;
                    scope.dirread = dir;
                    settings.setFtp('dir', dir);
                });
            });
        }
    }
}]);

yod.filter('nl2br', function($sce){
    return function(msg,is_xhtml) { 
        var is_xhtml = is_xhtml || true;
        var breakTag = (is_xhtml) ? '<br />' : '<br>';
        var msg = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
        return $sce.trustAsHtml(msg);
    }
});


yod.config(['$routeProvider', '$httpProvider',
  function($routeProvider, $httpProvider, settingsProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl',
        resolve: {
          factory: checkRouting
        }
      }).
      when('/connection', {
        templateUrl: 'templates/connection.html',
        controller: 'ConnectionCtrl',
        resolve: {
          factory: checkRouting
        }
      }).
      when('/settings', {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl',
        resolve: {
          factory: checkRouting
        }
      }).
      when('/update', {
        templateUrl: 'templates/update.html',
        controller: 'UpdateCtrl'
      }).
      otherwise({
        redirectTo: '/login'
      });
  }]);


var checkRouting = function ($q, $rootScope, $location, user) {
  
  if(!user.authorized && $location.$$path !== '/login'){
    $location.path('/login');  
  }
  if(user.authorized && $location.$$path === '/login'){
    $location.path('/settings');
  }

  return true;
};

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};