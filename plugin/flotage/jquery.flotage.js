/**
 * FileName: jquery.flotage.js
 * Author: Aniu[date:2014-12-08 08:46]
 * Update: Aniu[date:2014-12-08 08:46]
 * Version: v1.1 beta
 * Description: 漂浮物组件
 */
 
$.fn.flotage = function(o){
	o = $.extend({
        count:25,
        delay:1000,
        speed:12400,
        window:$(window),
        initStyle:{
            color:'#fff'
        },
        endStyle:null,
        createHtml:function(){
            return '<span>&#10052;</span>';
        },
        handleCallback:function(item){
            var rand = Math.ceil(Math.random() * 16) + 12;
            item.css({fontSize:rand});
        }
    }, o||{});
	return this.each(function(){
		var target = $(this).css({position:'relative'}),
            count = o.count - 1,
            width  = (o.window && o.window.width()) || target.width(),
            height = (o.window && o.window.height()) || target.height(),
            initStyle = $.extend({position:'absolute', top:-50, zIndex:99999, opacity:1}, o.initStyle),
            endStyle = $.extend({top:height, opacity:0}, o.endStyle),
            html = '',
            items, i;
            
        for(i=0; i<=count; i++){
            html += o.createHtml();
        }
        items = $(html).appendTo(target).css(initStyle);
        
        function handleItem(index) {
            var item = items.eq(index).css(initStyle),
                itemWidth, randWidth;
            o.handleCallback(item);
            itemWidth = item.width();
            randWidth = Math.floor(Math.random() * width);
            if ((randWidth + itemWidth) >= width) {
                randWidth = randWidth - itemWidth;
            }
            item.css({left:randWidth}).animate(endStyle, o.speed);
        }
        
        function running(){
            var i = 0;
            setTimeout(function call(){
                handleItem(i);
                i = ++i%count;
                setTimeout(call, o.delay);
            }, 0);
        }
        running();
	});
}