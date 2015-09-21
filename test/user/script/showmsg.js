;!(function(window, document, $, undefined){
	var showmsg = function(options){
		var that = this;
		that.options = $.extend(that.options, options||{});
		that.init();
	}

	showmsg.timer = null;

	showmsg.prototype = {
		options:{
			message:'',
			type:'alert',
			animate:'bounceShake',
			duration:2000,
			target:null,
			theme:'',
			callback: null// 新增支持显示完成后的回调功能 add by yanglidong
		},
		init:function(){
			var that = this;
			clearTimeout(showmsg.timer);
			that.hide(true).create();
		},
		create:function(){
			var that = this, 
				options = that.options;
				msg = $('<span class="ui-showmsg ui-animate ui-animate-'+ options.animate +'"><em>'+ options.message +'</em></span>');
			options.theme && msg.addClass(options.theme);
			(options.target && options.type == 'tips') && msg.css(that.offsets());
			that.show(that[options.type](msg));
		},
		alert:function(msg){
			return msg.addClass('ui-showmsg-alert');
		},
		tips:function(msg){
			msg.addClass('ui-showmsg-tips').children().append('<i class="ui-tine"></i>');
			return msg;
		},
		show:function(msg){
			var that = this;
			msg.appendTo('body').on('click', function(){
				that.hide();
			});
			showmsg.timer = setTimeout(function(){
				that.hide();
			}, that.options.duration);
		},
		hide:function(init){
			var that = this, msg = $('.ui-showmsg');
			if(init){
				msg.remove();
			}
			else{
				//消失做动画处理.....
				msg.remove();
			}
			//判断是否传入回调函数，如果传入就执行回调函数。add by yanglidong
			if(typeof that.options.callback === "function"){
				that.options.callback();
			}
			return that;
		},
		offsets:function(){
			var that = this, options = that.options, 
				ofs = options.target.offset(), 
				height = options.target.height();
			ofs.top += height - 5;
			ofs.left += 5;
			return {top:ofs.top, left:ofs.left};
		}
	}
	
	$.extend({
		showmsg:function(options){
			new showmsg(options);
		}
	});
	
})(this, document, jQuery);