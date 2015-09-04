$.fn.scroll = function(o){
	o = $.extend({
		isEnd:false,
        isVertical:false
    }, o||{});
	return this.each(function(){
        var data = {
            dir:'left',
            margin:'marginRight', 
            outline:'width',
            outer:'outerWidth'
        }
        if(o.isVertical === true){
            data = {
                dir:'top',
                margin:'marginBottom',
                outline:'height',
                outer:'outerHeight'
            }
        }
		$(this).find('.ui-scroll').wrapAll('<div class="ui-scrollwrap"></div>')
			.end().append('<div class="ui-scrollbtn ui-scrollbtn-prev"></div><div class="ui-scrollbtn ui-scrollbtn-next"></div>');
		var that   = $(this),
			scroll = that.find('.ui-scroll'),
			button = that.children('.ui-scrollbtn'),
			wrap   = that.children('.ui-scrollwrap'),
			items  = scroll.children('li'),
			size   = items.size(),
			outline  = items[data.outer]() + parseInt(items.css(data.margin)),
			count  = Math.ceil(wrap[data.outline]()/outline), 
			cOutline = outline*count,
			offset = 0;
		scroll[data.outline](outline*size);
		that.css('position', 'relative');
		if(size<=count || !size){
			button.addClass('s-dis');
			return false;
		}
		
		button.on('click', function(){
			if(!$(this).hasClass('s-dis')){
				var btn = $(this),
					dir = Math.abs(scroll.position()[data.dir]),
					num = (dir+(cOutline))/outline;
				if(btn.hasClass('ui-scrollbtn-prev')){
					if(num-count > count){
						offset = -cOutline;
						move(btn, offset);
					}
					else{
						offset = -(num-count)*outline;
						move(btn, offset, true);
					}
				}
				else{
					if(size-num > count){
						offset = cOutline;
						move(btn, offset);
					}
					else{
						offset = (size-num)*outline;
						move(btn, offset, true);
					}
					
				}
				
			}
		});
		
		if(o.isEnd === true){
			$(this).find('.ui-scrollbtn-next').addClass('s-dis');
			var posDir = -size*outline+cOutline;
			scroll.css(data.dir, posDir);
		}
		else{
			$(this).find('.ui-scrollbtn-prev').addClass('s-dis');
		}
		
		function move(obj, offset, disabled){
			if(!scroll.is(':animated')){
                var animate = {};
                animate[data.dir] = '-='+offset+'px';
				scroll.animate(animate, 450, function(){
					obj.siblings('.ui-scrollbtn').removeClass('s-dis');
					if(disabled){
						obj.addClass('s-dis');
					}   
				});
			}
		}
	});
}