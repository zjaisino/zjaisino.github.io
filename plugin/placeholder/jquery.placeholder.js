/**
 * @filename jquery.placeholder.js
 * @author Aniu[2014-3-16 19:40]
 * @update Aniu[2015-06-21 15:33]
 * @version v1.3
 * @description 模拟html5的placeholder效果
 */

$.fn.placeholder = function(o){
	o = $.extend({
        /**
         * @func 是否启用动画版
         * @type <Boolean>
         */
		animate:true,
        /**
         * @func 输入框值是否可以和占位符相同
         * @type <Boolean>
         */
        equal:false,
        /**
         * @func 占位符文本颜色
         * @type <String>
         */
		color:'#ccc',
        /**
         * @func 类选择器值，可对占位符设置样式
         * @type <String>
         */
        theme:''
	}, o||{});
	return this.each(function(){
		var that = $(this), ph = $.trim(that.attr('placeholder'));
		if(!!ph){
            that.removeAttr('placeholder');
            
            if(!$.trim(that.val())){
                that.val('');
            }
            
			var data = {
                pleft:parseInt(that.css('paddingLeft')),
                ptop:parseInt(that.css('paddingTop')),
                height:that.outerHeight()
            };
            
            var txt = $('<b>'+ ph +'</b>').appendTo(that.wrap('<strong />').parent().css({
                position:'relative',
                display:'inline-block',
                width:that.outerWidth(),
                overflow:'hidden',
                cursor:'text'
            }).addClass(o.theme)).css($.extend({
                position:'absolute',
                left:data.pleft+1,
                top:data.ptop,
                height:data.height,
                lineHeight:data.height+'px',
                color:o.color
            }, that.is('textarea') ? {lineHeight:'normal', height:'auto'} : {})).on('click', function(){
                that.focus();
            });
            
            that.on('focus', function(){
                o.animate === true && txt.stop(false, true).animate({left:data.pleft+10, opacity:'0.5'});
            }).on('blur change', function(){
                var val = $.trim(that.val());
                if((o.equal === false && val == ph) || !val){
                    that.val('');
                    txt.show();
                    o.animate === true && txt.animate({left:data.pleft+1, opacity:'1'});
                }
                else{
                    txt.hide();
                }
            }).on('keyup keydown', function(){
                $.trim(that.val()) ? txt.hide() : txt.show();
            }).blur();
		}
	});
}