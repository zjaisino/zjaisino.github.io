/**
 * Copyright(C), 2013-2014 ZheJiang Aisino Spaceflight Technology Co., Ltd.
 * FileName: jquery.select.js
 * Author: Aniu[date:2014-03-24 10:05]
 * Update: Aniu[date:2014-11-25 08:42]
 * Version: v2.4
 */
 
$.fn.imitSelect = function(o){
    o = $.extend({
        count:8, //下拉显示个数
        isInit:true, //初次加载为true，多级联动使用
        isNull:false, //是否清空下拉，将数据设置为默认
        isEdit:false, //下拉框选中值是否可编辑
        hide:false, //是否隐藏下拉，特殊地方嫩用到，嗯，我想想。。。。
        value:null, //设置下拉框默认值
        disabled:null //是否禁用下拉框
    }, o||{});
    
    return this.each(function(){
        var _this = this, that = $(this);
        o.disabled !== null && that.prop('disabled', o.disabled);
        o.value !== null && that.data('value', o.value);
        if(o.isNull === true){
        	that.data('value', '').val('');
        }
        var value = that.data('value'), 
            func = that.data('func'),
            init = that.data('init'),
            disabled = that.prop('disabled'),
            zIndex = 0,  select = $('select'), size = select.size();
        that.prev('.ui-imitselect').remove();
        if(o.hide === true){
        	return;
        }
        if(!!func && !disabled && !init){
            eval('var option = '+func+'()');
            if(option === false){
            	return;
            }
            that.html(option);
            option = null;
            value !== undefined && that.next('select').prop('disabled', false);
        }
        if(value !== undefined && o.isInit === true){
            that.val(value);
        }
        select.each(function(inde, item){
        	if(_this == item){
        		zIndex = size - inde;
        		return false;
        	}
        });
        var index = that[0].selectedIndex,
            size = that.children('option').size(),
            list = html = height = select = '',
            text = '请选择',
            css = 'width:'+(that.outerWidth()+20)+'px; ' + (that.data('css') ? that.data('css') : ''),
            style = 'style="'+ css +'; position:relative; z-index:'+ zIndex +';"';
        if(size > 0 && !that.data('init')){
            that.children('option').each(function(){
                var crt = '';
                if($(this).index() === index){
                    crt = ' class="s-crt"';
                    text = $(this).text();
                }
                if(!!$(this).text()){
                    list  = list + '<li'+ crt + ' data-value='+ $(this).attr('value') +'>'+ $(this).text() +'</li>';
                }
            });
            
            html += '<dl class="ui-imitselect'+ (disabled ? ' s-dis' : '') +'" '+ style +'>';
            html += '<dt><strong>'+ text +'</strong><b><i></i></b></dt>';
            html += '<dd class="ui-animate"><ul>'+ list +'</ul></dd></dl>';
        }
        else{
            html += '<dl class="ui-imitselect" '+ style +'>';
            html += '<dt><strong>'+ text +'</strong><b><i></i></b></dt><dd class="ui-animate"><ul></ul></dd></dl>';
        }
        
        if(o.isEdit === true){
            html = html.replace(/<strong>([\s\S]*)<\/strong>/g, '<strong><input type="text" '+ (disabled ? 'disabled' : '') +' name="'+ that.attr('name') +'" id="'+ that.attr('id') +'" value="$1" autocomplete="off" /></strong>');
            that.removeAttr('name').removeAttr('id');
        }

        select = $(html).insertBefore(that), selectbox = select.find('ul'), itemHeight = selectbox.children('li').outerHeight();
        size > o.count && selectbox.css({height:itemHeight*o.count, overflowY:'scroll'});
        var imitselect = that.prev('.ui-imitselect:not(.s-dis)');
        imitselect.on('click', function(){
            var select = $(this);
            if(that.data('init')){
                eval('var option = '+init+'()');
                that.html(option);
                option = '';
                that.data('init', '').children('option').each(function(){
                    var crt = '';
                    if($(this).index() === index){
                        crt = ' class="s-crt"';
                        text = $(this).text();
                    }
                    option += '<li'+ crt + ' data-value='+ $(this).attr('value') +'>'+ $(this).text() +'</li>';
                });
                var size = select.find('ul').html(option).children('li').size();
                value !== undefined && that.next('select').prop('disabled', false);
                size > o.count && select.find('ul').css({height:itemHeight*o.count, overflowY:'scroll'});
            }
            $(this).addClass('s-show').children('dd').removeClass('ui-animate-flipInX').addClass('ui-animate-flipInX');
            return false;
        }).on('mouseleave', function(){
            var index = $(this).next('select')[0].selectedIndex;
            $(this).find('dd li:eq('+ index +')').addClass('s-crt').siblings().removeClass('s-crt');
        }).find('dt input').on('click', function(){
            return false;
        }).end().find('ul').on('click', 'li', function(){
            var that = $(this), parent = that.parents('.ui-imitselect'), select = parent.next('select'), 
                target = (o.isEdit !== true ? parent.find('dt strong').text(that.text()) : parent.find('dt input').val(that.text())).end();
            select[0].selectedIndex = that.index();
            select.data('value', select.val());
            target.removeClass('s-show');
            if(func){
                eval(func+'("'+ that.data('value') +'")');
            }
            else if(init){
                eval(init+'("'+ that.data('value') +'")');
            }
            return false;
        }).on('mouseenter', 'li', function(){
            $(this).addClass('s-crt').siblings().removeClass('s-crt');
        });
        
        $(document).on('click', function(){
            imitselect.removeClass('s-show');
        });
        
    }).hide();
}