var yodHelper = angular.module('yodHelper', [])                                                                                                                                                                        
 	.factory('helper', function() { 
 		var libraries = {},
 			_exec_path = process.execPath,
 			_exe_name = _exec_path.substr(_exec_path.lastIndexOf('\\') + 1);

 		return {
 			getVersion: function(){
 				var fs = this.req('fs'),
				  	manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

			  	return manifest.version;
 			},
 			getTmpPath: function(){

 				return this.getRootPath + '/tmp/';
 			},
 			getRootPath: function(){

 				return window.location.href.replace(/index.html.*/, '');
 			},
 			getRootDir: function(){

 				return _exec_path.replace(new RegExp(_exe_name + '$'), '');
 			},
 			req: function(library){
 				if(typeof libraries[library] != 'undefiend'){
 					libraries[library] = require(library);
 				}

 				return libraries[library];
 			},
 			closeApp: function(){
 				var gui = this.req('nw.gui'),
	 				win = gui.Window.get();
 				this.req('nw-notify').closeAll();
 				gui.App.quit();
 			}
 		}
 	});