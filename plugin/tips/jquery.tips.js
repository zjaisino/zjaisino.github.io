$.fn.tips = function(o){
	o = $.extend({
		isVal:true,
		style:{}
	}, o||{});
	return this.each(function(){
		var that = $(this), tips = that.data('tips');
		if(!!tips){
			if(o.isVal){
				var arr = tips.split('|'), i = 0, len = arr.length;
				for(i; i<len; i++){
					arr[i] = $.trim(arr[i]);
				}
				if(len==1 || (!arr[1] && !arr[2])){
					arr[1] = '#999';
					arr[2] = '#333';
				}
				if(!arr[0]){return;}
				$(this).focus(function(){
					$.trim($(this).val()) == arr[0] && $(this).val('').css({color:arr[2]});
				}).blur(function(){
					($.trim($(this).val()) == '' || $.trim($(this).val()) == arr[0]) && $(this).val(arr[0]).css({color:arr[1]});
				}).blur();
			}
			else{
				var data = {
					pleft:parseInt(that.css('paddingLeft')),
					ptop:parseInt(that.css('paddingTop')),
					height:that.outerHeight()
				};
				var style = $.extend({
					position:'absolute',
					left:data.pleft,
					top:data.ptop,
					height:data.height,
					lineHeight:data.height+'px'
				}, o.style),
				tip = that.wrap('<strong />').after('<b>'+ tips +'</b>').parent().css({
					position:'relative',
					display:'inline-block',
					width:'100%',
					overflow:'hidden'
				}).children('b');
				if(that.is('textarea')){
					style = $.extend(style, {lineHeight:'normal', height:'auto'});
				}
				tip.css(style).on('click', function(){
					that.focus();
				});
				
				that.on('focus', function(){
					tip.stop(false, true).animate({left:data.pleft+10, opacity:'0.5'});
				}).on('blur', function(){
					var val = $.trim($(this).val());
					if(val == tips || !val){
						$(this).val('');
						tip.animate({left:data.pleft, opacity:'1'});
					}
					else{
						tip.hide();
					}
				}).on('keyup', function(){
					$.trim($(this).val()) ? tip.hide() : tip.show();
				}).blur();
			}
		}
	});
}