/**
 * @filename jquery.suggest.js
 * @author Aniu[2014-04-07 09:15]
 * @update Aniu[2016-01-19 18:27]
 * @version v1.7
 * @description 搜索提示
 */

;!(function(window, document, $, undefined){
    
    var Suggest = function(target, setting){
        var that = this;
        that.target = target;
        that.eventArray = [];
        that.setting = $.extend(true, {
            /**
             * @func ajax请求url
             * @type <String>
             */
            url:'',
            /**
             * @func 远程接口接收参数
             * @type <String>
             */
            param:'keywords',
            /**
             * @func 自定义组件主题
             * @type <String>
             */
            theme:'',
            /**
             * @func 指定下拉列表文本
             * @type <String>
             * @desc 将列表指定元素内容赋值到输入框中
             */
            getDom:'',
            /**
             * @func 下拉数据展示数量，多出则滚动显示
             * @type <Number>
             */
            limit:10,
            /**
             * @func 是否默认选中第一行列表
             * @type <Boolean>
             */
            select:false,
            /**
             * @func 是否开启缓存
             * @type <Boolean>
             * @desc 将对应关键词查询到的数据保存到js中，下次再搜索该词将不调用接口
             */
            cache:true,
            /**
             * @func 非ajax加载数据
             * @type <Function>
             * @return <Obejct, Array> 列表数据
             * @param keywords <String> 关键字
             * @param target <Object> 目标输入框jQuery对象
             * @desc 若没有设置url参数，将启用该方法
             */
            getData:null,
            /**
             * @func 下拉框定位垂直偏移
             * @type <Number, Function>
             * @return <Number>
             */
            offsetTop:0,
            /**
             * @func 处理列表数据
             * @type <Function>
             * @return <String> 处理后的列表li元素
             * @param item <String, Object, Array> 单行源数据
             */
            returnData:$.noop,
            /**
             * @func 选择列表行触发函数
             * @type <Function>
             * @param item <Object> 触发事件行jQuery对象
             * @param target <Object> 目标输入框jQuery对象
             * @param keyevent <Boolean> 是否上下键盘时间选择下拉
             */
            eventEnd:$.noop,
            /**
             * @func 初始化组件完成回调函数
             * @type <Function>
             * @param target <Object> 目标输入框jQuery对象
             * @param suggestlist <Object> 下拉框jQuery对象
             */
            callback:$.noop,
            /**
             * @func 隐藏下拉框回调函数
             * @type <Function>
             * @param target <Object> 目标输入框jQuery对象
             * @param items <Object> 下拉框列表jQuery对象
             */
            hideEvent:$.noop,
            /**
             * @func 自定义下拉框显示内容
             * @type <Function>
             */
            diyCallback:$.noop
        }, setting||{});
    }, doc = $(document);
    
    Suggest.prototype = {
        constructor:Suggest,
        liSize:0,
        cache:{},
        isbind:true,
        init:function(keywords){
            var that = this, sets = that.setting;
            that.ishide = false;
            that.keywords = keywords;
            that.suggest = $('.ui-suggest');
            if(!that.suggest.size()){
                var diy = sets.diyCallback()||'';
                that.suggest = $('<div class="ui-suggest"><ul class="ui-suggest-list"></ul>'+ diy +'</div>').appendTo('body').addClass(sets.theme);
            }
            that.suggestlist = that.suggest.children('.ui-suggest-list');
            that.request && that.request.abort();
            that.show();
            if(sets.select !== true){
                that.suggestlist.scrollTop(0);
            }
            sets.callback && sets.callback.call(this, that.target, that.suggestlist);
        },
        show:function(){
            var that = this, sets = that.setting;
            if(sets.cache === true){
                var cache = that.cache[that.keywords];
                if(cache){
                    that.filterData(cache);
                    return;
                }
            }
            if(sets.url){
                var param = {};
                param[sets.param] = that.keywords;
                that.request = $.ajax({
                    url:sets.url,
                    dataType:'json',
                    cache:false,
                    data:param,
                    success:function(res){
                        that.filterData(res);
                    }
                });
            }
            else if(typeof sets.getData === 'function'){
                that.filterData(sets.getData(that.keywords, that.target)||null);
            }
        },
        hide:function(){
            var that = this, sets = that.setting;
            that.isbind = true;
            that.unbindEvent();
            sets.hideEvent.call(that, that.target, that.suggestlist.children('li'));
            that.suggest.remove();
        },
        filterData:function(res){
            var that = this, sets = that.setting, target = that.target, style;
            if(res && res[0] !== undefined && !that.ishide){
                if(sets.cache === true){
                    that.cache[that.keywords] = res;
                }
                that.keywords
                var arr = [],num = 0,
                    html = (function(res){
                    $.each(res, function(index, item){
                        arr.push(sets.returnData.call(this, item));
                        num += 1;
                    });
                    that.liSize = num;
                    return arr.join('');
                })(res);
                var top = parseFloat(typeof sets.offsetTop === 'function' ? sets.offsetTop() : sets.offsetTop);
                if(!top){
                    top = 0;
                }
                var style = {
                    top:target.offset().top+target.outerHeight() - 1 + top,
                    left:target.offset().left,
                    width:target.outerWidth()
                }
                that.suggest.css(style).show();
                var item = that.suggestlist.html(html);
                that.itemHeight = item.children('li').outerHeight()||0;
                var _style = that.liSize > sets.limit ? {overflowY:'scroll', height:that.itemHeight*sets.limit} : {overflowY:'visible', height:'auto'};
                item.css(_style);
                if(sets.select === true){
                    var val = $.trim(target.val());
                    var i = 0;
                    item.children('li').each(function(index, item){
                        var me = $(this);
                        var text = $.trim(me.text());
                        if(val == text){
                            i = index;
                            return false;
                        }
                    });
                    item.children('li').eq(i).addClass('s-crt');
                    that.suggestlist.scrollTop(that.itemHeight*i);
                }
                var height = that.suggest.height();
                if($(window).height() - style.top < height){
                    that.suggest.css({top:style.top - height - target.outerHeight() + 1 - top});
                }
                if(that.isbind){
                    that.bindMouse();
                    that.bindKeyboard();
                    that.isbind = false;
                }
            }
            else{
                that.hide();
            }
        },
        bindMouse:function(){
            var that = this, sets = that.setting;
            that.bindEvent(doc, 'click', function(e){
                that.ishide = true;
                that.hide();
            });
            that.suggest.on('mouseover', function(){
                that.suggest.addClass('s-evt');
            });
            that.suggestlist.on('click', 'li', function(){
                var me = $(this);
                sets.getDom ? that.target.val(me.find(sets.getDom).text()) : that.target.val(me.text());
                sets.eventEnd.call(this, me, that.target);
                that.hide();
                return false;
            }).on('mouseover', 'li', function(){
                $(this).addClass('s-crt').siblings().removeClass('s-crt');
            }).on('mouseout', 'li', function(){
                $(this).removeClass('s-crt');
            });
        },
        bindKeyboard:function(){
            var that = this, sets = that.setting, index = -1, current = null;
            that.bindEvent(doc, 'keydown' , function(e){
                if(e.keyCode == 38 || e.keyCode == 40){
                    if(e.keyCode == 38){
                        if(index > 0){
                            index-=1;
                            if((index+1) % sets.limit === 0){
                                that.suggestlist.animate({scrollTop:(index-sets.limit)*that.itemHeight});
                            }
                        }
                        else{
                            index=that.liSize-1;
                            that.suggestlist.animate({scrollTop:that.itemHeight*index});
                        }
                    }
                    else{
                        if(index >= that.liSize-1){
                            index=0;
                            that.suggestlist.animate({scrollTop:0});
                        }
                        else{
                            index+=1;
                            if(index % sets.limit === 0){
                                that.suggestlist.animate({scrollTop:that.itemHeight*index});
                            }
                        }
                    }
                    current = that.suggestlist.children('li:eq('+ index +')');
                    current.addClass('s-crt').siblings().removeClass('s-crt');
                    sets.eventEnd.call(this, current, that.target, true);
                    sets.getDom ? that.target.val(current.find(sets.getDom).text()) : that.target.val(current.text());
                }
                else if(e.keyCode == 13){
                    if(sets.select === true){
                        if($.trim(that.target.val())){
                            that.suggestlist.children('li.s-crt').click();
                            that.hide();
                        }
                    }
                    else{
                        that.hide();
                    }
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
            var that = this, eArr = that.eventArray, i, temp;
            for(i in eArr){
                temp = eArr[i];
                temp.target.unbind(temp.eventType, temp.callback);
            }
            that.eventArray.length = 0;
        }
    }
    
    $.fn.suggest = function(setting){
        return this.each(function(){
            var target = $(this).attr('autocomplete', 'off');
            var sug = new Suggest(target, setting);
            target.on('keyup', function(e){
                switch(e.keyCode){
                    case 38:
                    case 40:
                    case 13:
                        return false;
                        break;
                }
                if(e.ctrlKey && e.keyCode === 83){
                    return false;
                }
                var keywords = $.trim($(this).val());
                if(keywords){
                    sug.init(keywords);
                }
                else{
                    if(setting.keywords !== undefined){
                        sug.init(setting.keywords);
                    }
                    else{
                        if(sug.suggest && sug.suggest.size()){
                            sug.hide();
                        }
                    }
                }   
            }).on('click', function(){
                return false;
            }).on('blur', function(){
                setTimeout(function(){
                    if(sug.suggest && !sug.suggest.hasClass('s-evt')){
                        sug.hide();
                    }
                }, 250);
            });
        });
    }
})(this, document, jQuery);