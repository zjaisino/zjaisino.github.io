/**
 * Copyright(C), 2013-2014 ZheJiang Aisino Spaceflight Technology Co., Ltd.
 * FileName: jquery.slide.js
 * Author: Aniu[date:2014-03-25 08:57]
 * Update: Aniu[date:2014-08-08 13:47]
 * Version: v2.3
 */
$.fn.slide = function(o){
    o = $.extend({
        resize:false,
        resizeRarget:$(window),
        backdrop:false,
        width:1000,
        delay:4000,
        speed:450,
        event:'click',
        button:{
			isHide:true,
			enable:true
		},
        fadeIn:false,
        title:false,
        thumb:false,
        auto:true,
        ease:null,
        callback:null,
        resizeCallback:null
    }, o||{});
    
    return this.each(function(){
        var __this = this,
        	_this = $(__this).css({position:'relative'}),
        	self = _this.wrapInner('<div class="ui-slidewrap"></div>').children('.ui-slidewrap'),
            width = ((o.resizeRarget.width() >= o.width) && o.resize) ? o.resizeRarget.width() : self.width(o.width).width(),
        	scroll = self.children('.ui-slide'),
            size = scroll.children('li').width(width).size(),
            list = thumb = '',
            timer = null,
        	li0 = scroll.children('li:eq(0)');
            
        if(size > 0){
            var title = '';
			for(var i=1; i<=size; i++){
				list += '<b>'+ ((title = scroll.find('li:eq('+ (i-1) +')').data('title')) !== undefined ? title : i) +'</b>';
				thumb += '<span><img src="'+ scroll.find('li:eq('+(i-1)+') img').data('thumb') +'" /><i></i></span>';
			}
			if(o.fadeIn === true){
				self.css({overflow:'visible'});
			}
			if(o.title === true){
				self.append('<div class="ui-slide-title"><span></span></div>');
			}
	        if(o.resize === true){
                window.slideTimer = null;
	            $(window).resize(function(){
                    clearTimeout(window.slideTimer);
                    window.slideTimer = setTimeout(function(){
                        width = o.resizeRarget.width() >= o.width ? self.width(o.resizeRarget.width()).width() : self.width(o.width).width();
                        if(!o.fadeIn){
                            scroll.css({left:-__this.index*width}).width(width*(size+1));
                        }
                        scroll.children('li').width(width);
                        typeof o.resizeCallback === 'function' && o.resizeCallback();
                    }, 0);
	            });
	        }
	        if(o.thumb === true){
	            $('<div class="ui-slide-thumb">\
	                <div class="ui-slide-thumbtn ui-slide-thumb-prev s-dis"></div>\
	                <div class="ui-slide-thumbtn ui-slide-thumb-next"></div>\
	                <div class="ui-slide-thumb-img"><p>'+ thumb +'</p></div>\
	            </div>').appendTo(_this);
	            var thumb       = _this.children('.ui-slide-thumb'),
					thumbWrap   = thumb.children('.ui-slide-thumb-img'),
	                thumbScroll = thumbWrap.children('p'),
	                thumButton  = thumb.children('.ui-slide-thumbtn'),
	                thumbItems  = thumbScroll.children('span'),
	                thumbSize   = thumbItems.size(),
	                thumbWidth  = thumbItems.outerWidth() + parseInt(thumbItems.css('marginRight')),
	                thumbCount  = Math.ceil(thumbWrap.width()/thumbWidth), 
	                thumbCwidth = thumbWidth*thumbCount,
	                offset = 0,
					pbtm = thumb.outerHeight() + parseInt(thumb.css('marginTop')) + parseInt(thumb.css('marginBottom'));
				if(($.browser.msie && $.browser.version !== '6.0') || !$.browser.msie){
					_this.css('paddingBottom', pbtm);
				}
	            thumbScroll.width(thumbWidth*thumbSize);
	            if(thumbSize<=thumbCount || !thumbSize){
	                thumButton.addClass('s-dis');
	            }
	            thumButton.on('click', function(){
	                if(!$(this).hasClass('s-dis')){
	                    var thumBtn = $(this),
	                        thumbLeft = Math.abs(thumbScroll.position().left),
	                        thumbNum = (thumbLeft+(thumbCwidth))/thumbWidth;
	                    if(thumBtn.hasClass('ui-slide-thumb-prev')){
	                        if(thumbNum-thumbCount > thumbCount){
	                            offset = -thumbCwidth;
	                            thumbMove(thumBtn, offset);
	                        }
	                        else{
	                            offset = -(thumbNum-thumbCount)*thumbWidth;
	                            thumbMove(thumBtn, offset, true);
	                        }
	                        thumb.find('.ui-slide-thumb-img span:eq('+ (thumbLeft/thumbWidth-1) +')').click();
	                    }
	                    else{
	                        if(thumbSize-thumbNum > thumbCount){
	                            offset = thumbCwidth;
	                            thumbMove(thumBtn, offset);
	                        }
	                        else{
	                            offset = (thumbSize-thumbNum)*thumbWidth;
	                            thumbMove(thumBtn, offset, true);
	                        }
	                        thumb.find('.ui-slide-thumb-img span:eq('+ thumbNum +')').click();
	                    }
	                }
	            });
	            function thumbMove(obj, offset, disabled){
	                if(!thumbScroll.is(':animated')){
	                    thumbScroll.animate({left:'-='+offset+'px'}, 450, function(){
	                        obj.siblings('.ui-slide-thumbtn').removeClass('s-dis');
	                        if(disabled){
	                            obj.addClass('s-dis');
	                        }   
	                    });
	                }
	            }
	        }
	        
	        this.index = 0;
	        this.prev = function(){
	        	if((!scroll.is(':animated') && !o.fadeIn) || o.fadeIn){
					if(!o.fadeIn){
						if(this.index == 0){
							this.index = size;
							scroll.css({left:-width*this.index});
						}
						this.index -= 1;
					}
					else{
						this.index = this.index == 0 ? size-1 : --this.index;
					}
	                this.move('prev');
	            }
	        }
	        this.next = function(){
	            if((!scroll.is(':animated') && !o.fadeIn) || o.fadeIn){
					if(!o.fadeIn){
						if(this.index == size){
							this.index = 0;
							scroll.css({left:0});
						}
						this.index += 1;
					}
					else{
						this.index = this.index == (size-1) ? 0 : ++this.index;
					}
	                this.move('next');
	            }
	        }
	        this.click = function(index){
	            this.index = index;
	            this.move();
	        }
	        this.move = function(pos){
	        	var index = this.index;
	            if(o.thumb){
	                var thumbLeft = Math.abs(thumbScroll.position().left),
	                    thumbNum = (thumbLeft+(thumbCwidth))/thumbWidth;
	                if(pos === 'next' && index === thumbNum){
	                    _this.find('.ui-slide-thumb-next').click();
	                }
	                else if(pos === 'prev' && thumbNum-thumbCount == index+1){
	                    _this.find('.ui-slide-thumb-prev').click();
	                }
	            }
	            if(o.backdrop){
                    var li = scroll.find('li:eq('+ index +')'), child = li.children(), src = li.data('src');
                    child.css('backgroundImage').lastIndexOf(src) == -1  && child.css({backgroundImage:'url('+ src +')', backgroundRepeat:'no-repeat', backgroundPosition:'center'});
                }
                else{
                    var img = scroll.find('li:eq('+ index +') img');
                    (!!img.data('src') && (img.attr('src') !== img.data('src'))) && img.attr('src', img.data('src'));
                }
	            if(!o.fadeIn){
					scroll.stop(true, false).animate({left:-index*width}, o.speed, o.ease)
				}
				else{
					scroll.children('li:eq('+ index +')').fadeIn(o.speed).siblings().fadeOut(o.speed);
				}
	            (o.title === true) && self.find('.ui-slide-title span').html(scroll.find('li:eq('+index+') img').attr('alt'));
                index = index < size ? index : 0;
                typeof o.callback === 'function' && o.callback(index);
	            _this.find('.ui-slide-thumb-img span:eq('+ index +')').addClass('s-crt').siblings().removeClass('s-crt');
	            _this.find('.ui-slide-list b:eq('+ index +')').addClass('s-crt').siblings().removeClass('s-crt');
	        }
	        this.auto = function(){
	            timer = setInterval(function(){
	            	__this.next();
	            }, o.delay);
	        }
	        
	        if(size > 1){
                $('<div class="ui-slide-list">'+ list +'</div>').appendTo(_this).on(o.event, 'b', function(){
                    __this.click($(this).index());
                });
	        	
	        	o.button.enable && $('<a href="javascript:void(0);" class="ui-slide-btn ui-slide-prev"></a><a href="javascript:void(0);" class="ui-slide-btn ui-slide-next"></a>').appendTo(_this);
	        	
	        	if(!o.fadeIn){
                    if(o.backdrop){
                        var src = li0.data('src');
                        scroll.append(li0.children().css({backgroundImage:'url('+ src +')', backgroundRepeat:'no-repeat', backgroundPosition:'center'}).end().clone());
                    }
                    else{
                       scroll.append(li0.find('img').attr('src', li0.find('img').data('src')).end().clone()); 
                    }
					scroll.width((size+1)*width);
				}
				else{
					scroll.css({position:'relative'}).children('li').css({position:'absolute'}).hide();
				}
	        	
	        	_this.find('.ui-slide-thumb-img').on('click', 'span', function(){
	        		__this.click($(this).index());
	            });

	            _this.find('.ui-slide-prev').click(function(){
	                if(o.thumb && __this.index == 0){
	                    return false;
	                }
	                __this.prev();
	            });
	
	            _this.find('.ui-slide-next').click(function(){
	                if(o.thumb && __this.index == size-1){
	                    return false;
	                }
	                __this.next();
	            });
	            
				if(o.button.isHide){
					_this.hover(function(){
						$(this).find('.ui-slide-btn').fadeIn();
					}, function(){
						$(this).find('.ui-slide-btn').stop(true, false).fadeOut();
					});
				}
				else{
					_this.find('.ui-slide-btn').show();
				}
	
	            if(o.auto === true){
	                this.auto();
	                _this.hover(function(){
	                    clearInterval(timer);
	                }, function(){
	                    __this.auto();
	                });
	            }
	        }
	        this.click(0);
        }
    });
}