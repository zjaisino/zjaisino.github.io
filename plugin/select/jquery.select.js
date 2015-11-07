/**
 * FileName: jquery.select.js
 * Author: Aniu[date:2014-03-24 10:05]
 * Update: Aniu[date:2015-08-01 19:15]
 * Version: v2.5
 */
 
$.fn.imitSelect = function(o){
    o = $.extend(true, {
        count:8, //下拉显示个数
        isInit:true, //初次加载为true，多级联动使用
        isNull:false, //是否清空下拉，将数据设置为默认
        isEdit:false, //下拉框选中值是否可编辑
        hide:false, //是否隐藏下拉
        isTitle:false,
        search:{
            enable:false,
            tips:'',
            text:''
        },
        value:null, //设置下拉框默认值
        disabled:null, //是否禁用下拉框
        callback:null,
        filter:null,
        animate:'',
        selext:''
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
            disabled = that.prop('disabled');
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
        if(typeof o.callback == 'function'){
        	o.callback(that);
        }
        if(value !== undefined && o.isInit === true){
            that.val(value);
        }
        var index = that[0].selectedIndex,
            size = that.children('option').size(),
            list = html = height = select = '',
            text = '请选择',
            css = 'width:'+(that.outerWidth()+20)+'px; ' + (that.data('css') ? that.data('css') : ''),
            style = 'style="'+ css +'; position:relative;"';
        if(size > 0 && !that.data('init')){
            that.children('option').each(function(){
                var me = $(this), crt = '', dis = '';
                if(me.index() === index){
                    crt = ' class="s-crt';
                    text = me.text();
                }
                if(me.prop('disabled')){
                    dis = 'disabled="disabled"';
                    if(crt){
                        crt += ' s-dis'
                    }
                    else{
                        crt = ' class="s-dis';
                    }
                }
                crt && (crt += '"');
                if(!!me.text()){
                    list  = list + '<li'+ crt + ' data-value="'+ me.attr('value') +'" title="'+ (o.isTitle ? me.text() : '') +'">'+ me.text() +'</li>';
                }
            });
            if(typeof o.filter == 'function'){
                text = o.filter(text);
            }
            html += '<dl class="ui-imitselect'+ (disabled ? ' s-dis' : '') +'" '+ style +'>';
            html += '<dt><span><strong>'+ text +'</strong></span><b><i></i></b>'+ o.selext +'</dt>';
            html += '<dd class="ui-animate">'+ (o.search.enable ? '<div class="ui-imitselect-search"><input type="text" placeholder="'+ o.search.tips +'" /></div>' : '') +'<ul>'+ list +'</ul></dd></dl>';
        }
        else{
            html += '<dl class="ui-imitselect" '+ style +'>';
            html += '<dt><span><strong>'+ text +'</strong></span><b><i></i></b>'+ o.selext +'</dt><dd class="ui-animate"><ul></ul></dd></dl>';
        }
        
        if(o.isEdit === true){
            html = html.replace(/<strong>([\s\S]*)<\/strong>/g, '<strong><input type="text" '+ (disabled ? 'disabled' : '') +' name="'+ that.attr('name') +'" id="'+ that.attr('id') +'" value="$1" autocomplete="off" /></strong>');
            that.removeAttr('name').removeAttr('id');
        }
        var select = $(html).insertBefore(that), selectbox = select.find('ul'), itemHeight = selectbox.children('li').outerHeight(), imitselectAll = $('.ui-imitselect'), total = imitselectAll.size();
        size > o.count && selectbox.css({height:itemHeight*o.count, overflowY:'scroll'});
        if(o.search.enable && o.search.tips){
            select.find('.ui-imitselect-search input').placeholder({isVal:false}).parent().css({width:'100%'});
        }
        imitselectAll.each(function(index, item){
        	$(this).css('z-index', total - index);
        });
        var imitselect = that.prev('.ui-imitselect:not(.s-dis)');
        imitselect.on('click', function(){
            var select = $(this);
            if(that.data('init')){
                eval('var option = '+init+'()');
                that.html(option);
                option = '';
                that.data('init', '').children('option').each(function(){
                    var me = $(this), crt = '';
                    if(me.index() === index){
                        crt = ' class="s-crt"';
                        text = me.text();
                    }
                    option += '<li'+ crt + ' data-value='+ me.attr('value') +'>'+ me.text() +'</li>';
                });
                var item = selectbox.html(option).children('li'), size = item.size();
                itemHeight = item.outerHeight();
                value !== undefined && that.next('select').prop('disabled', false);
                size > o.count && selectbox.css({height:itemHeight*o.count, overflowY:'scroll'});
            }
            $(this).addClass('s-show').children('dd').removeClass(o.animate).addClass(o.animate);
            return false;
        }).on('mouseleave', function(){
            var index = $(this).next('select')[0].selectedIndex;
            $(this).find('dd li:eq('+ index +')').addClass('s-crt').siblings().removeClass('s-crt');
        }).find('dt input').on('click', function(){
            return false;
        }).end().find('ul').on('click', 'li:not(.s-nodata)', function(){
            var me = $(this);
            if(me.hasClass('s-dis')){
            	if(typeof o.callback == 'function'){
                	o.callback(that, me);
                }
            	return false;
            }
            var txt = me.text();
            if(typeof o.filter == 'function'){
                txt = o.filter(txt);
            }
            var parent = me.closest('.ui-imitselect'), select = parent.next('select'), 
                target = (o.isEdit !== true ? parent.find('dt strong').text(txt) : parent.find('dt input').val(txt)).end();
            select[0].selectedIndex = me.index();
            select.data('value', select.val());
            target.removeClass('s-show');
            if(func){
                eval(func+'("'+ me.data('value') +'")');
            }
            else if(init){
                eval(init+'("'+ me.data('value') +'")');
            }
            if(typeof o.callback == 'function'){
            	o.callback(that, me);
            }
            return false;
        }).on('mouseenter', 'li:not(.s-nodata)', function(){
            $(this).addClass('s-crt').siblings().removeClass('s-crt');
        }).end().find('.ui-imitselect-search input').on('keyup', function(){
            var val = $.trim($(this).val()), 
                cache = $(list), 
                count = cache.size(),
                styleTemp = {height:'auto', overflowY:'visible'};
            if(val){
                var temp = [];
                cache.each(function(){
                    var me = $(this), value = me.data('value').toString(), text = $.trim(me.text());
                    if(value.indexOf(val) !== -1 || text.indexOf(val) !== -1){
                        temp.push(me[0]);
                    }
                });
                if(temp.length){
                    cache = $(temp);
                }
                else{
                    cache = $('<li class="s-nodata">'+ o.search.text +'</li>');
                }
                count = cache.size();
            }
            if(count > o.count){
                styleTemp = {height:itemHeight*o.count, overflowY:'scroll'};
            }
            selectbox.html(cache).css(styleTemp);
        });
        
        $(document).on('click', function(){
            imitselect.removeClass('s-show');
        });
        
    }).hide();
}