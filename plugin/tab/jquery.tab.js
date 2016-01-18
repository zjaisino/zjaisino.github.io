/**
 * @filename jquery.tab.js
 * @author Aniu[2015-06-07 11:06]
 * @update Aniu[2016-01-15 11:06]
 * @version v1.4
 */

$.fn.tab = function(o){
    o = $.extend(true, {
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
         * @func 选项卡是否可滚动
         * @type <Boolean>
         */
        scroll:{
            enable:false,
            horz:true
        },
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
            items = that.children('li'),
            size = items.size(),
            body = me.children('.ui-tabody');
        
        if(o.scroll.enable === true){
            var stes = {
                outer:'outerWidth',
                size:'width',
                m1:'marginLeft',
                m2:'marginRight',
                dir:'left'
            }
            if(o.scroll.horz !== true){
                stes = {
                    outer:'outerHeight',
                    size:'height',
                    m1:'marginTop',
                    m2:'marginBottom',
                    dir:'top'
                }
            }
            o.scroll = $.extend(o.scroll, stes);
            o.auto = false;
            var tabbox = that.wrap('<div class="ui-tabbox"><div class="ui-tabwrap"></div></div>').closest('.ui-tabbox');
            var tabbtn = $('<span class="ui-tabbtn ui-tabbtn-prev" /><span class="ui-tabbtn ui-tabbtn-next" />').appendTo(tabbox);
            that[o.scroll.size](getRize(items) * size);
            tabbtn.click(function(){
                var me = $(this), dir = that.position()[o.scroll.dir];
                var move = Math.abs(dir);
                var size = 0, temp = 0;
                var opts = {};
                if(me.hasClass('ui-tabbtn-prev')){
                    if(move > 0){
                        that.children().each(function(){
                            var me = $(this), mesize = getRize(me);
                            size += mesize;
                            if((temp = move - size) <= 0){
                                if(temp < 0){
                                    temp = move - (size - mesize);
                                }
                                else{
                                    temp = mesize;
                                }
                                return false;
                            }
                        });
                        
                        opts[o.scroll.dir] = dir + temp;
                        !that.is(':animated') && that.animate(opts);
                    }
                }
                else{
                    that.children().each(function(){
                        var me = $(this);
                        size += getRize(me);
                        if((temp = size - (move + tabbox[o.scroll.size]())) > 0){
                            return false;
                        }
                    });
                    if(temp){
                       opts[o.scroll.dir] = dir - temp;
                       !that.is(':animated') && that.animate(opts);
                    }
                }
            });
            
            $(window).resize(function(){
                resize(that);
            }).resize();
            
        }
        
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
            if(!item.attr('once')){
                if(o.endCallback(index, item) === false){
                    item.attr('once', 'true');
                }
            }
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
    
    function getRize(items){
        return items[o.scroll.outer]() + parseFloat(items.css(o.scroll.m1)) + parseFloat(items.css(o.scroll.m2));
    }
    
    function resize(tablist){
        if(o.scroll.enable !== true){
            return;
        }
        var list = tablist.children(), size = 0, move = 0;
        var tabbox = tablist.closest('.ui-tabbox');
        list.each(function(){
            var me = $(this);
            size += getRize(me);
            if(me.hasClass('s-crt')){
                move = size;
            }
        });
        tablist[o.scroll.size](size);
        if(size > tabbox.children('.ui-tabwrap')[o.scroll.size]()){
            tabbox.children('.ui-tabbtn').show();
        }
        else{
            tabbox.children('.ui-tabbtn').hide();
        }
        var temp = 0;
        if(move > tabbox[o.scroll.size]()){
            temp = tabbox[o.scroll.size]() - move;
        }
        var opts = {};
        opts[o.scroll.dir] = temp;
        !tablist.is(':animated') && tablist.animate(opts);
    } 
    
}