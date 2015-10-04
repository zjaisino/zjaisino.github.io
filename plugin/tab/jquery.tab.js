/**
 * @fileName jquery.tab.js
 * @author Aniu[date:2014-04-21 09:46]
 * @update Aniu[date:2015-06-07 15:21]
 * @version v1.3
 * @description 选项卡
 */

$.fn.tab = function(o){
	o = $.extend({
		/**
		 * @function 触发事件 click/mouseover
		 * @type <String>
		 */
		event:'click',
		/**
		 * @function 是否自动切换 true/false
		 * @type <Boolean>
		 */
		auto:false,
		/**
		 * @function 自动切换延迟时间
		 * @type <Number>
		 */
		delay:4000,
		/**
		 * @function 默认展示菜单索引
		 * @type <Number>
		 */
		index:0,
		/**
		 * @function 指定ajax数据容器元素，为空则指向最外层容器
		 * @type <String>
		 */
		content:'',
		/**
		 * @function ajax请求数据
		 * @type <Function>
		 * @return <Undefined>
		 * @param index <Number> 展示状态选项卡索引
		 * @param item <jQuery Object> 展示内容区域容器对象
		 */
		ajax:$.noop,
		/**
		 * @function 展示内容之前回调函数
		 * @type <Function>
		 * @return <Boolean>
		 * @param index <Number> 展示状态选项卡索引
		 * @param item <jQuery Object> 展示内容区域容器对象
		 * @desc 返回false则不展示对应内容区域
		 */
		callback:$.noop,
		/**
		 * @function 展示内容之后回调函数
		 * @type <Function>
		 * @return <Undefined>
		 * @param index <Number> 展示状态选项卡索引
		 * @param item <jQuery Object> 展示内容区域容器对象
		 */
        endCallback:$.noop
	}, o||{});
	
	return this.each(function(){
        var _this = this, me = $(_this);
		me.append('<div class="ui-tabody"></div>');
		var index = 0, timer1 = timer2 = null,
			that = me.children('.ui-tab').show(),
			size = that.children('li').size(),
			body = me.children('.ui-tabody');
            
        _this.addItem = function(data){
            if($.isArray(data)){
                var i = 0, len = data.length, temp, btn;
                for(i; i<len; i++){
                    temp = data[i];
                    temp.tabmenu && (btn = $(temp.tabmenu).appendTo(that));
                    temp.tabcon && $(temp.tabcon).appendTo(body).hide();
                }
                return btn;
            }
        }
        
        _this.removeItem = function(index, nextall){
            if(!nextall){
                that.children().eq(index).remove();
                body.children().eq(index).remove();
            }
            else{
                that.children().eq(index).nextAll().remove();
                body.children().eq(index).nextAll().remove();
            }
        }
		
		that.children('li').children('a').siblings().appendTo(body).hide();
		
        that.on(o.event, 'li', function(){
            var i = $(this).index();
            if(o.event == 'click'){
                show(i);
            }
            else{
                timer1 = setTimeout(function(){
                    show(i);
                }, 150);
            }
            index = i;	
        }).children().eq(o.index).trigger(o.event);
		
		if(o.event === 'mouseover'){
			that.on('mouseout', 'li', function(){
				clearTimeout(timer1);
			});
		}
		
		function show(index){
			var item = body.children(':eq(' + index + ')'), img = item.find('img'), content = o.content ? item.find(o.content).children()[0] : item.children()[0];
			if(o.callback(index, item) === false){
                return false;
            }
            !content && o.ajax(index, item);
			(!!img.data('src') && (img.attr('src') !== img.data('src'))) && img.attr('src', img.data('src'));
			that.children('li:eq(' + index + ')').addClass('s-crt').siblings().removeClass('s-crt');
			item.show().siblings().hide();
            o.endCallback(index, item);
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