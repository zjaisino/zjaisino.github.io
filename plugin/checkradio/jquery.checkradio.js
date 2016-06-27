/**
 * @filename jquery.checkradio.js
 * @author Aniu[2016-04-27 14:00]
 * @update Aniu[2016-06-25 10:47]
 * @version v1.2
 * @description 模拟单选复选框
 */

;!(function($){
    $.fn.checkradio = function(o){
        o = $.extend({}, o||{
            callback:$.noop
        });
        return this.each(function(){
            var me = $(this);
            if(!me.parent().hasClass('ui-checkradio') && !me.parent('[checkname]').length){
                return;
            }
            var checked = me.prop('checked') ? ' s-checked' : '';
            var disabled = me.prop('disabled') ? ' s-dis' : '';
            var name = me.attr('name');
            var type = 'radio';
            if(me.is(':checkbox')){
                type = 'checkbox';
            }
            if(me.parent('[checkname]').length){
                me.parent().parent().attr('class', 'ui-checkradio ' + checked + disabled);
            }
            else{
                me.css({position:'absolute', top:'-999em', left:'-999em', opacity:0})
                    .wrap('<i class="ui-'+ type + checked + disabled +'" checkname="'+ name +'"></i>')
                .parent().parent().click(function(e){
                	var ele = $(this);
                    if(me.is(':disabled')){
                        return;
                    }
                    if(me.is(':checkbox')){
                        if(me.prop('checked')){
                            me.prop('checked', false);
                            ele.removeClass('s-checked');
                        }
                        else{
                            me.prop('checked', true);
                            ele.addClass('s-checked');
                        }
                    }
                    else{
                        me.prop('checked', true);
                        $('.ui-radio[checkname="'+ name +'"]').parent().removeClass('s-checked');
                        ele.addClass('s-checked');
                    }
                    o.callback(me, e);
                });
            }
        });
    }
})(jQuery);