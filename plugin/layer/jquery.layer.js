/**
 * FileName: jquery.layer.js
 * Author: Aniu[date:2014-07-11 14:01]
 * Update: Aniu[date:2015-09-30 13:37]
 * Version: v2.8.8 beta
 */

;!(function(window, document, $, undefined){
    var Layer = function(options){
        var that = this;
        that.options = {
            //宽度, 整数
            width:0,
            //高度，整数或者auto
            height:'auto',
            //内容，字符串或者jQuery对象
            content:'',
            //1.自定义皮肤主题；2.layer标识，隐藏特定的layer：layerHide(theme);
            theme:'',
            //是否淡入方式显示
            isFadein:true,
            //是否可以移动
            isMove:true,
            //是否有遮罩层
            isMask:true,
            //点击遮罩层是否关闭弹出层
            isClickMask:false,
            //是否有移动遮罩层
            isMoveMask:false,
            //是否能被laierHide()方法关闭，不传参数
            isClose:true,
            //是否居中
            isCenter:false,
            //是否自适应最大尺寸显示
            isMaxSize:false,
            //是否是ui提示层
            isTips:false,
            //点击layer是否置顶
            isSticky:false,
            //是否固定弹出层
            isFixed:false,
            //标题
            title:{
                enable:true,
                text:''
            },
            //载入浮动框架
            iframe:{
                enable:false,
                cache:false,
                //跨域无法自适应高度
                src:''
            },
            //显示位置
            offset:{
                //是否基于前一个层进行偏移
                isBasedPrev:false,
                top:0,
                left:0
            },
            //小箭头，方向：top right bottom left
            arrow:{
                enable:false,
                dir:'top'
            },
            close:{
                enable:true,
                text:'×',
                /**
                 * @func 弹出层关闭前执行函数，
                 * @param main:$('.ui-layer-main')
                 * @param index:弹出层索引
                 */
                callback:null
            },
            //确认按钮，回调函数return true才会关闭弹层
            confirm:{
                enable:false,
                text:'确定',
                /**
                 * @func 回调函数
                 * @param main:$('.ui-layer-main')
                 * @param index:弹出层索引
                 * @param button:当前触发按钮
                 */
                callback:null
            },
            //取消按钮
            cancel:{
                enable:false,
                text:'取消',
                /**
                 * @func 回调函数
                 * @param main:$('.ui-layer-main')
                 * @param index:弹出层索引
                 */
                callback:null
            },
            /**
             * @func 弹出层显示时执行
             * @param main:$('.ui-layer-main')
             * @param index:弹出层索引
             */
            onShowEvent:null,
            /**
             * @func 弹出层关闭时执行
             * @param main:$('.ui-layer-main')
             * @param index:弹出层索引
             */
            onHideEvent:null,
            /**
             * @func 弹出层大小、位置改变后执行函数
             * @param main:$('.ui-layer-main')
             * @param index:弹出层索引
             */
            onResizeEvent:null,
            /**
             * @func window窗口改变大小时执行函数
             * @param layer:$('.ui-layer')
             * @param width:窗口宽度
             * @param height:窗口高度
             */
            onWinRisizeEvent:null,
            /**
             * @func window窗口滚动时执行函数
             * @param layer:$('.ui-layer')
             * @param scrollTop:窗口滚动高度
             */
            onWinScrollEvent:null
        }
        that.options = $.extend(true, that.options, options||{});
        that.size = {
            width:0,
            height:0
        }
        that.index = Layer.index++;
        that.eventArray = [];
        Layer.zIndex++;
        return Layer.listArray[that.index] = that.init();
    }, win = $(window), doc = $(document), 
        isObject = function(object){
            return $.isArray(object)||$.isPlainObject(object);
        }
    Layer.index = 0;
    Layer.zIndex = 10000;
    Layer.bsie6 = !-[1,] && !window.XMLHttpRequest;
    Layer.listArray = [];
    Layer.mask = null;
    Layer.getBorderSize = function(object, isHorz){
        var result = 0;
        if(isHorz){
            result = parseInt(object.css('borderLeftWidth')) + parseInt(object.css('borderRightWidth'));
        }
        else{
            result = parseInt(object.css('borderTopWidth')) + parseInt(object.css('borderBottomWidth'));
        }
        return isNaN(result) ? 0 : result;
    }
    /**
     * @func 弹出层居中、高度改变
     * @param index:弹出层索引或者标识
     * @desc 可在框架内操作父窗口弹出层:
     * @desc top.layerResize(document.layer.index)
     * @desc parent.layerHide(document.layer.index)
     */
    window.layerResize = function(index){
        if(typeof index === 'number'){
            Layer.listArray[index].layerResize();
        }
        else if(typeof index === 'string'){
            $.each(Layer.listArray, function(key, val){
                if(val && val.options.theme == index){
                    val.layerResize();
                }   
            });
        }
        else{
            $.each(Layer.listArray, function(key, val){
                if(val && val.options.isCenter == true){
                    val.layerResize();
                }   
            });
        }
    }
    /**
     * @func 移除弹出层
     * @param index:弹出层索引或者标识(theme)
     */
    window.layerHide = function(index){
        if(typeof index === 'number'){
            Layer.listArray[index] && Layer.listArray[index].remove();
        }
        else if(typeof index === 'string'){
            $.each(Layer.listArray, function(key, val){
                val && (val.options.theme == index && val.remove());    
            });
        }
        else{
            $.each(Layer.listArray, function(key, val){
                val && (val.options.isClose == true && val.remove());   
            });
        }
    }
    
    Layer.prototype = {
        width:380,
        height:220,
        title:'系统提示',
        init:function(){
            var that = this, options = that.options;
            that.createHtml().show().bindClick();
            if(options.isMove === true && options.title.enable === true){
                that.bindMove();
            }
            if(typeof options.onWinRisizeEvent === 'function'){
                that.bindEvent(win, 'resize', function(){
                    options.onWinRisizeEvent(that.layer, win.width(), win.height());
                });
            }
            if(typeof options.onWinScrollEvent === 'function'){
                that.bindEvent(win, 'scroll', function(){
                    options.onWinScrollEvent(that.layer, win.scrollTop());
                });
            }
            return that;
        },
        createHtml:function(){
            var that = this, options = that.options,
                width = options.width ? options.width : that.width,
                height = options.height ? options.height : that.height,
                theme = options.theme ? ' t-layer-'+options.theme : '',
                tips = options.isTips === true ? (function(){
                    options.arrow.enable = true; 
                    options.isMove = options.isMask = options.title.enable = options.isCenter = options.isMaxSize = false;
                    width = 'auto'; 
                    return ' ui-layer-tips';
                })() : '',
                html = '<div class="ui-layer'+ theme + tips +'" style="z-index:'+ Layer.zIndex +';">',
                title = oHeight = oWidth = '';
                html += '<div class="ui-layer-box">';
            if(options.close.enable === true){
                html += '<span class="ui-layer-button ui-layer-close">'+ options.close.text +'</span>';
            }
            if(options.arrow.enable === true){
                html += '<span class="ui-layer-arrow ui-layer-arrow-'+ options.arrow.dir +'"><b></b><i></i></span>';
            }
            if(options.title.enable === true){
                title = options.title.text ? options.title.text : that.title;
                html += '<div class="ui-layer-title"><span>'+ title +'</span></div>';
            }
            html += '<div class="ui-layer-body"><div class="ui-layer-main">';
            if(options.iframe.enable === true){
                html += that.createIframe();
            }
            else{
                if(typeof options.content === 'string'){
                    html += options.content;
                }
            }
            html += '</div></div>';
            if(options.confirm.enable === true || options.cancel.enable === true){
                html += '<div class="ui-layer-foot">';
                if(options.confirm.enable === true){
                    html += '<span class="ui-layer-button ui-layer-confirm">'+ options.confirm.text +'</span>';
                }
                if(options.cancel.enable === true){
                    html += '<span class="ui-layer-button ui-layer-cancel">'+ options.cancel.text +'</span>';
                }
                html += '</div>';
            }
            html += '</div></div>';
            that.layer = $(html).appendTo('body');
            if(options.iframe.enable === true){
                that.iframe = that.layer.find('iframe[name="layer-iframe-'+ that.index +'"]');
            }
            oHeight = parseInt(that.layer.css('paddingTop')) + parseInt(that.layer.css('paddingBottom')) + Layer.getBorderSize(that.layer);
            oWidth = parseInt(that.layer.css('paddingLeft')) + parseInt(that.layer.css('paddingRight')) + Layer.getBorderSize(that.layer, true);
            if(options.isMaxSize !== true){
                height = height - oHeight;
                width = width - oWidth;
            }
            else{
                options.isCenter = true;
                height = win.height() - 50 - oHeight;
                width = win.width() - 50 - oWidth;
                options.height = 'auto';
            }
            that.layer.css({width:width, height:height});
            if(typeof options.content === 'object'){
                that.layer.find('.ui-layer-main').html(options.content);
            }
            return that;
        },
        createIframe:function(){
            var that = this, options = that.options, src = options.iframe.src;
            if(options.iframe.cache === false){
                var flag = '?_=';
                if(src.indexOf('?') !== -1){
                    flag = '&_=';
                }
                src += flag+new Date().getTime();
            }
            return '<iframe frameborder="0" name="layer-iframe-'+ that.index +'" id="layer-iframe-'+ that.index +'" scroll="hidden" style="width:100%;" src="'+ src +'" onload="layerResize('+ that.index +')"></iframe>';
        },
        createMoveMask:function(){
            var that = this, options = that.options, zIndex = Layer.zIndex + 1, theme = options.theme ? ' t-movemask-'+options.theme : '';
            return $('<div class="ui-layer-movemask'+ theme +'" style="z-index:'+ zIndex +';"></div>').appendTo('body');
        },
        bindMove:function(){
            var that = this, options = that.options, layer = that.layer, title = that.layer.find('.ui-layer-title'), isMove = false, x, y, mx, my;
            that.bindEvent(title, 'mousedown', function(e){
                isMove = true;
                that.setzIndex();
                if(options.isMoveMask === true){
                    layer = that.moveMask = that.createMoveMask();
                    if(options.isFixed === true && !Layer.bsie6){
                        layer.css('position', 'fixed');
                    }
                    layer.css({
                        width:that.size.width - Layer.getBorderSize(layer, true),
                        height:that.size.height - Layer.getBorderSize(layer),
                        top:options.offset.top,
                        left:options.offset.left
                    });
                }
                $(this).css({cursor:'move'});
                x = e.pageX - options.offset.left;
                y = e.pageY - options.offset.top;
                return false;
            });
            that.bindEvent(doc, 'mousemove', function(e){
                var width = $(this).width(), height = $(this).height();
                if(isMove){
                    mx = e.pageX - x;
                    my = e.pageY - y;
                    mx < 0 && (mx = 0);
                    my < 0 && (my = 0);
                    mx + that.size.width > width && (mx = width - that.size.width);
                    my + that.size.height > height && (my = height - that.size.height);
                    options.offset.top = my;
                    options.offset.left = mx;
                    layer.css({top:my, left:mx});
                    return !isMove;
                }
            });
            that.bindEvent(doc, 'mouseup', function(){
                if(isMove){
                    isMove = false;
                    title.css({cursor:'default'});
                    mx = mx || options.offset.left;
                    my = my || options.offset.top;
                    if(options.isMoveMask === true){
                        !that.layer.is(':animated') && that.layer.animate({top:my, left:mx}, 450);  
                        layer.remove();
                    }
                    that.offsetWinTop = my - win.scrollTop();
                }
            });
        },
        bindBtnClick:function(){
            var that = this, layer = that.layer, 
                options = that.options,
                main = layer.find('.ui-layer-main'),
                button = layer.find('.ui-layer-close, .ui-layer-confirm, .ui-layer-cancel');
            layer.on('click', function(){
               options.isSticky === true && that.setzIndex();
            });
            button.on('click', function(){
                if($(this).hasClass('ui-layer-close')){
                    that.hide();
                }
                else if($(this).hasClass('ui-layer-confirm')){
                    if(typeof options.confirm.callback === 'function'){
                        options.confirm.callback(main, that.index, $(this)) && that.remove();
                    }
                }
                else{
                    if(typeof options.cancel.callback === 'function'){
                        options.cancel.callback(main, that.index);
                    }
                    that.hide();
                }
                return false;
            });
        },
        bindClick:function(){
            var that = this;
            $.each(Layer.listArray, function(key, val){
                if(val && val !== that){
                    val.isClick = true;
                }
            });
        },
        bindEvent:function(target, eventType, callback, EventInit){
            var that = this;
            target.bind(eventType, callback);
            EventInit === true && target[eventType]();
            that.eventArray.push({
                target:target,
                eventType:eventType,
                callback:callback
            });
        },
        unbindEvent:function(){
            var that = this;
            $.each(that.eventArray, function(key, val){
                val && val.target.unbind(val.eventType, val.callback);  
            });
            that.eventArray = null;
        },
        setzIndex:function(){
            var that = this, layer = that.layer, i;
            if(that.isClick){
                that.isClick = false;
                layer.css({zIndex:++Layer.zIndex});
                that.bindClick();
            }
        },
        layerResize:function(){
            var that = this, options = that.options, layer = that.layer, bodyHeight, contentHeight, height, box = layer.children('.ui-layer-box'), 
                head = box.children('.ui-layer-title'), body = box.children('.ui-layer-body'), main = body.children('.ui-layer-main'), winStop = win.scrollTop(),
                foot = box.children('.ui-layer-foot'), headHeight = head.outerHeight(), footHeight = foot.outerHeight(), pt = parseInt(layer.css('paddingTop')), 
                pb = parseInt(layer.css('paddingBottom')), bbd = Layer.getBorderSize(body), bl = Layer.getBorderSize(layer), bb = Layer.getBorderSize(box),
                pl = parseInt(layer.css('paddingLeft')), pr = parseInt(layer.css('paddingRight')), blt = Layer.getBorderSize(layer, true), extd = {}, speed = 400,
                wheight = win.height() - 50, wwidth = win.width() - 50, isiframe = typeof that.iframe === 'object';
            if(isiframe){
                var iframeDoc = that.iframe.contents(), 
                    iframeHtml = iframeDoc.find('html').css({overflow:'hidden'});
                iframeDoc[0].layer = {index:that.index, target:that.layer}; //iframe没有加载完获取不到
                contentHeight = iframeHtml.children('body').outerHeight();
            }
            else{
                contentHeight = main.outerHeight();
            }
            if(options.height === 'auto'){
                contentHeight += headHeight + footHeight + pt + pb + bbd + bl + bb;
                if(contentHeight > wheight){
                    that.size.height = wheight;
                    !isiframe ? body.css({overflow:'hidden', overflowY:'scroll'}) : iframeHtml.css({overflowY:'scroll'});
                }
                else{
                    that.size.height = contentHeight;
                    !isiframe && body.css({overflow:'', overflowY:''});
                }
                if(options.isMaxSize === true){
                    that.size.width = wwidth - blt;
                    that.size.height = wheight;
                    extd.width = that.size.width - pl - pr;
                    speed = 0;
                }
                if(options.isFixed === true && !Layer.bsie6){
                    winStop = 0;
                }
                options.offset.top = (win.height() - that.size.height) / 2 + winStop;
                options.offset.left = (win.width() - that.size.width) / 2;
                height = that.size.height - pt - pb - bl;
                bodyHeight = height - bb - headHeight - footHeight - bbd;
                body.stop(true, false).animate({height:bodyHeight}, speed);
                isiframe && that.iframe.stop(true, false).animate({height:bodyHeight}, speed);
                layer.stop(true, false).animate($.extend({top:options.offset.top, left:options.offset.left, height:height}, extd), speed, function(){
                    that.offsetWinTop = options.offset.top - winStop;
                    typeof options.onResizeEvent === 'function' && options.onResizeEvent(main, that.index);
                });
            }
            else{
                if(contentHeight > body.height()){
                    !isiframe ? body.css({overflow:'hidden', overflowY:'scroll'}) : iframeHtml.css({overflowY:'scroll'});
                }
                else{
                    !isiframe && body.css({overflow:'', overflowY:''});
                }
            }
        },
        show:function(){
            var that = this, options = that.options, layer = that.layer, bodyHeight, winStop = win.scrollTop(),
                theme = options.theme ? ' t-mask-'+options.theme : '', showType = options.isFadein === true ? 'fadeIn' : 'show';
                box = layer.children('.ui-layer-box'), head = box.children('.ui-layer-title'), body = box.children('.ui-layer-body'),
                main = body.children('.ui-layer-main'), foot = box.children('.ui-layer-foot');
            if(options.isFixed === true && !Layer.bsie6){
                winStop = 0;
                layer.css('position', 'fixed');
            }
            that.size.width = layer.outerWidth();
            that.size.height = layer.outerHeight() > win.height() ? layer.height(win.height()-50).outerHeight() : layer.outerHeight();
            options.offset.top = (options.offset.top || ((win.height() - that.size.height) / 2)) + winStop;
            options.offset.left = options.offset.left || ((win.width() - that.size.width) / 2);
            if(!!that.index && options.offset.isBasedPrev === true){
                var index = that.index - 1, prevOptions = Layer.listArray[index].options;
                options.offset.top = prevOptions.offset.top + 10;
                options.offset.left = prevOptions.offset.left + 10;
            }
            if(options.isMask === true){
                if(!Layer.mask){
                    Layer.mask = $('<div class="ui-layer-mask'+ theme +'"><div></div></div>').appendTo('body');
                    if(options.isClickMask === true){
                        that.bindEvent(Layer.mask, 'click', function(){
                            that.hide();
                        });
                    }
                    if(Layer.bsie6){
                        that.bindEvent(win, 'resize', function(){
                            Layer.mask.css({position:'absolute', width:$(this).width(), height:doc.height()});
                        }, true);
                    }
                    Layer.mask[showType]();
                }
            }
            that.offsetWinTop = options.offset.top - winStop;
            if(Layer.bsie6 && options.isFixed === true){
                that.bindEvent(win, 'scroll', function(){
                    var css = {top:that.offsetWinTop + $(this).scrollTop()};
                    options.offset.top = css.top;
                    that.moveMask && that.moveMask.css(css);
                    that.layer.css(css);
                });
            }
            layer.css({margin:0, top:options.offset.top, left:options.offset.left})[showType]();
            bodyHeight = layer.height() - Layer.getBorderSize(box) - head.outerHeight() - foot.outerHeight() - Layer.getBorderSize(body);
            body.css({height:bodyHeight});
            if(main.height() > bodyHeight){
                body.css({overflow:'hidden', overflowY:'scroll'});
            }
            that.bindBtnClick();
            if(options.isCenter === true){
                that.bindEvent(win, 'resize', function(){
                    that.layerResize();
                });
                if(Layer.bsie6){
                    that.layerResize();
                }
            }
            if(typeof options.onShowEvent === 'function'){
                options.onShowEvent(main, that.index);
            }
            return that;
        },
        hide:function(){
            var that = this, options = that.options, main = that.layer.find('.ui-layer-main');
            if(typeof options.close.callback === 'function'){
                options.close.callback(main, that.index);
                return;
            }
            that.remove();
        },
        remove:function(){
            var that = this, options = that.options, layer = that.layer, main = layer.find('.ui-layer-main'), xMask = true;
            layer.remove();
            that.unbindEvent();
            delete Layer.listArray[that.index];
            Layer.index--;
            Layer.zIndex--;
            $.each(Layer.listArray, function(key, val){
                if(val && val.options.isMask == true){
                    return (xMask = false);
                }   
            });
            if(xMask && Layer.mask){
                Layer.mask.remove();
                Layer.mask = null;
            }
            
            if(typeof options.onHideEvent === 'function'){
                options.onHideEvent(main, that.index);
                main.remove();
            }
        }
    }
    
    $.extend({
        layer:function(options){
            return new Layer(options);
        }
    });
    $.layer.alert = function(message, title, width, height){
        return new Layer({
            content:message,
            title:{
                text:title
            },
            width:width,
            height:isNaN(height) ? 'auto' : height,
            cancel:{
                enable:true,
                text:'确定'
            }
        });
    }
    $.layer.confirm = function(message, callback, title, width, height){
        return new Layer({
            content:message,
            title:{
                text:title
            },
            width:width,
            height:isNaN(height) ? 'auto' : height,
            confirm:{
                enable:true,
                callback:callback
            },
            cancel:{
                enable:true
            }
        });
    }
    $.layer.iframe = function(src, title, width, height){
        return new Layer({
            width:width,
            height:isNaN(height) ? 'auto' : height,
            isFadein:false,
            iframe:{
                enable:true, 
                src:src
            },
            title:{
                text:title
            }
        });
    }
    $.layer.tips = function(message, dir, offset, callback){
        return new Layer({
            content:message,
            isTips:true,
            close:{
                enable:false
            },
            arrow:{
                dir:dir ? dir : 'top'
            },
            offset:{
                top:offset && offset.top ? offset.top : 0,
                left:offset && offset.left ? offset.left : 0
            },
            onShowEvent:callback
        });
    }
    $.layer.showmsg = function(msg, target, dir, ofs){
        var offset = target.offset();
        clearTimeout($.layer.showmsg.timer);
        ofs = $.extend({
            top:-3,
            left:10
        }, ofs||{});
        if(dir == 'left'){
            offset.left = offset.left + target.width() + ofs.left
        }
        else{
            offset.top = offset.top + target.height() - $(window).scrollTop() + ofs.top;
            offset.left += ofs.left;
        }
        layerHide('showmsg');
        $.layer({
            content:'<p style="padding:6px;">'+ msg +'</p>',
            isTips:true,
            isClose:false,
            theme:'showmsg',
            close:{
                enable:false
            },
            arrow:{
                dir:dir ? dir : 'top'
            },
            offset:{
                top:offset.top,
                left:offset.left
            },
            onShowEvent:function(main, index){
                var layer = main.parents('.ui-layer'), speed = 150;
                layer.queue('queue', [
                    function(){
                        layer.animate({left:'-=20px'}, speed).dequeue('queue');
                    },
                    function(){
                        layer.animate({left:'+=30px'}, speed).dequeue('queue');
                    },
                    function(){
                        layer.animate({left:'-=20px'}, speed).dequeue('queue');
                    },
                    function(){
                        layer.animate({left:'+=10px'}, speed, function(){
                            $.layer.showmsg.timer = setTimeout(function(){
                                layerHide('showmsg');
                            }, 1500);
                        }).dequeue('queue');
                    }
                ]).dequeue('queue');
            }
        });
    }
    $.layer.showmsg.timer = null;
})(this, document, jQuery);