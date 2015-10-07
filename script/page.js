(function() { 
	var _start = 134; 
	var _menu = document.getElementById('menu'); 
	var _classDefault = "m-menu "; 
	var _classAdd = "m-menu-fixed"; 
	window.onscroll = function(){ 
		if(!_menu) return; 
		var _scrollTop = document.body.scrollTop + document.documentElement.scrollTop; 
		if(_scrollTop >= _start && _menu.className.indexOf(_classAdd)==-1){ 
			_menu.className = _classDefault + _classAdd; 
		}else if(_scrollTop < _start && _menu.className.indexOf(_classAdd)!=-1){ 
			_menu.className = _classDefault; 
		} 
	} 
})();
//SyntaxHighlighter.config.clipboardSwf = 'syntax/clipboard.swf';
SyntaxHighlighter.all();