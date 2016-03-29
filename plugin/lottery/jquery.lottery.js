/**
 * @filename jquery.lottery.js
 * @author Aniu[2014-12-02 15:27]
 * @update Aniu[2014-08-26 14:10]
 * @version v2.2
 * @description 抽奖
 */

;!(function(window, document, $, undefined){ 
    $.fn.lottery = function(o){
        o = $.extend({
            speed:240, //初始速度
            trans:2,   //最大速度过渡圈数
            turns:2,   //达到最大速度时圈数
            count:8,   //宫格数量
            rotate:false, //是否旋转
            /**
             * @func 前端不通过ajax交互返回随机数
             * @return <Number>
             * @param self <jQuery Object> 调用组件的当前对象
             */
            getRandom:function(){
                return Math.floor(Math.random()*this.count);
            },
            /**
             * @func 抽奖结束执行函数
             * @param data <Native Object> 数据对象
             * @param items <jQuery Object> 宫格列表jQuery对象
             */
            complete:$.noop,
            /**
             * @func ajax url
             * @type <String, Function>
             * @return <String>
             * @param self <jQuery Object> 调用组件的当前对象
             */
            url:'',
            /**
             * @func ajax传递参数
             * @type <Function>
             * @return <Object>
             */
            getParam:$.noop,
            /**
             * @func ajax交互成功时回调函数
             * @return <Number>
             * @param data <Native Object> 数据对象
             * @param items <jQuery Object> 宫格列表jQuery对象
             */
            succCallback:$.noop,
            /**
             * @func ajax交互失败回调函数
             * @param data <Native Object, Undefined> 数据对象或不传参
             */
            errCallback:$.noop,
            /**
             * @func 改变元素选中状态
             * @param items <jQuery Object> 目标对象
             * @param index <Number> 当前选中索引
             */
            statusCallback:function(items, index){
                items.eq(index).addClass('s-crt').siblings().removeClass('s-crt');
            },
            /**
             * @func 按钮点击时触发函数
             */
            bindClick:$.noop
        }, o||{});

        return this.each(function(){
            var _this = this, self = $(this).css({position:'relative'}), 
                lottery = self.children('.ui-lottery').css({position:'relative'}),
                size = lottery.children('li').size(),
                data = lottery.data();
            o = $.extend(o, data);
            if(o.count > size){
                var len = o.count-size, html = '';
                for(var i=0; i<len; i++){
                    html += '<li></li>';
                }
                lottery.append(html);
            }
            else if(o.count < size){
                o.count = size;
            }
            
            var items = lottery.children('li');
            if(o.rotate !== true){
                var width = self.width(), //容器宽度
                    itemsWidth = items.innerWidth(), //宫格宽度
                    itemsHeight = items.innerHeight(), //宫格高度
                    lineNum = Math.floor(width/itemsWidth), //水平显示数量
                    verNum = Math.floor((o.count-lineNum*2)/2), //垂直显示数量，不包括水平相交的
                    loweRright = lineNum + verNum; //右下角宫格索引
            }
            var button = self.find('.ui-lottery-btn'), //点击按钮
                timer = null, //定时器
                endIndex = 0, //结束索引
                index = 0, //起始索引
                speed = o.speed, //变化速度
                step = o.speed / (o.turns * o.count), //步长
                isAdd = true, //速度是否增大
                data = {}, //complete时传递数据参数
                trans = 0, //过渡圈数
                circle = function(){
                    o.statusCallback(items, index);
                    if(speed > step*2 && isAdd){
                        speed -= step;
                    }
                    else{
                        isAdd = false;
                        if(trans < o.count*o.trans){
                            trans += 1;
                        }
                        else if(speed < o.speed-step){
                            speed += step;
                        }
                        else{
                            if(index == endIndex){
                                data.index = index;
                                isAdd = true;
                                trans = 0;
                                button.removeClass('s-dis');
                                speed = o.speed;
                                o.complete(data, items);
                                clearTimeout(timer);
                                return;
                            }
                        }
                    }
                    index = ++index%o.count;
                    timer = setTimeout(circle, speed);
                }
                
            if(o.rotate !== true){
                items.each(function(){
                    var that = $(this), index = that.index();
                    if(index < lineNum){
                        that.css({top:0, left:(left = that.prevAll().size()*itemsWidth)}); 
                    }
                    else if(index <= loweRright){
                        that.css({top:that.prev().position().top + itemsHeight, left:that.prevAll().position().left});
                    }
                    else if(index > loweRright && index <= (loweRright+lineNum-1)){
                        that.css({top:that.prev().position().top, left:that.prev().position().left-itemsWidth});
                    }
                    else{
                        that.css({top:that.prev().position().top - itemsHeight, left:0});
                    }
                });
            }

            button.click(function(){
                if(!button.hasClass('s-dis')){
                    button.addClass('s-dis');
                    if(o.bindClick() === false){
                        return false;
                    }
                    if(o.url){
                        $.ajax({
                            url:typeof o.url === 'function' ? o.url(self) : o.url,
                            cache:false,
                            dataType:'json',
                            data:o.getParam()||{},
                            success:function(res){
                                if(res.status == 'success'){
                                    if(!isNaN(endIndex = o.succCallback(res, items))){
                                        data = res;
                                        circle();
                                    }
                                }
                                else{
                                    o.errCallback(res);
                                    button.removeClass('s-dis');
                                }
                            },
                            error:function(){
                                o.errCallback();
                                button.removeClass('s-dis');
                            }
                        });
                    }
                    else{
                        if(!isNaN(endIndex = o.getRandom(self))){
                            circle();
                        }
                    }
                }
            });
            
        });
    }
})(this, document, jQuery);