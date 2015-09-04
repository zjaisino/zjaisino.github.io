/**
 * Copyright(C), 2013-2014 ZheJiang Aisino Spaceflight Technology Co., Ltd.
 * FileName: jquery.slide.js
 * Author: Aniu[date:2014-03-25 08:57]
 * Update: Aniu[date:2014-05-05 12:05]
 * Version: v2.1.1
 */
$.fn.slide = function(o){
    o = $.extend({
        resize:false,
        backdrop:false,
        width:1000,
        delay:4000,
        speed:450,
        button:true,
        fadeIn:false,
        title:false,
        thumb:false,
        auto:true,
        ease:null
    }, o||{});
    
    return this.each(function(){
        $(this).wrapInner('<div class="ui-slidewrap"></div>');
        var _this = $(this),
            self = $(this).children('.ui-slidewrap'),
            width = (($(window).width() >= o.width) && o.resize) ? $(window).width() : self.width(o.width).width();
        var scroll = self.children('.ui-slide'),
            size = scroll.children('li').width(width).size(),
            list = thumb = '';
        if(o.resize){
            $(window).resize(function(){
                width = $(this).width() >= o.width ? self.width($(this).width()).width() : self.width(o.width).width();
				if(!o.fadeIn){
					scroll.css({left:-config.index*width}).width(width*(size+1));
				}
				scroll.children('li').width(width);
            });
        }

        for(var i=1; i<=size; i++){
            list += '<b>'+ i +'</b>';
            thumb += '<span><img src="'+ scroll.find('li:eq('+(i-1)+') img').data('thumb') +'" /><i></i></span>';
        }
        $('<div class="ui-slide-list">'+ list +'</div>').appendTo(self);
        if(o.thumb){
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
        
        var config = {
                index : 0,
                timer : null,
                timer2 : null,
                showCount:0,
                btns : '<a href="javascript:void(0);" class="ui-slide-btn ui-slide-prev"></a><a href="javascript:void(0);" class="ui-slide-btn ui-slide-next"></a>',
                title : '<div class="ui-slide-title"><span></span></div>',
                prev : function(){
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
                },
                next : function(){
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
                },
                click : function(index){
                    this.index = index;
                    this.move();
                },
                move : function(pos){
                    var that = this;
                    if(o.thumb){
                        var thumbLeft = Math.abs(thumbScroll.position().left),
                            thumbNum = (thumbLeft+(thumbCwidth))/thumbWidth;
                        if(pos === 'next' && this.index === thumbNum){
                            _this.find('.ui-slide-thumb-next').click();
                        }
                        else if(pos === 'prev' && thumbNum-thumbCount == this.index+1){
                            _this.find('.ui-slide-thumb-prev').click();
                        }
                    }
                    
                    clearTimeout(this.timer2);
                    this.timer2 = setTimeout(function(){
                        if(o.backdrop){
                            var li = scroll.find('li:eq('+ that.index +') a'), src = li.data('src');
                            li.css('backgroundImage').lastIndexOf(src) == -1  && li.css({'background':'url('+ src +') no-repeat center'});
                        }
                        else{
                            var img = scroll.find('li:eq('+ that.index +') img');
                            (!!img.data('src') && (img.attr('src') !== img.data('src'))) && img.attr('src', img.data('src'));
                        }
                    }, 0);
                    if(!o.fadeIn){
						scroll.stop(true, false).animate({left:-this.index*width}, o.speed, o.ease)
					}
					else{
						scroll.children('li:eq('+ this.index +')').fadeIn(o.speed).siblings().fadeOut(o.speed);
					}
                    (o.title === true) && self.find('.ui-slide-title span').text(scroll.find('li:eq('+this.index+') img').attr('alt'));
                    _this.find('.ui-slide-thumb-img span:eq('+ (this.index < size ? this.index : 0 ) +')').addClass('s-crt').siblings().removeClass('s-crt');
                    self.find('.ui-slide-list b:eq('+ (this.index < size ? this.index : 0 )+')').addClass('s-crt').siblings().removeClass('s-crt');
                },
                auto : function(){
                    var that = this;
                    this.timer = setInterval(function(){
                        that.next();
                    }, o.delay);
                },
                init : function(){
                    var that = this, li0 = scroll.children('li:eq(0)');

                    o.button && $(this.btns).appendTo(self);
                    
                    if(o.title === true){
                        $(this.title).appendTo(self);
                    }
                    
					if(!o.fadeIn){
						scroll.append(li0.find('img').attr('src', li0.find('img').data('src')).end().clone());
						scroll.width((size+1)*width);
					}
					else{
						scroll.css({position:'relative'}).children('li').css({position:'absolute'}).hide();
					}
                    
                    _this.find('.ui-slide-thumb-img').on('click', 'span', function(){
                        that.click($(this).index());
                    });
                    
                    _this.find('.ui-slide-prev').click(function(){
                        if(o.thumb && that.index == 0){
                            return false;
                        }
                        that.prev();
                    });

                    _this.find('.ui-slide-next').click(function(){
                        if(o.thumb && that.index == size-1){
                            return false;
                        }
                        that.next();
                    });

                    self.find('.ui-slide-list').on('click', 'b', function(){
                        that.click($(this).index());
                    }).children('b:eq(0)').click();

                    if(o.auto === true){
                        this.auto();
                        _this.hover(function(){
                            clearInterval(that.timer);
                        }, function(){
                            that.auto();
                        });
                    }
                }
            }
            
        config.init();
    });
}