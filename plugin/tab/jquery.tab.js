$.fn.tab = function(o){
	o = $.extend({
		event:'click',
		auto:false,
		delay:4000,
		index:0,
		content:'',
		ajax:$.noop,
		callback:null
	}, o||{});
	
	return this.each(function(){
		$(this).append('<div class="ui-tabody"></div>');
		var index = 0, timer1 = timer2 = null,
			that = $(this).children('.ui-tab').show(),
			size = that.children('li').size(),
			body = $(this).children('.ui-tabody');
		
		that.children('li').children('a').siblings().appendTo(body).hide();
		
		that.children('li').each(function(i){
			$(this).on(o.event, function(){
				if(o.event == 'click'){
					show(i);
				}
				else{
					timer1 = setTimeout(function(){
						show(i);
					}, 150);
				}
				index = i;	
			});
		}).eq(o.index).trigger(o.event);
		
		if(o.event === 'mouseover'){
			that.on('mouseout', 'li', function(){
				clearTimeout(timer1);
			});
		}
		
		function show(index){
			var item = body.children(':eq(' + index + ')'), img = item.find('img'), content = o.content ? item.find(o.content).children()[0] : item.children()[0];
			if(typeof o.callback === 'function' && o.callback(index, item) === false){
                return false;
            }
            !content && o.ajax(index, item);
			(!!img.data('src') && (img.attr('src') !== img.data('src'))) && img.attr('src', img.data('src'));
			that.children('li:eq(' + index + ')').addClass('s-crt').siblings().removeClass('s-crt');
			item.show().siblings().hide();
		} 

		if(o.auto == true){
			timer2 = setInterval(function(){
				index < size - 1 ? index++ : index = 0;
				show(index);
			}, o.delay);
			
			$(this).hover(function(){
				clearInterval(timer2);
			},function(){
				timer2 = setInterval(function(){
					index < size - 1 ? index++ : index = 0;
					show(index);
				}, o.delay);
			});
		}
	});
}