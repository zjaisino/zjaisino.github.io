/**
 * @filename jquery.superslide.js
 * @author Aniu[2014-12-15 08:07]
 * @update Aniu[2016-12-02 16:04]
 * @version v1.4.3
 * @description 超级幻灯片
 */

;!(function(window, document, $, undefined){
    var win = $(window);
    var SuperSlide = function(options){
        var that = this;
        that.options = $.extend(true, {
            target:null,
            //自动切换延迟时间
            delay:4000,
            //切换速度
            speed:450,
            //list按钮触发事件
            event:'click',
            //缓动效果，依赖jquery.easing.js
            ease:null,
            //一屏显示数量，<ul class="ui-slide"></ul>中不要使用li标签，会自动生成
            itemNum:0,
            //默认显示第几个
            moveTo:0,
            //切换图片为背景图片，<li data-src="背景图片路径"></li>
            isBackdrop:false,
            //是否以淡入淡出效果显示
            isFadein:false,
            //是否自动切换
            isAuto:true,
            //是否水平切换
            isHorz:true,
            //是否显示标题，<li data-title="文本或者html"></li>
            isTitle:false,
            //是否显示工具栏
            toolbar:{
                enable:false,
                left:'左旋转',
                right:'右旋转',
                zoomin:'放大',
                zoomout:'缩小'
            },
            //圆点按钮配置
            list:{
                //是否启用
                enable:true,
                //是否默认隐藏，鼠标悬停后显示
                isHide:false    
            },
            //左右切换按钮
            button:{
                enable:true,
                //是否默认隐藏，鼠标悬停后显示
                isHide:false
            },
            //相册底部缩略图
            thumb:{
                enable:false,
                //缩略图是否水平切换
                isHorz:true
            },
            //自适应切换
            resize:{
                enable:false,
                //默认全屏切换
                target:win,
                //水平切换表示最小宽度，垂直切换表示最小高度
                minSize:0,
                //窗口大小改变后回调函数
                callback:$.noop
            },
            //非循环滚动
            scroll:{
                enable:false,
                //是否默认显示最后一屏
                isEnd:false,
                //列表是否触发点击事件
                isEvent:true,
                /**
                 * @func 点击事件回调
                 * @param items <jQuery Obejct> 列表集合
                 * @param count <Number> 一屏展示数量
                 * @param index <Number> 一屏中第一个item索引
                 */
                callback:$.noop
            },
            /**
             * @func 切换中的回调函数，若非循环滚动，表示li标签触发event后的回调函数
             * @param index <Number> 当前展示item索引
             * @param item <jQuery Obejct> 当前展示item
             * @param dot <jQuery Obejct> 当前展示选中点控制器
             */
            callback:$.noop,
            /**
             * @func 切换后的回调函数
             * @param index <Number> 当前展示item索引
             * @param item <jQuery Obejct> 当前展示item jquery对象
             * @param dot <jQuery Obejct> 当前展示选中点控制器
             */
            endCallback:$.noop
        }, options);
        that.init();
    }
    
    SuperSlide.prototype = {
        init:function(){
            var that = this, options = that.options, target = options.target.css({position:'relative'});
            that.wrap = target.wrapInner('<div class="ui-slidewrap"></div>').children('.ui-slidewrap');
            that.scroll = that.wrap.children('.ui-slide');
            that.items = that.scroll.children();
            if(options.itemNum > 1){
                var temp;
                that.items.each(function(index){
                    if(index % options.itemNum === 0){
                        temp = $('<li></li>').appendTo(that.scroll);
                    }
                    temp.append($(this));
                });
                that.items = that.scroll.children();
            }
            that.itemSize = that.items.size();
            that.size = options.isHorz === true ? {type:'width', dir:'left'} : {type:'height', dir:'top'};
            that.moveTo = target.data('moveto')||options.moveTo;
            var type = that.size.type, dir = that.size.dir;
            that[type] = target[type]();
            if(options.resize.enable === true){
                var size = options.resize.target[type](), minSize = options.resize.minSize;
                that[type] = size >= minSize ? target[type](size)[type]() : target[type](minSize)[type]();
            }

            if(that.itemSize){
                that.index = 0;
                if(options.scroll.enable !== true){
                    that.items[type](that[type]);
                    that.timer = null;
                    that.createSlide();
                    if(that.moveTo > 0 && that.moveTo < that.itemSize && that.list){
                        that.list.find('span:eq('+ that.moveTo +')')[options.event]();
                    }
                    else{
                       that.slideMove();
                    }
                }
                else{
                    that.createScroll();
                }
                
                if(options.button.enable === true && that.button){
                    if(options.button.isHide === true){
                        target.hover(function(){
                            that.button.fadeIn();
                        }, function(){
                            that.button.stop(true, false).fadeOut();
                        });
                    }
                    else{
                        that.button.show();
                    }
                }
                
                if(options.list.enable === true && options.list.isHide === true && that.list){
                    target.hover(function(){
                        that.list.fadeIn();
                    }, function(){
                        that.list.stop(true, false).fadeOut();
                    });
                }
            }
        },
        createSlide:function(){
            var that = this, options = that.options, target = options.target, listItems = thumbItems ='', list;
            that.items.each(function(i, item){
                item = $(item);
                list = item.data('list') === undefined ? (i+1) : item.data('list');
                listItems += '<span>'+ list +'</span>';
                thumbItems += '<li><img src="'+ item.data('thumb') +'" /><i></i></li>';
            });
            if(options.isTitle === true){
                that.title = $('<div class="ui-slide-title"><span></span></div>').appendTo(target).find('span');
            }
            
            if(options.toolbar.enable === true){
                var tpl = '';
                $.each(options.toolbar, function(key, val){
                    if(key !== 'enable'){
                        if(typeof val === 'object'){
                            tpl += '<span class="barbtn '+ key +'">'+ (val.text||'').replace('{{barid}}', key) +'</span>'
                        }
                        else{
                            tpl += '<span class="barbtn" barid="'+ key +'">'+ val +'</span>'
                        }
                    }
                })
                that.toolbar = $('<div class="ui-slide-toolbar"><span class="toolbar">'+ tpl +'</span></div>').appendTo(target);
                that.toolbarEvent();
                that.bindMove();
            }
            
            that.list = $('<div class="ui-slide-list">'+ listItems +'</div>').appendTo(target);
			
			if(that.itemSize >= 1 && options.thumb.enable === true){
				that.thumb = new SuperSlide({
					target:$('<div class="ui-slide-scroll"><ul class="ui-slide">'+ thumbItems +'</ul></div>').appendTo(target),
					speed:450,
					isHorz:options.thumb.isHorz,
					button:{
						enable:true
					},
					scroll:{
						enable:true
					},
					callback:function(index){
						that.thumbClick = true;
						that.index = index;
						that.slideMove();
					}
				});
			}
            
            if(that.itemSize > 1){
                
                if(options.button.enable === true){
                    that.button = $('<span class="ui-slide-btn ui-slide-prev"></span><span class="ui-slide-btn ui-slide-next"></span>').appendTo(target);
                }
                
                if(options.isFadein !== true){
                    var oneItem = that.items.eq(0);
                    if(options.isBackdrop === true){
                        oneItem.css({backgroundImage:'url('+ oneItem.data('src') +')'});
                    }
                    else{
                       oneItem.find('img').each(function(){
                            var crt = $(this);
                            if(!crt.attr('src')){
                                crt.attr('src', crt.data('src'))
                                crt.load(function(e){
                                    if(typeof options.load === 'function'){
                                        options.load(0, oneItem)
                                    }
                                })
                            }
                        });
                    }
                    that.scroll.append(oneItem.clone())[that.size.type]((that.itemSize+1)*that[that.size.type]);
                    that.items = that.scroll.children();
                }
                else{
                    that.scroll.css({position:'relative'});
                    that.items.css({position:'absolute'}).hide();
                }

                that.slideEvent();
            }
            else{
                options.list.enable = false;
            }
            
            if(options.list.enable !== true){
                that.list.hide();
            }
            
            return that;
        },
        toolbarEvent:function(){
            var that = this, options = that.options;
            var angle = 0;
            that.toolbar.on('click', '[barid]', function(e){
                var me = $(this);
                var barid = me.attr('barid');
                var opts = options.toolbar[barid];
                var img = that.scroll.find('img:visible');
                var imgdom = img.get(0);
                if(typeof opts === 'object' && typeof opts.callback === 'function'){
                    opts.callback.call(this, e)
                }
                else if(barid === 'left' || barid === 'right'){
                    if(barid === 'left'){
                        if(--angle < 0){
                            angle = 3
                        }
                    }
                    else{
                        if(++angle > 3){
                            angle = 0
                        }
                    }
                    img.css('max-width', '100%');
                    img.css('max-height', '100%');
                    var deg = angle*90;
                    $.each(['webkit', 'moz', 'ms', 'o', ''], function(key, val){
                        imgdom.style['-'+val+'-transform'] = 'rotate('+ deg +'deg)';
                        imgdom.style[val+'Transform'] = 'rotate('+ deg +'deg)';
                        imgdom.style['transform-origin'] = '50% 50%';
                    })
                    if($.browser.msie && $.browser.version <= '8.0'){
                        imgdom.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(rotation='+ angle +')';　
                    }
                    if(typeof options.rotate === 'function'){
                        options.rotate(img, angle)
                    }
                    that.reset(img, true);
                }
                else if(barid === 'zoomin' || barid === 'zoomout'){
                    var width = img.width();
                    var height = img.height();
                    if(barid === 'zoomin'){
                        width += width*0.2;
                        height += height*0.2;
                    }
                    else{
                        width *= 0.8;
                        height *= 0.8;
                    }
                    img.css('width', width);
                    img.css('max-width', width);
                    img.css('height', height);
                    img.css('max-height', height);
                    if(!that.ismove){
                        img.css('margin-left', -width/2)
                        img.css('margin-top', -height/2)
                    }
                }
            })
        },
        reset:function(img, flag){
            var that = this;
            if(img.length && typeof that.ismove !== 'undefined'){
                if(!flag){
                    var imgdom = img.get(0);
                    img.css('max-width', '100%');
                    img.css('max-height', '100%');
                    $.each(['webkit', 'moz', 'ms', 'o', ''], function(key, val){
                        imgdom.style['-'+val+'-transform'] = 'rotate(0deg)';
                        imgdom.style[val+'Transform'] = 'rotate(0deg)';
                        imgdom.style['transform-origin'] = '50% 50%';
                    })
                    if($.browser.msie && $.browser.version <= '8.0'){
                        imgdom.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(rotation=0)';　
                    }
                    that.ismove = false;
                }
                img.css('width', 'auto');
                img.css('height', 'auto');
                img.css('margin-left', -img.width()/2);
                img.css('margin-top', -img.height()/2);
            }
        },
        bindMove:function(){
            var that = this, options = that.options;
            var img = that.scroll.find('img');
            var flag = false;
            var x = 0;
            var y = 0;
            var wrap = img.parent();
            var ele = $();
            that.ismove = false;
            img.on('mousedown', function(e){
                flag = true;
                x = e.pageX;
                y = e.pageY;
                ele = $(this).addClass('move');
                return false;
            })
            that.scroll.on('mousemove', function(e){
                if(flag){
                    that.ismove = true;
                    ele.css('margin-top', parseFloat(ele.css('marginTop')) + (e.pageY - y))
                    ele.css('margin-left', parseFloat(ele.css('marginLeft')) + (e.pageX - x))
                    x = e.pageX;
                    y = e.pageY;
                    return false
                }
            })
            that.scroll.on('mouseup', function(){
                if(flag){
                    flag = false;
                    ele.removeClass('move')
                }
            })
        },
        slideEvent:function(){
            var that = this, options = that.options, target = options.target;
            that.list.on(options.event || 'click', 'span', function(){
                that.thumbClick = false;
                that.index = $(this).index();
                that.slideMove();
            });
            that.button && that.button.click(function(){
                that.thumbClick = false;
                if($(this).hasClass('ui-slide-prev')){
                    if(options.thumb.enable === true && that.index == 0){
                        return false;
                    }
                    that.slidePrev();
                }
                else{
                    if(options.thumb.enable === true && that.index == that.itemSize-1){
                        return false;
                    }
                    that.slideNext();
                }
            });
            if(options.resize.enable === true){
                var size, minSize, type = that.size.type, dir = that.size.dir;
                win.resize(function(){
                    size = options.resize.target[type]();
                    minSize = options.resize.minSize;
                    that[type] = size >= minSize ? target[type](size)[type]() : target[type](minSize)[type]();
                    that.items[type](that[type]);
                    if(options.isFadein !== true){
                        that.scroll.css(dir, -that.index*that[type])[type](that[type]*(that.itemSize+1));
                    }
                    typeof options.resize.callback === 'function' && options.resize.callback();
                });
            }
            if(options.isAuto === true){
                that.autoplay();
                target.hover(function(){
                    clearInterval(that.timer);
                }, function(){
                    that.autoplay();
                });
            }
            return that;
        },
        slideMove:function(isPrev){
            var that = this, options = that.options, index = that.index, item = that.items.eq(index), crt;
            var dot = that.list.children('span:eq('+ index +')');
            that.reset(item.prev().find('img'));
            if(!that.thumbClick && options.thumb.enable === true){
                var thumb = that.thumb, thumbLeft = Math.abs(thumb.scroll.position()[thumb.setting.dir]),
                    thumbNum = (thumbLeft+(thumb.cOutline))/thumb.outline;
                if(isPrev === true && thumbNum-thumb.count == index+1){
                    thumb.button.first().click();
                }
                else if(index === thumbNum){
                    thumb.button.last().click();
                }
                thumb.items.eq(index).addClass('s-crt').siblings().removeClass('s-crt');
            }
            if(options.isBackdrop === true){
                crt = item;
                crt.css({backgroundImage:'url('+ crt.data('src') +')'});
            }
            else{
                item.find('img').each(function(){
                    crt = $(this);
                    if(!crt.attr('src')){
                        crt.load(function(e){
                            if(typeof options.load === 'function'){
                                options.load(index, item)
                            }
                        })
                        crt.attr('src', crt.data('src'));
                    }
                });
            }
            if(options.isFadein !== true){
                var animate = {};
                animate[that.size.dir] = -index*that[that.size.type];
                that.scroll.stop(true, false).animate(animate, options.speed, options.ease, function(){
                    typeof options.endCallback == 'function' && options.endCallback(index, item, dot);
                });
                animate = null;
            }
            else{
                item.fadeIn(options.speed).siblings().stop(true, false).fadeOut(options.speed, function(){
                    typeof options.endCallback == 'function' && options.endCallback(index, item, dot);
                });
            }
            that.title && that.title.html(item.data('title'));
            index = index < that.itemSize ? index : 0;
            dot = that.list.children('span:eq('+ index +')');
            typeof options.callback == 'function' && options.callback(index, item, dot);
            dot.addClass('s-crt').siblings().removeClass('s-crt');
        },
        slidePrev:function(){
            var that = this, options = that.options;
            if(options.thumb.enable === true && that.index == 0){
                return false;
            }
            if(options.isFadein !== true){
                if(!that.scroll.is(':animated')){
                    if(that.index == 0){
                        that.index = that.itemSize;
                        that.scroll.css(that.size.dir, -that[that.size.type]*that.index);
                    }
                    that.index -= 1;
                    that.slideMove(true);
                }
            }
            else if(!that.items.is(':animated')){
                that.index = that.index == 0 ? that.itemSize-1 : --that.index;
                that.slideMove(true);
            }
        },
        slideNext:function(){
            var that = this, options = that.options;
            if(options.isFadein !== true){
                if(!that.scroll.is(':animated')){
                    if(that.index == that.itemSize){
                        that.index = 0;
                        that.scroll.css(that.size.dir, 0);
                    }
                    that.index += 1;
                    that.slideMove();
                }
            }
            else if(!that.items.is(':animated')){
                that.index = that.index == (that.itemSize-1) ? 0 : ++that.index;
                that.slideMove();
            }
        },
        createScroll:function(isReset){
            var that = this, options = that.options, target = options.target;
            that.setting = {
                dir:'left',
                m1:'marginRight', 
                m2:'marginLeft', 
                outline:'width',
                outer:'outerWidth'
            }
            if(options.isHorz !== true){
                that.setting = {
                    dir:'top',
                    m1:'marginTop',
                    m2:'marginBottom',
                    outline:'height',
                    outer:'outerHeight'
                }
            }
            options.button = {
                enable:true,
                isHide:false
            }
            options.list.enable = false;
            that.button = $('<span class="ui-slide-btn ui-slide-prev"></span><span class="ui-slide-btn ui-slide-next"></span>').appendTo(target);
            that.outline  = that.items[that.setting.outer]() + parseInt(that.items.css(that.setting.m1)) + parseInt(that.items.css(that.setting.m2));
            that.count  = Math.ceil(that.wrap[that.setting.outline]()/that.outline);
            that.cOutline = that.outline*that.count;
            that.scrollVal = that.outline*that.itemSize - that.cOutline;
            that.scroll[that.setting.outline](that.scrollVal + that.cOutline);
            that.button.removeClass('s-crt');
            if(that.itemSize<=that.count){
                that.button.addClass('s-dis');
            }
            if(!isReset){
                that.moveTo = 0;
                that.scrollEvent();
            }
            
            return that;
        },
        scrollEvent:function(){
            var that = this, options = that.options, target;
            that.button.on('click', function(){
                target = $(this);
                if(!target.hasClass('s-dis')){
                    var dir = Math.abs(that.scroll.position()[that.setting.dir]);
                    if(target.hasClass('ui-slide-prev')){
                        if(dir > that.cOutline){
                            if(!that.moveTo){
                                that.index = -that.cOutline;
                            }
                            else{
                                that.index = -that.moveTo;
                                that.moveTo = 0;
                            }
                            that.scrollMove(target, false);
                        }
                        else{
                            that.moveTo = that.index = -dir;    
                            that.scrollMove(target, true);
                        }
                    }
                    else{
                        var sval = that.scrollVal-dir;
                        that.moveTo = Math.abs(that.moveTo);
                        if(sval-that.cOutline>0){
                            if(!that.moveTo){
                                that.index = that.cOutline; 
                            }
                            else{
                                that.index = that.moveTo;
                                that.moveTo = 0;
                            }
                            that.scrollMove(target, false);
                        }
                        else{
                            that.moveTo = that.index = sval;    
                            that.scrollMove(target, true);
                        }   
                    }
                }
            });
            
            options.scroll.isEvent && that.items.on(options.event, function(){
                var me = $(this);
                 typeof options.callback == 'function' && options.callback(me.index(), me);
                 $(this).addClass('s-crt').siblings().removeClass('s-crt');
            });
            if(options.scroll.isEnd === true){
                that.index = that.itemSize*that.outline-that.cOutline;
                that.scrollMove(that.button.last(), true, 0);
            }
            else if(options.moveTo > 0){
                var moveTo = options.moveTo + 1, step = Math.ceil(that.count/2), temp = moveTo-step;
                if(temp <= 0){
                    that.scrollMove(that.button.first(), true, 0);
                }
                else if(temp+step*2 > that.itemSize){
                    that.index = that.itemSize*that.outline-that.cOutline;
                    that.scrollMove(that.button.last(), true, 0);
                }
                else{
                    that.index = temp*that.outline;
                    that.scrollMove(that.button.first(), false, 0);
                }
                options.scroll.isEvent && that.items.eq(options.moveTo)[options.event]();
            }
            else{
                that.scrollMove(that.button.first(), true, 0);
            }
        },
        scrollMove:function(target, isDis, speed){
            var that = this, options = that.options, animate = {};
            speed = speed === undefined ? options.speed : speed;
            if(!that.scroll.is(':animated')){
                animate[that.setting.dir] = '-='+that.index+'px';
                that.scroll.stop(true, false).animate(animate, speed, function(){
                    that.itemSize>that.count && target.siblings('.ui-slide-btn').removeClass('s-dis');
                    if(isDis === true){
                        target.addClass('s-dis');
                    } 
                    options.scroll.callback(that.items, that.count, Math.abs($(this).position()[that.setting.dir]/that.outline));
                });
                animate = null;
            }
        },
        resetItem:function(){
            var that = this;
            that.items = that.scroll.children();
            that.itemSize = that.items.size();
            that.createScroll(true);
        },
        autoplay:function(){
            var that = this, options = that.options;
            that.timer = setInterval(function(){
                that.slideNext();
            }, options.delay);
        }
    }
    
    $.fn.superSlide = function(options){
        options = options || {};
        return this.each(function(){
            options.target = $(this);
            this.set = new SuperSlide(options);
        });
    }
})(this, document, jQuery);