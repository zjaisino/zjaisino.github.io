/**
 * Copyright(C), 2013-2014 ZheJiang Aisino Spaceflight Technology Co., Ltd.
 * FileName: jquery.select.js
 * Author: Aniu[date:2014-03-24 10:05]
 * Update: Aniu[date:2014-06-17 17:26]
 * Version: v1.0.1
 * Description: select menu plugin
 */
 
$.fn.imitSelect = function(o){
    o = $.extend({
        itemHeight:28,
        itemShowCount:8,
        initData:false,
        skin:''
    }, o||{});
    
    this.each(function(inde, items){
        var that = $(this), value = $(this).data('value'), zIndex = 0;
        that.prev('.ui-imitselect').remove();
        if(value && !o.initData){
            var index = that.children('option[value='+ value +']').index();
            this.selectedIndex = index;
        }
        zIndex = $('select').size()-inde;
        var index = that[0].selectedIndex,
            size = that.children('option').size(),
            list = html = height = '',
            text = 'ÇëÑ¡Ôñ',
            css = 'width:'+(that.outerWidth()+20)+'px; ' + (that.data('css') ? that.data('css') : ''),
            isDis = that.prop('disabled'),
            style = 'style="'+ css +'; position:relative; z-index:'+ zIndex +';"';
        if(size > 0){
            that.children('option').each(function(){
                var crt = '';
                if($(this).index() === index){
                    crt = ' class="s-crt"';
                    text = $(this).text();
                }
                list  = list + '<li'+ crt + (!!that.data('func') ? ' onclick='+that.data('func')+'('+ $(this).attr('value') +')' : '') +'>'+ $(this).text() +'</li>';
            });
            
            if(size > o.itemShowCount){
                var maxh = o.itemHeight*o.itemShowCount;
                height = ' style="height:'+ maxh +'px; overflow-y:scroll;"';
            }
            
            html += '<dl class="ui-imitselect'+ (isDis ? ' s-dis' : '') +'" '+ style +'>';
            html += '<dt><strong>'+ text +'</strong><b><i></i></b></dt>';
            html += '<dd class="ui-animate"><ul'+ height +'>'+ list +'</ul></dd></dl>';
        }
        else{
            html += '<dl class="ui-imitselect" '+ style +'>';
            html += '<dt><strong>'+ text +'</strong><b><i></i></b></dt></dl>';
        }

        that.before(html);
        if(!!that.data('value') && !!that.data('func')){
            eval(that.data('func')+'('+that.data('value')+', true)');
            return false;
        }
    }).hide();
    
    $('.ui-imitselect:not(.s-dis)').on('click', function(){
        $(this).addClass('s-show').children('dd').removeClass('ui-animate-flipInX').addClass('ui-animate-flipInX')
            .end().find('dt strong').removeClass();
        return false;
    }).on('mouseleave', function(){
        var index = $(this).next('select')[0].selectedIndex;
        $(this).find('dd li:eq('+ index +')').addClass('s-crt').siblings().removeClass('s-crt');
    }).find('ul').on('click', 'li', function(){
        var parent = $(this).parents('.ui-imitselect');
        parent.next('select')[0].selectedIndex = $(this).index();
        parent.next('select').data('value', parent.next('select').val());
        parent.find('dt strong').addClass('ui-animate ui-animate-bounceIn').text($(this).text()).end().removeClass('s-show');;
        return false;
    }).on('mouseenter', 'li', function(){
        $(this).addClass('s-crt').siblings().removeClass('s-crt');
    });
    $(document).on('click', function(){
        $('.ui-imitselect').removeClass('s-show');
    });
}