/**
 * FileName: jquery.superslide.js
 * Author: Aniu[date:2014-12-15 08:07]
 * Update: Aniu[date:2015-02-25 08:58]
 * Version: v1.2
 * Description: 超级幻灯片
 */

;!(function(window, document, $, undefined){
    var win = $(window);
    var SuperSlide = function(options){
        var that = this;
        that.options = SuperSlide.extend({
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
            //点按钮配置
            list:{
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
                callback:null
            },
            //非循环滚动
            scroll:{
                enable:false,
                //是否默认显示最后一屏
                isEnd:false,
                isClick:true
            },
            /**
             * @func 切换后的回调函数，若非循环滚动，表示li标签触发event后的回调函数
             * @param index <Number> 触发目标元素索引
             */
            callback:null
        }, options);
        that.init();
    }
    
    SuperSlide.extend = function(options, extend){
        for(var i in extend){
            var value = extend[i];
            if($.isPlainObject(value)){
                for(var m in value){
                    if($.isPlainObject(value[m])){
                        for(var n in value[m]){
                            if(value[m][n] != null){
                                options[i][m][n] = value[m][n];
                            }
                        }
                    }
                    else{
                        if(value[m] != null){
                            options[i][m] = value[m];
                        }       
                    }
                }
            }
            else{
                if(value !== ''){
                    options[i] = value;
                }
            }
        }
        return options;  
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
            that.size = options.isHorz == true ? {type:'width', dir:'left'} : {type:'height', dir:'top'};
            that.moveTo = target.data('moveto')||options.moveTo;
            var type = that.size.type, dir = that.size.dir;
            that[type] = target[type]();
            if(options.resize.enable == true){
                var size = options.resize.target[type](), minSize = options.resize.minSize;
                that[type] = size >= minSize ? target[type](size)[type]() : target[type](minSize)[type]();
            }
            if(options.button.enable == true){
                target.append('<span class="ui-slide-btn ui-slide-prev"></span><span class="ui-slide-btn ui-slide-next"></span>');
            }
            that.button = target.find('.ui-slide-btn');

            if(that.itemSize){
                that.index = 0;
                if(options.button.isHide == true){
                    target.hover(function(){
                        that.button.fadeIn();
                    }, function(){
                        that.button.stop(true, false).fadeOut();
                    });
                }
                else{
                    that.button.show();
                }
                if(options.list.isHide == true){
                    target.hover(function(){
                        that.list.fadeIn();
                    }, function(){
                        that.list.stop(true, false).fadeOut();
                    });
                }
                if(options.scroll.enable != true){
                    that.items[type](that[type]);
                    that.timer = null;
                    that.createSlide();
                    if(that.moveTo > 0 && that.moveTo < that.itemSize){
                        that.list.find('span:eq('+ that.moveTo +')')[options.event]();
                    }
                    else{
                       that.slideMove();
                    }
                }
                else{
                    that.createScroll();
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
            if(options.isTitle == true){
                target.append('<div class="ui-slide-title"><span></span></div>');
            }
            that.title = target.find('.ui-slide-title span');
            that.list = target.find('.ui-slide-list');
            if(that.itemSize > 1){
                target.append('<div class="ui-slide-list">'+ listItems +'</div>');
                if(options.thumb.enable == true){
                    that.thumb = new SuperSlide({
                        target:$('<div class="ui-slide-scroll"><ul class="ui-slide">'+ thumbItems +'</ul></div>').appendTo(target),
                        speed:450,
                        isHorz:options.thumb.isHorz,
                        moveTo:3,
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
                
                that.list = target.find('.ui-slide-list');
                
                if(options.isFadein != true){
                    var oneItem = that.items.eq(0);
                    if(options.isBackdrop == true){
                        oneItem.css({backgroundImage:'url('+ oneItem.data('src') +')'});
                    }
                    else{
                       oneItem.find('img').each(function(){
                            var crt = $(this);
                            !crt.attr('src') && crt.attr('src', crt.data('src'));
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
            return that;
        },
        slideEvent:function(){
            var that = this, options = that.options, target = options.target;
            that.list.on(options.event || 'click', 'span', function(){
                that.thumbClick = false;
                that.index = $(this).index();
                that.slideMove();
            });
            that.button.click(function(){
                that.thumbClick = false;
                if($(this).hasClass('ui-slide-prev')){
                    if(options.thumb.enable == true && that.index == 0){
	                    return false;
	                }
                    that.slidePrev();
                }
                else{
                    if(options.thumb.enable == true && that.index == that.itemSize-1){
	                    return false;
	                }
                    that.slideNext();
                }
            });
            if(options.resize.enable == true){
                var size, minSize, type = that.size.type, dir = that.size.dir;
                win.resize(function(){
                    size = options.resize.target[type]();
                    minSize = options.resize.minSize;
                    that[type] = size >= minSize ? target[type](size)[type]() : target[type](minSize)[type]();
                    that.items[type](that[type]);
                    if(options.isFadein != true){
                        that.scroll.css(dir, -that.index*that[type])[type](that[type]*(that.itemSize+1));
                    }
                    typeof options.resize.callback === 'function' && options.resize.callback();
	            });
            }
            if(options.isAuto == true){
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
            if(!that.thumbClick && options.thumb.enable == true){
                var thumb = that.thumb, thumbLeft = Math.abs(thumb.scroll.position()[thumb.setting.dir]),
                    thumbNum = (thumbLeft+(thumb.cOutline))/thumb.outline;
                if(isPrev == true && thumbNum-thumb.count == index+1){
                    thumb.button.first().click();
                }
                else if(index === thumbNum){
                    thumb.button.last().click();
                }
                thumb.items.eq(index).addClass('s-crt').siblings().removeClass('s-crt');
            }
            if(options.isBackdrop == true){
                crt = item;
                crt.css({backgroundImage:'url('+ crt.data('src') +')'});
            }
            else{
                item.find('img').each(function(){
                    crt = $(this);
                    !crt.attr('src') && crt.attr('src', crt.data('src'));
                });
            }
            if(options.isFadein != true){
                var animate = {};
                animate[that.size.dir] = -index*that[that.size.type];
                that.scroll.stop(true, false).animate(animate, options.speed, options.ease);
                animate = null;
            }
            else{
                item.fadeIn(options.speed).siblings().stop(true, false).fadeOut(options.speed);
            }
            that.title.html(item.data('title'));
            index = index < that.itemSize ? index : 0;
            typeof options.callback == 'function' && options.callback(index);
            that.list.children('span:eq('+ index +')').addClass('s-crt').siblings().removeClass('s-crt');
        },
        slidePrev:function(){
            var that = this, options = that.options;
            if(options.thumb.enable == true && that.index == 0){
                return false;
            }
            if(options.isFadein != true){
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
            if(options.isFadein != true){
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
                margin:'marginRight', 
                outline:'width',
                outer:'outerWidth'
            }
            if(options.isHorz != true){
                that.setting = {
                    dir:'top',
                    margin:'marginBottom',
                    outline:'height',
                    outer:'outerHeight'
                }
            }
            that.outline  = that.items[that.setting.outer]() + parseInt(that.items.css(that.setting.margin));
			that.count  = Math.ceil(that.wrap[that.setting.outline]()/that.outline);
			that.cOutline = that.outline*that.count;
			that.scrollVal = that.outline*that.itemSize - that.cOutline;
            that.scroll[that.setting.outline](that.scrollVal + that.cOutline);
            if(!isReset){
            	that.moveTo = 0;
                if(that.itemSize<=that.count){
                    that.button.addClass('s-dis');
                }
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
						if(sval-that.cOutline>=0){
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
            
            options.scroll.isClick && that.items.on(options.event, function(){
                 typeof options.callback == 'function' && options.callback($(this).index());
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
                options.scroll.isClick && that.items.eq(options.moveTo)[options.event]();
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
					if(isDis == true){
						target.addClass('s-dis');
					} 
				});
                animate = null;
			}
        },
        resetItem:function(){
        	var that = this;
        	that.items = that.scroll.children();
        	that.itemSize = that.items.size();
            alert(that.itemSize);
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
    		$.extend(this, new SuperSlide(options));
    	});
    }
})(this, document, jQuery);