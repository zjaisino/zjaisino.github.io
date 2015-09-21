/**
 * @fileName jquery.countdown.js
 * @author Aniu[date:2015-08-05 21:31]
 * @update Aniu[date:2015-08-06 07:54]
 * @version v1.1
 * @description 获取验证码倒计时
 */
 
$.fn.countdown = function(o){
	o = $.extend({
        /**
         * @function 倒计时时长
         * @type <Number>
         * @desc 单位/毫秒
         */
        time:60000,
        /**
         * @function ajax配置
         * @type <Object, Function, Null>
         * @return <Object>
         * @param target <JQuery Object> 调用当前组件的jq对象
         */
        ajax:null,
        /**
         * @function 是否点击事件后执行
         * @type <Boolean>
         * @desc 有些情况显示几秒后跳转到某页
         */
        isEvent:true,
        /**
         * @function 倒计时进行中的后缀文本
         * @type <String, Function>
         */
        text:'秒后重新获取验证码',
        /**
         * @function 倒计时开始时执行函数
         * @type <Function>
         * @return <Undefined>
         * @param target <JQuery Object> 调用当前组件的jq对象
         */
        startCallback:$.noop,
        /**
         * @function 倒计时结束时执行函数
         * @type <Function>
         * @return <Undefined>
         * @param target <JQuery Object> 调用当前组件的jq对象
         */
        endCallback:$.noop
    }, o||{});
	return this.each(function(){
		var that = this, 
            me = $(that), 
            isipt = that.nodeName === 'INPUT',
            text = me[isipt?'val':'text'](),
            timer = null,
            time = o.time,
            temp = null,
            stop = false,
            run = function(){
                temp = (function(){
                    if(typeof o.text === 'function'){
                        return o.text(time/1000);
                    }
                    return time/1000+o.text;
                })();
                me[isipt?'val':'text'](temp);
                timer = setTimeout(function(){
                    if(time<=0 || me.data('stop') == true){
                        me.removeClass('s-dis').data('stop', false);
                        clearTimeout(timer);
                        me[isipt?'val':'text'](text);
                        time = o.time;
                        stop = false;
                        o.endCallback(me);
                        return;
                    }
                    time -= 1000;
                    run();
                }, 1000);
            }
        if(o.isEvent === true){
            me.click(function(){
                if(!me.hasClass('s-dis')){
                    if(o.startCallback(me) !== false){
						me.addClass('s-dis');
						if(o.ajax !== null){
							$.ajax(typeof o.ajax === 'function' ? o.ajax(me) : o.ajax);
						}
						run();
					};
                }
            });
        }
        else{
            run();
        }
	});
}