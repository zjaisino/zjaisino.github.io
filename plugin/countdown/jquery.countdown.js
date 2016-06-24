/**
 * @fileName jquery.countdown.js
 * @author Aniu[date:2015-08-05 21:31]
 * @update Aniu[date:2015-10-16 15:19]
 * @version v1.2
 * @description 获取验证码倒计时
 */
;!(function(window, document, $, undefined){
$.fn.countdown = function(o){
	o = $.extend({
        /**
         * @function 倒计时时长
         * @type <Number>
         * @desc 单位/毫秒
         */
        time:60000,
        /**
         * @function 目标元素，比如获取验证码的输入框jq对象
         * @type <Object, Function>
         * @return <Object>
         * @param me <JQuery Object> 调用当前组件的jq对象
         */
        target:null,
        /**
         * @function ajax配置
         * @type <Object, Function>
         * @return <Object>
         * @param me <JQuery Object> 调用当前组件的jq对象
         * @param target <JQuery Object> 目标元素
         */
        ajax:null,
        /**
         * @function 是否ajax返回结果后才执行倒计时
         * @type <Boolean>
         * @desc ajax必须是function
         */
        ajaxrun:false,
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
         * @return <Undefined,  Boolean> 返回false将不执行倒计时
         * @param me <JQuery Object> 调用当前组件的jq对象
         * @param target <JQuery Object> 目标元素
         */
        startCallback:$.noop,
        /**
         * @function 倒计时结束时执行函数
         * @type <Function>
         * @return <Undefined>
         * @param me <JQuery Object> 调用当前组件的jq对象
         * @param target <JQuery Object> 目标元素
         */
        endCallback:$.noop
    }, o||{});
	return this.each(function(){
		var that = this, 
            me = $(that), 
            isipt = that.nodeName === 'INPUT',
            text = me[isipt?'val':'text'](),
            target = typeof o.target === 'function' ? o.target(me) : o.target,
            timer = null,
            time = o.time,
            temp = null,
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
                        o.endCallback(me, target);
                        return;
                    }
                    time -= 1000;
                    run();
                }, 1000);
            }
        if(o.isEvent === true){
            me.click(function(){
                if(!me.hasClass('s-dis')){
                	if(o.startCallback(me, target) === false){
                		return;
                	}
                    me.addClass('s-dis').data('stop', false);
                    if(o.ajax !== null){
                        $.ajax(typeof o.ajax === 'function' ? o.ajax(me, target, o.ajaxrun === true ? run : '') : o.ajax);
                    }
                    if(o.ajaxrun !== true){
                    	run();
                    }
                }
            });
        }
        else{
            run();
        }
	});
}
})(this, document, jQuery);