/**
 * @filename jquery.calendar.js
 * @author Aniu[2016-08-08 20:10]
 * @update Aniu[2016-12-05 08:34]
 * @version v1.4.9
 * @description 日历
 */
 
;!(function(window, document, $, undefined){
    var Calendar = function(options){
        var that = this;
        that.options = $.extend({
            //自定义皮肤
            theme:'',
            //填充目标
            target:'',
            //填充目标，仅点击自身触发
            elem:'',
            //格式化时间 y年 M月 d日 h小时 m分钟 s秒
            format:'yyyy-MM-dd',
            //连接符号
            joint:' - ',
            //可用日期最小时间
            min:'',
            //可用日期最大时间
            max:'',
            //开始时间
            startime:'',
            //初始化时间
            initime:'',
            //组件显示容器
            container:'body',
            //下拉展示年数量
            yearcount:6,
            //当只显示月时，月份一行显示数量
            monthcount:6,
            //下拉模式显示数量，大于0则开启
            drowdown:0,
            //是否允许跨年或月
            istride:true,
            //是否显示2个日历面板
            istwo:false,
            //只显示月
            ismonth:false,
            //是否显示时分秒
            istime:false,
            //是否可以选择年月
            isdate:true,
            //是否能关闭组件
            ishide:true,
            //是否点击日期关闭组件
            isclose:true,
            //是否可以点击非本月
            isclick:true,
            //是否展示上月
            isprev:true,
            //是否展示下月
            isnext:true,
            //是否开启选择区间
            iscope:false,
            //异步加载数据
            ajax:null,
            //显示按钮
            button:[{
                name:'clear',
                text:'清除'
            },{
                name:'today',
                text:'今天'
            },{
                name:'confirm',
                text:'确定'
            },{
                name:'close',
                text:'关闭'
            }],
            //配置快速选择区间按钮
            scope:[],
            //选择日期组件关闭时回调函数
            onchoose:$.noop,
            //选择日期时回调函数
            onselect:$.noop,
            //组件显示时回调函数
            onshow:$.noop,
            //组件隐藏时回调函数
            onhide:$.noop,
            //组件重置位置时回调函数
            onresize:$.noop,
            //编辑单元格
            editcell:null
        }, Calendar.config||{}, options||{});
        //将options备份，重置时将更改的选项还原
        that.optionsCache = $.extend({}, that.options)
        that.index = ++Calendar.id;
        Calendar.box[that.index] = that
    }, win = $(window), doc = $(document);
    
    //点击页面隐藏日历组件
    doc.click(function(e){
		Calendar.hide();
		Calendar.current = -1
    });
    
    //窗口缩放时重置日历显示位置
    win.resize(function(){
        $.each(Calendar.box, function(k, o){
            if(o.isshow && o.options.ishide){
                o.resize()
            }
		})
    })
    
    //存储对象实例
    Calendar.box = {};
    
    //给实例绑定唯一id
    Calendar.id = 0;
    
    //全局配置
    Calendar.config = {};
    
    //target上增加属性存储id，目的是解决重复创建实例的问题，直接从Calendar.box中取
    Calendar.attr = '_calendarid_';
    
    //定义双日历添加内容类型，第一个是前置，第二个是后置
    Calendar.add = ['prepend', 'append'];
    
    //定义日历时间title
    Calendar.week = ['日', '一', '二', '三', '四', '五', '六'];
    
    //定义时分秒弹出框title
    Calendar.time = {hour:'小时', minute:'分钟', second:'秒数'};
    
    //此事件集合下不会触发组件调用
    Calendar.filterEvent = ['load', 'readystatechange', 'DOMContentLoaded'];
    
    //隐藏日历
    Calendar.hide = function(){
        $.each(Calendar.box, function(k, o){
            if(o.isshow){
                if(o.options.ishide && o.index !== Calendar.current){
                    o.hide()
                }
                else if(o.options.container !== 'body'){
                    o.selectRemove()
                }
            }
		})
    }
    
    //获取容器边框以及内边距宽度
    Calendar.getSize = function(selector, dir, attr){
        var size = 0;
        attr = attr || 'border';
        dir = dir || 'tb';
        if(attr === 'all'){
            return Calendar.getSize(selector, dir) + Calendar.getSize(selector, dir, 'padding')
        }
        var arr = [{
            border:{
                lr:['LeftWidth', 'RightWidth'],
                tb:['TopWidth', 'BottomWidth']
            }
        }, {
            padding:{
                lr:['Left', 'Right'],
                tb:['Top', 'Bottom']
            }
        }, {
            margin:{
                lr:['Left', 'Right'],
                tb:['Top', 'Bottom']
            }
        }];
        $.each(arr, function(key, val){
            if(val[attr]){
                $.each(val[attr][dir], function(k, v){
                    var value = parseInt(selector.css(attr+v));
                    size += isNaN(value) ? 0 : value
                });
            }
        });
        return size
    }
    
    //格式化时间
    Calendar.format = function(scope, format, flag){
        var date, timestamp;
        if(typeof scope === 'number'){
            if(format === true){
                flag = true;
                format = ''
            }
            if(flag === true){
                timestamp = scope
            }
            else{
                timestamp = new Date().getTime() + scope*86400000
            }
            date = new Date(timestamp)
        }
        else if($.isArray(scope) && scope[0] && scope[1]){
            date = new Date(scope[0], scope[1]-1, Calendar.getDay(scope[0], scope[1]))
        }
        else{
            if(typeof scope === 'string'){
                format = scope
            }
            date = new Date()
        }
        if(!format){
            format = 'yyyy-MM-dd'
        }
        var map = {
            'y':date.getFullYear().toString(),
            'M':date.getMonth()+1,
            'd':date.getDate(),
            'h':date.getHours(),
            'm':date.getMinutes(),
            's':date.getSeconds()
        }
        format = format.replace(/([yMdhms])+/g, function(all, single){
            var value = map[single];
            if(value !== undefined){
                if(single === 'y'){
                    return value.substr(4-all.length)
                }
                if(all.length > 1){
                   value = '0' + value;
                   value = value.substr(value.length-2)
                } 
                return value
            }
            return all
        });
        return format
    }
    
    //获取所有月的天数
    Calendar.getDay = function(year, month){
        var arr = [31, ((year % 4) == 0 ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if(!month){
            return arr
        }
        return arr[month-1]
    }
    
    Calendar.prototype = {
        constructor:Calendar,
        init:function(init){
            var that = this, opts = that.options;
            
            if(opts.iscope){
                opts.isclose = false
            }
            
            if(opts.ismonth || opts.drowdown > 0){
                opts.istime = false
            }
            
            if(opts.target){
                that.target = $(opts.target);
                that.target[0][Calendar.attr] = that.index
            }
            
            if(init !== false){
                that.run()
            }
            else{
                that.initVal()
            }
            
            return (that.api = {
                //重设options值
                set:function(key, val){
                    if(key === 'value'){
                        that.setVal(val||'')
                    }
                    else if(key || val){
                        if($.isPlainObject(key)){
                            if((key['max'] || key['min']) && key['initime'] === undefined){
                                key['initime'] = key['max'] || key['min']
                            }
                            that.options = $.extend(that.options, key)
                        }
                        else{
                            if(key == 'max' || key == 'min'){
                                that.options['initime'] = val
                            }
                            that.options[key] = val
                        }
                        that.run(true)
                    }
                    return this
                },
                //获取options值
                get:function(key){
                    if(!key){
                        return that.options
                    }
                    else if(key === 'value'){
                        return that.setVal(false)||''
                    }
                    else{
                        return that.options[key]
                    }
                },
                //显示组件
                show:function(){
                    that.run();
                    Calendar.current = -1;
                    return this
                },
                //隐藏组件
                hide:function(flag){
                    if(that.elem){
                        that.hide();
                        if(flag === true){
                            that.elem.remove();
                            that.elem = null
                        }
                    }
                    return this
                },
                //销毁组件
                destroy:function(){
                    that.api.hide(true);
                    if(that.target){
                        that.target.off(opts.event||'click', that.eventCallback||function(){})
                    }
                    delete Calendar.box[that.index]
                },
                //重置日历为初始状态
                reset:function(){
                    that.options = $.extend(that.options, that.optionsCache);
                    return this
                }
            });
        },
        run:function(setOpts){
            var that = this, opts = that.options;
            if(setOpts === true){
                if((!that.startime && !that.initime) || 
                    (opts.min && that.getTime(that.startime) < that.getTime(that.validDate(opts.min, true))) || 
                    (opts.max && that.getTime(that.initime) > that.getTime(that.validDate(opts.max, true)))){
                    that.setVal('')
                }
                else{
                    return
                }
            }
            
            if(!that.elem){
                that.createWrap()
            }
            
            if(opts.ishide){
                Calendar.current = that.index;
                Calendar.hide()
            }

            that.initVal();
            that.show();
            if($.isPlainObject(opts.ajax)){
                that.createBody(true)
            }
        },
        initVal:function(){
            var that = this, opts = that.options;
            that.max = opts.max ? that.getTime(that.validDate(opts.max, true)) : 0;
            that.min = opts.min ? that.getTime(that.validDate(opts.min, true)) : 0;
            var val = '';
            
            if(that.target){
                var target = that.target[0];
                if(target){
                    if(target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA'){
                        val = that.target.val()
                    }
                    else{
                        val = that.target.text()
                        
                    }
                    val = that.validDate(val)
                }
            }
            
            if(val){
                val = val.split(opts.joint);
                if(val.length === 1){
                    that.initime = that.startime = that.validDate(val[0], true)
                }
                else{
                    that.startime = that.validDate(val[0], true);
                    that.initime = that.validDate(val[1], true)
                }
            }
            else{
                that.initime = opts.initime ? that.validDate(opts.initime, true) :  Calendar.format();
                that.startime = opts.iscope && opts.startime ? that.validDate(opts.startime, true) : that.initime
            }
            that.reverse();
            that.setCurrent()
        },
        createWrap:function(){
            var that = this, opts = that.options;
            that.container = $(opts.container || 'body');
            that.elem = $('<div class="ui-calendar" style="display:none;"></div>').appendTo(that.container);
            if(opts.drowdown > 0){
                that.elem.addClass('ui-calendar-dropdown')
            }
            else if(opts.ismonth){
                that.elem.addClass('ui-calendar-month')
            }
            if(opts.istwo){
                that.elem.addClass('ui-calendar-multi')
            }
            if(opts.theme){
                that.elem.addClass('t-calendar-'+opts.theme)
            }
            if(that.container.get(0).nodeName === 'BODY'){
                that.elem.css('position', 'absolute')
            }
            else{
                opts.isclose = false
            }
            that.bindEvent()
        },
        createContent:function(){
            var that = this, opts = that.options, scope = opts.scope.length, button = opts.button.length, tpl = '';
            if(scope){
                var i = 0;
                var startime = Calendar.format(that.getTime(that.startime), opts.format, true);
                var initime = Calendar.format(that.getTime(that.initime), opts.format, true);
                var initdate = Calendar.format(opts.format);
                tpl += '<div class="ui-calendar-head clearfix">';
                for(i; i<scope; i++){
                    var btn = opts.scope[i];
                    var crt = '';
                    var startdate = Calendar.format(parseInt(btn.value), opts.format);
                    if((initime === startdate && startime === initdate) || (initime === initdate && startime === startdate)){
                        crt = 'class="s-crt"';
                    }
                    tpl += '<em scope="'+ btn.value +'" '+ crt +'>'+ btn.text +'</em>'
                }
                tpl += '</div>'
            }
            tpl += '<div class="ui-calendar-body clearfix">'+ that.createBody() +'</div>';
            if(opts.istime || button){
                tpl += '<div class="ui-calendar-foot clearfix">';
                if(opts.istime){
                    tpl += '<p><b>时间</b>';
                    if(opts.format.indexOf('h') !== -1){
                        tpl += '<em type="hour">'+ that.initime[3] +'</em>'
                    }
                    if(opts.format.indexOf('m') !== -1){
                        tpl += '<em type="minute">'+ that.initime[4] +'</em>'
                    }
                    if(opts.format.indexOf('s') !== -1){
                        tpl += '<em type="second">'+ that.initime[5] +'</em>'
                    }
                    tpl += '</p>'
                }
                if(button){
                    tpl += '<span class="calendar-btn">';
                    $.each(opts.button, function(k, btn){
                        tpl += '<em class="'+ btn.name +'">'+ btn.text +'</em>'
                    })
                    tpl += '</span>'
                }
                tpl += '</div>'
            }
            return tpl
        },
        createWeek:function(){
            var that = this, opts = that.options, tpl = '<tr>', i = 0;
            for(i; i<7; i++){
                var rest = i === 0 || i === 6 ? ' class="rest"' : '';
                var week = Calendar.week[i];
                if(opts.week && opts.week[i]){
                    week = opts.week[i]
                }
                tpl += ('<th'+ rest +'>' + week + '</th>')
            }
            tpl += '</tr>';
            return tpl
        },
        createMain:function(year, month){
            var that = this, tpl = '';
            if(!that.options.ismonth){
                var prevdate = that.resetDate(year, month, -1);
                var nextdate = that.resetDate(year, month, 1);
                return '<div class="ui-calendar-main">\
                            <div class="ui-calendar-tab">\
                                <span class="tabdir tab-left">\
                                    <em'+ that.setClass('dirbtn prevYear', year-1+month, that.getcb('yyyy-MM')) +'></em>\
                                    <em'+ that.setClass('dirbtn prevMonth', prevdate.year+''+prevdate.month, that.getcb('yyyy-MM')) +'></em>\
                                </span>\
                                <div class="ui-calendar-date">\
                                    <dl class="calendar-year">\
                                        <dt type="year">'+ year +'</dt>\
                                    </dl>\
                                    <b>年</b>\
                                    <dl class="calendar-month">\
                                        <dt type="month">'+ month +'</dt>\
                                    </dl>\
                                    <b>月</b>\
                                </div>\
                                <span class="tabdir tab-right">\
                                    <em'+ that.setClass('dirbtn nextMonth', nextdate.year+''+nextdate.month, that.getcb('yyyy-MM')) +'></em>\
                                    <em'+ that.setClass('dirbtn nextYear', year+1+month, that.getcb('yyyy-MM')) +'></em>\
                                </span>\
                            </div>\
                            <table class="ui-calendar-table">\
                                <thead>'+ that.createWeek() +'</thead>\
                                <tbody>'+ that.createCell(year, month) +'</tbody>\
                            </table>\
                        </div>'
            }
            return '<div class="ui-calendar-main">\
                        <div class="ui-calendar-tab">\
                            <span class="tabdir tab-left">\
                                <em class="dirbtn prevYear"></em>\
                            </span>\
                            <div class="ui-calendar-date">\
                                <dl>\
                                    <dt type="year">'+ year +'</dt>\
                                </dl>\
                                <b>年</b>\
                            </div>\
                            <span class="tabdir tab-right">\
                                <em class="dirbtn nextYear"></em>\
                            </span>\
                        </div>\
                        <table class="ui-calendar-table"><tbody>'+ that.createList(year) +'</tbody></table>\
                    </div>'
        },
        //创建主体
        createBody:function(flag){
            var that = this, opts = that.options, tpl = '';
            if(opts.drowdown > 0){
                var format = opts.format;
                if((/h+/g).test(format)){
                    tpl += that.createTime('hour', that.getTimeArr(23), that.startime[3], true)
                }
                if((/m+/g).test(format)){
                    tpl += that.createTime('minute', that.getTimeArr(59), that.startime[4], true)
                }
                if((/i+/g).test(format)){
                    tpl += that.createTime('second', that.getTimeArr(59), that.startime[5], true)
                }
            }
            else{
                var year = that.current[0];
                var month = that.current[1];
                tpl += that.resetBody(flag, 0, year, month);
                if(opts.istwo){
                    if(opts.ismonth){
                        year = that.nextcurrent[0];
                        month = that.nextcurrent[1]
                    }
                    else{
                        var date = that.resetDate(year, month, 1);
                        year = date.year;
                        month = date.month;
                    }
                    tpl += that.resetBody(flag, 1, year, month)
                }
            }
            return tpl;
        },
        //加载主体部分
        resetBody:function(flag, index, year, month){
            var that = this, opts = that.options, ajax = opts.ajax;
            month = that.mend(month)
            if(flag){
                if($.isPlainObject(ajax)){
                    var success = ajax.success;
                    var error = ajax.error;
                    ajax.loading = $.extend({
                        show:$.noop,
                        hide:$.noop
                    }, ajax.loading||{});
                    var data = ajax.data;
                    if(typeof data === 'function'){
                        data = data(year, month) || {};
                    }
                    ajax.loading.show(that.elem);
                    $.ajax($.extend({
                        dataType:'json',
                        cache:false
                    }, ajax, {
                        data:data,
                        success:function(res){
                            that.response = res;
                            that.body.find('.ui-calendar-main').eq(index).remove();
                            that.body[Calendar.add[index]](that.createMain(year, month));
                            if(typeof success === 'function'){
                                success.call(this, res, that.elem)
                            }
                            ajax.loading.hide(that.elem)
                        },
                        error:function(xhr, textStatus, errorThrown){
                            if(typeof error === 'function'){
                                error.call(this, xhr, that.elem)
                            }
                            ajax.loading.hide(that.elem)
                        }
                    }))
                }
                else{
                    that.body.find('.ui-calendar-main').eq(index).remove();
                    that.body[Calendar.add[index]](that.createMain(year, month))
                }
            }
            else{
                return that.createMain(year, month)
            }
        },
        //创建单元格
        createCell:function(year, month){
            var that = this, opts = that.options, a = 1, b = 1, c = 1, d = 1, tpl = '';
            var startime = that.getTime(that.startime), initime = that.getTime(that.initime);
            var date = new Date(year, month-1, 1);
            //获取月初是星期几
            var week = date.getDay();
            if(week === 7){
                week = 0
            }
            var monthArray = Calendar.getDay(year);
            var days = monthArray[month-1];
            for(a; a<43; a++){
                if((a-1)%7 === 0){
                    tpl += '<tr>'
                }
                if(a > week && b <= days){
                    tpl += '<td data-year="'+ year +'" data-month="'+ month +'" data-day="'+ that.mend(b) +'"'+ that.setClass('cell', startime, [year, month, b], initime) +'><span>'+ that.editCell(that.mend(b)) +'</span></td>';
                    b++
                }
                else if(opts.isprev && a <= week && c <= week){
                    //获取上月末尾时间
                    var lastMonth = month-1;
                    var lastYear = year;
                    if(lastMonth === 0){
                        lastMonth = 12;
                        lastYear--
                    }
                    var end = monthArray[lastMonth-1];
                    var start = end - week;
                    if(start+c <= end){
                        var lastDay = start+c;
                        tpl += '<td data-year="'+ lastYear +'" data-month="'+ lastMonth +'" data-day="'+ that.mend(lastDay) +'"'+ that.setClass('cell other-cell', startime, [lastYear, lastMonth, lastDay], initime) +'><span>'+ that.editCell(that.mend(lastDay), true) +'</span></td>'
                    }
                    c++
                }
                else if(opts.isnext && a < 43 && a > days+week){
                    //获取下月月初时间
                    var nextMonth = (month|0)+1;
                    var nextYear = year;
                    if(nextMonth === 13){
                        nextMonth = 1;
                        nextYear++
                    }
                    tpl += '<td data-year="'+ nextYear +'" data-month="'+ nextMonth +'" data-day="'+ that.mend(d) +'"'+ that.setClass('cell other-cell', startime, [nextYear, nextMonth, d], initime) +'><span>'+ that.editCell(that.mend(d), true) +'</span></td>';
                    d++
                }
                else{
                    tpl += '<td></td>'
                }
                if(a%7 === 0){
                    tpl += '</tr>'
                }
            }
            if(!opts.isprev){
                tpl = tpl.replace(/^\<tr\>(\<td\>\<\/td\>){7}\<\/tr\>/g, '')
            }
            if(!opts.isnext){
                tpl = tpl.replace(/\<tr\>(\<td\>\<\/td\>){7}\<\/tr\>$/g, '')
            }
            delete that.response;
            return tpl
        },
        createList:function(year){
            var that = this, opts = that.options, i = 1, tpl = '';
            var startime = that.getTime([that.startime[0], that.startime[1], that.startime[2]]), initime = that.getTime([that.initime[0], that.initime[1], that.initime[2]]);
            var count = opts.monthcount;
            for(i; i<=12; i++){
                var month = that.mend(i);
                if((i-1)%count === 0){
                    tpl += '<tr>'
                }
                tpl += '<td'+ that.setClass('cell', startime, [year, month, '01'], initime) +' data-year="'+ year +'" data-month="'+ month +'" data-day="01"><span>'+ that.editCell(month) +'</span></td>';
                if(i%count === 0){
                    tpl += '</tr>'
                }
            }
            return tpl
        },
        createDate:function(index, val, month){
            var that = this, opts = that.options, i = 0, cls;
            var tpl = '<dd><i></i><s></s>';
            if(!month){
                tpl += '<span class="upYear"><i></i></span>'
            }
            tpl += '<ul class="clearfix">';
            var crt = that[index === 0 ? 'current':'nextcurrent'][0];
            var cb = that.getcb('yyyy-MM');
            if(month){
                val = crt+val;
                for(i=1; i<=12; i++){
                    var m = that.mend(i);
                    var temp = crt + m;
                    tpl += '<li'+ that.setClass('', temp, val, cb) +'>'+ m +'</li>'
                }
            }
            else{
                var crtmonth = that.current[1];
                var count = opts.yearcount/2;
                var len = (val|0)+count-1;
                for(i=val-count; i<=len; i++){
                    tpl += '<li'+ that.setClass('', i+crtmonth, crt+crtmonth, cb) +'>'+ i +'</li>'
                }
            }
            tpl += '</ul>';
            if(!month){
                tpl += '<span class="downYear"><i></i></span>'
            }
            tpl += '</dd>';
            return tpl
        },
        createTime:function(type, arr, crt, hide){
            var that = this, opts = that.options, len = arr.length, i = 0;
            var tpl = '<div class="ui-calendar-time '+ type +'">';
            if(!hide){
                tpl += '<div class="ui-calendar-timehead">'+ Calendar.time[type] +'<i title="关闭">×</i></div>'
            }
            var timebody = '<div class="ui-calendar-timebody clearfix" type="'+ type +'">';
            var format = 'yyyy-MM-dd';
            var initime = that.initime[0] + that.initime[1] + that.initime[2];
            var startime = that.startime[0] + that.startime[1] + that.startime[2];
            if(type == 'hour'){
                format += '-hh'
            }
            else if(type == 'minute'){
                format += '-hh-mm';
                initime = initime + that.initime[3];
                startime = startime + that.startime[3]
            }
            else{
                format += '-hh-mm-ss';
                initime = initime + that.initime[3] + that.initime[4];
                startime = startime + that.startime[3] + that.startime[4]
            }
            var max = that.max ? Calendar.format(that.max, format, true).replace(/-/g, '') : 0;
            var min = that.min ? Calendar.format(that.min, format, true).replace(/-/g, '') : 0;
            var item = '';
            for(i; i<len; i++){
                var cls = arr[i] == crt ? 's-crt' : '';
                var start = startime + arr[i];
                var init = initime + arr[i];
                if((min && start < min) || (max && init > max)){
                    if(cls){
                        cls += ' s-dis'
                    }
                    else{
                        cls = 's-dis'
                    }
                }
                if(cls){
                    cls = ' class="'+ cls +'"'
                }
                timebody += '<span'+ cls +'>'+ arr[i] +'</span>'
            }
            timebody += '</div>';
            if(hide === 0){
                return timebody
            }
            tpl = tpl + timebody + '</div>';
            return tpl
        },
        setClass:function(name, startime, currentime, initime, cb){
            var that = this, className = '';
            var min = that.min;
            var max = that.max;
            var flag = false;
            if(typeof currentime !== 'function'){
                if(typeof currentime === 'object'){
                    currentime = that.getTime(currentime.concat([that.initime[3], that.initime[4], that.initime[5]]))
                }
                if(typeof initime === 'function'){
                    cb = initime;
                    initime = startime;
                    flag = true
                }
                if(startime <= currentime && currentime <= initime){
                    if(startime == currentime || currentime == initime){
                        className += 's-crt'
                    }
                    else{
                        className += 's-sel'
                    }
                }
                if(flag){
                    currentime = startime
                }
            }
            else{
                cb = currentime;
                currentime = startime
            }
            if(cb){
                var res = cb.call(that);
                min = res.min;
                max = res.max
            }
            if((min && currentime < min) || (max && currentime > max)){
                className += ((className ? ' ' : '') + 's-dis')
            }
            if(name){
                className = name + (className ? ' '+className : '')
            }
            return className = className ? ' class="'+ className +'"':''
        },
        setCurrent:function(){
            var that = this, opts = that.options;
            that.current = [that.startime[0], that.startime[1]];
            if(opts.ismonth){
                that.nextcurrent = [that.initime[0], that.initime[1]]
            }
        },
        editCell:function(day, other){
            var that = this, opts = that.options;
            if(typeof opts.editcell === 'function'){
                return opts.editcell(day, other, that.response) || day
            }
            return day
        },
        reverse:function(){
            var that = this;
            var startime = that.getTime(that.startime);
            var initime = that.getTime(that.initime);
            if(startime > initime){
                var tmp = initime;
                initime = startime;
                startime = tmp
            }
            that.initime = that.getArr(initime);
            that.startime = that.getArr(startime)
        },
        resetDate:function(year, month, count){
            var that = this;
            month = (month|0) + count;
            if(month == 0){
                month = 12;
                year--
            }
            else if(month == 13){
                month = 1;
                year++
            }
            return ({
                month:that.mend(month),
                year:year
            })
        },
        getcb:function(format){
            var that = this;
            format = format || 'yyyy-MM-dd';
            var max = that.max ? Calendar.format(that.max, format, true).replace(/-/g, '') : 0;
            var min = that.min ? Calendar.format(that.min, format, true).replace(/-/g, '') : 0;
            return (function(){
                return ({
                    max:max,
                    min:min
                })
            })
        },
		selectRemove:function(){
			var that = this;
			that.elem.find('.ui-calendar-tab dd').remove();
			if(that.options.drowdown<=0){
				that.elem.find('.ui-calendar-time').remove()
			}
		},
        bindEvent:function(){
            var that = this, opts = that.options;
            that.elem.on('click', function(e){
                that.selectRemove();
                e.stopPropagation()
            }).on('click', '[scope]', function(e){
                var me = $(this);
                var scope = parseInt(me.attr('scope'));
                var initdate = Calendar.format(opts.format);
                var startdate = Calendar.format(scope, opts.format);
                initime = that.getArr(that.getTime(that.validDate(initdate, true)));
                startime = that.getArr(that.getTime(that.validDate(startdate, true)));
                that.setTime(initime, startime);
                that.reverse();
                that.current[0] = initime[0];
                that.current[1] = initime[1];
                that.show();
                var date = initdate;
                if(initdate != startdate){
                    date = startdate + opts.joint + initdate
                }
                opts.onselect(date.split(opts.joint), that.elem, that.target)
            }).on('click', '.cell:not(.s-dis)'+ (!opts.isclick ? ':not(.other-cell)' : '') +', .today, .confirm', function(e){
                var me = $(this), initime = that.initime, startime = that.startime;
                var today = me.hasClass('today');
                var confirm = me.hasClass('confirm');
                if(today || confirm){
                    if(today){
                        initime = startime = that.getArr(that.getTime(false))
                    }
                }
                else{
                    //多选
                    if(opts.iscope){
                        var data = me.data();
                        if(!opts.istride){
                            if((!opts.ismonth && initime[0]+initime[1] != data.year+that.mend(data.month)) || (opts.ismonth && initime[0] != data.year)){
                                startime = data
                            }
                        }
                        if(!that.equal(initime, startime)){
                            startime = initime = data;
                            me.addClass('s-crt')
                        }
                        else{
                            initime = data;
                            if(me.hasClass('s-crt')){
                                startime = initime
                            }
                            else{
                                me.addClass('s-crt')
                            }
                        }
                        that.elem.find('[scope]').removeClass('s-crt')
                    }
                    else{
                        var main = me.closest('.ui-calendar-main');
                        if(main.index() === 0){
                            that.body.find('.s-crt, .s-sel').removeClass('s-crt s-sel');
                            initime = startime = me.addClass('s-crt').data()
                        }
                        else{
                            main.find('.s-crt, .s-sel').removeClass('s-crt s-sel');
                            initime = me.addClass('s-crt').data()
                        }
                    }
                }
                that.setTime(initime, startime);
                that.reverse();
                var enddate = Calendar.format(that.getTime(that.initime), opts.format, true);
                var startdate = Calendar.format(that.getTime(that.startime), opts.format, true);
                var date = enddate;
                if(enddate != startdate){
                    date = startdate + opts.joint + enddate
                }
                if((today || this.nodeName === 'TD') && !opts.isclose){
                    opts.onselect(date.split(opts.joint), that.elem, that.target);
                    if(opts.iscope || today){
                        if(today){
                            that.setCurrent()
                        }
                        that.show()
                    }
                    return
                }
                that.setVal(date)
                that.hide();
                opts.onchoose(date.split(opts.joint), that.elem, that.target)
            }).on('click', '.dirbtn', function(e){
                var me = $(this);
                var index = me.closest('.ui-calendar-main').index();
                if(!me.hasClass('s-dis')){
                    if(me.hasClass('prevYear')){
                        if(opts.ismonth && index === 1){
                            --that.nextcurrent[0]
                        }
                        else{
                            --that.current[0]
                        }
                    }
                    else if(me.hasClass('prevMonth')){
                        if(--that.current[1] === 0){
                            that.current[1] = 12;
                            --that.current[0]
                        }
                    }
                    else if(me.hasClass('nextYear')){
                        if(opts.ismonth && index === 1){
                            ++that.nextcurrent[0]
                        }
                        else{
                            ++that.current[0]
                        }
                    }
                    else if(me.hasClass('nextMonth')){
                        if(++that.current[1] === 13){
                            that.current[1] = 1;
                            ++that.current[0]
                        }
                    }
                    that.createBody(true)
                }
            }).on('click', '.clear', function(e){
                that.setVal('')
                opts.onselect([''], that.elem, that.target);
            }).on('click', '.close', function(e){
                that.hide()
            }).on('click', '.ui-calendar-time, .ui-calendar-tab dl, .ui-calendar-foot p em', function(e){
                e.stopPropagation()
            });
            
            if(opts.drowdown > 0){
                that.elem.on('click', '.ui-calendar-timebody span', function(){
                    var me = $(this);
                    if(!me.hasClass('s-dis')){
                        var type = me.parent().attr('type');
                        me.addClass('s-crt').siblings().removeClass('s-crt')
                        if(type == 'hour'){
                            that.initime[3] = that.startime[3] = me.text();
                            var minute = that.elem.find('.ui-calendar-timebody[type="minute"]');
                            if(minute.length){
                                minute.replaceWith(that.createTime('minute', that.getTimeArr(59), that.startime[4], 0))
                            }
                            var second = that.elem.find('.ui-calendar-timebody[type="second"]');
                            if(second.length){
                                second.replaceWith(that.createTime('second', that.getTimeArr(59), that.startime[5], 0))
                            }
                        }
                        else if(type == 'minute'){
                            that.initime[4] = that.startime[4] = me.text();
                            var second = that.elem.find('.ui-calendar-timebody[type="second"]');
                            if(second.length){
                                second.replaceWith(that.createTime('second', that.getTimeArr(59), that.startime[5], 0))
                            }
                        }
                        else{
                            that.initime[5] = that.startime[5] = me.text()
                        }
                    }
                })
                return
            }
            
            if(opts.istime){
                that.elem.on('click', '.ui-calendar-foot p em', function(e){
                    var me = $(this);
                    var type = me.attr('type');
                    var arr;
                    if(type == 'hour'){
                        arr = that.getTimeArr(23)
                    }
                    else{
                        arr = that.getTimeArr(59)
                    }
                    that.elem.find('.ui-calendar-time').remove();
                    that.elem.find('.ui-calendar-foot').append(that.createTime(type, arr, me.text()));
                }).on('click', '.ui-calendar-timehead i', function(){
                    $(this).closest('.ui-calendar-time').remove();
                }).on('click', '.ui-calendar-timebody span', function(){
                    var me = $(this);
                    if(!me.hasClass('s-dis')){
                        var type = me.parent().attr('type');
                        that.elem.find('.ui-calendar-foot p [type="'+ type +'"]').text(me.text());
                        var time = {
                            hour:'00',
                            minute:'00',
                            second:'00'
                        }
                        that.elem.find('.ui-calendar-foot p em').each(function(){
                            var em = $(this);
                            time[em.attr('type')] = em.text();
                        });
                        that.initime[3] = that.startime[3] = time.hour;
                        that.initime[4] = that.startime[4] = time.minute;
                        that.initime[5] = that.startime[5] = time.second
                    }
                    me.closest('.ui-calendar-time').remove()
                });
            }
            if(opts.isdate){
                that.elem.on('click', '.ui-calendar-date [type]', function(){
                    var me = $(this), ele = me.parent();
                    var index = 0;
                    ele.parent().find('dd').remove();
                    if(opts.ismonth){
                        index = me.closest('.ui-calendar-main').index()
                    }
                    ele.append(that.createDate(index, me.text(), me.attr('type') === 'month'))
                }).on('click', '.ui-calendar-date li', function(){
                    var me = $(this);
                    var dd = me.closest('dd');
                    if(!me.hasClass('s-dis')){
                        var type = dd.parent().find('dt').attr('type');
                        var mod = 'current';
                        if(opts.ismonth){
                            var index = me.closest('.ui-calendar-main').index();
                            index === 1 && (mod = 'nextcurrent')
                        }
                        that[mod][type === 'year' ? 0 : 1] = me.text();
                        that.createBody(true)
                    }
                    dd.remove()
                }).on('click', '.ui-calendar-date dd span', function(){
                    var me = $(this);
                    var ele = me.closest('dl');
                    var item = me.siblings('ul').children('li');
                    var year;
                    var index = 0;
                    if(opts.ismonth){
                        index = me.closest('.ui-calendar-main').index()
                    }
                    var count = opts.yearcount/2;
                    if(me.hasClass('upYear')){
                        year = item.first().text() - count
                    }
                    else{
                        year = (item.last().text()|0) + count + 1;
                    }
                    ele.find('dd').remove();
                    ele.append(that.createDate(index, year))
                })
            }
        },
        setTime:function(initime, startime, time){
            var that = this;
            if(!startime){
                startime = initime
            }
            that.initime[0] = initime[0]||initime['year'];
            that.initime[1] = that.mend(initime[1]||initime['month']);
            that.initime[2] = that.mend(initime[2]||initime['day']);
            that.startime[0] = startime[0]||startime['year'];
            that.startime[1] = that.mend(startime[1]||startime['month']);
            that.startime[2] = that.mend(startime[2]||startime['day']);
            if(time){
                that.initime[3] = that.startime[3] = time.hour;
                that.initime[4] = that.startime[4] = time.minute;
                that.initime[5] = that.startime[5] = time.second
            }
        },
        getArr:function(time){
            var date = Calendar.format(time, this.options.ismonth ? 'yyyy MM 01 00 00 00' : 'yyyy MM dd hh mm ss', true);
            date = date.split(' ');
            return date
        },
        //获取时间戳
        getTime:function(date){
            if(date){
                if($.isArray(date)){
                    return new Date(date[0], date[1]-1, date[2]||1, date[3]||0, date[4]||0, date[5]||0).getTime()
                }
                else{
                    //IE8-不支持横杠
                    date = date.replace(/[-.]/g, '/');
                    return new Date(date).getTime()
                }
            }
            if(date === false){
                return new Date().getTime()
            }
            return 0
        },
        getTimeArr:function(num){
            var arr = [];
            for(var i=0; i<=num; i++){
                arr.push(this.mend(i))
            }
            return arr
        },
        //填充目标元素值
        setVal:function(val){
            var that = this, target = that.target;
            if(target){
                var elem = that.target.get(0);
                if(elem.nodeName === 'INPUT' || elem.nodeName === 'TEXTAREA'){
                    if(val === false){
                        return target.val()
                    }
                    target.val(val)
                }
                else if(elem != document){
                    if(val === false){
                        return target.text()
                    }
                    target.text(val)
                }
            }
        },
        //校验日期格式
        validDate:function(date, regex){
            var that = this, opts = that.options;
            if(regex){
                if(/^h/.test(opts.format)){
                    date = Calendar.format() + ' ' + date
                }
                else if(/M$/.test(opts.format)){
                    date += '/01'
                }
                else if(/h$/.test(opts.format)){
                    date += ':00:00'
                }
            }
            else{
                if(date && (!(/^\d{2,4}\D+\d{1,2}/g).test(date))){
                    that.setVal('');
                    return ''
                }
            }
            return date
        },
        //判断2个数组是否键值相等
        equal:function(arr1, arr2){
            var flag = true, i = 0, len = arr1.length;
            for(i; i<len; i++){
                if(arr1[i] != arr2[i]){
                    flag = false;
                    break
                }
            }
            return flag
        },
        //补齐0
        mend:function(day){
            day = day.toString();
            day.length == 1 && (day = '0'+day);
            return day
        },
        //显示组件
        show:function(){
            var that = this, opts = that.options;
            that.isshow = true;
            that.body = that.elem.html(that.createContent()).find('.ui-calendar-body');
            if(that.target){
                if(opts.drowdown > 0){
                    that.resetSize()
                }
                that.resize()
            }
            opts.onshow(that.elem);
            that.elem.show()
        },
        //隐藏组件
        hide:function(){
            var that = this;
            that.isshow = false;
            that.elem.hide();
            that.options.onhide(that.elem)
        },
        //重置组件显示位置
        resize:function(){
            var that = this;
            var offset = that.target.offset();
            var height = that.target.outerHeight() - 1;
            var top = offset.top + height;
            var oheight = that.elem.outerHeight();
            var stop = win.scrollTop();
            if(win.height() + stop - top < oheight && offset.top-stop >= oheight){
                top = top - height - oheight
            }
            that.elem.css({
                top:top,
                left:offset.left
            });
            if(typeof that.options.onresize === 'function'){
            	that.options.onresize(that.elem)
            }
        },
        //重置时分秒下拉框大小，以及选中时间控制在中间显示
        resetSize:function(){
            var that = this, opts = that.options;
            var width = 0;
            that.elem.find('.ui-calendar-time').each(function(){
                var time = $(this);
                var span = time.find('span');
                var height = span.outerHeight();
                width += time.outerWidth() + Calendar.getSize(time, 'lr', 'margin');
                time.height(height*opts.drowdown);
                var mid = Math.floor(opts.drowdown/2);
                var crt = time.find('span.s-crt').index() - mid;
                setTimeout(function(){
                    try{
                        time.scrollTop(crt > 0 ? crt*height : 0)
                    }
                    catch(e){}
                })
            })
            that.elem.width(width + Calendar.getSize(that.elem.find('.ui-calendar-body'), 'lr', 'all'))
        }
    }
    
    //修复firefox获取不到event对象问题
    if($.browser.mozilla){
        var evt = function(){
            var func = evt.caller; 
            while(func != null){
                var arg0 = func.arguments[0];  
                if(arg0 instanceof Event){
                    return arg0
                }  
                func = func.caller; 
            } 
            return null
        }
        window.__defineGetter__('event', evt)
    }
    
    $.extend({
        calendar:function(options){
            options = options || {};
            var event = window.event, target = null;
            if(event != undefined){
                target = event.target || event.srcElement;
                if(target === document || $.inArray(event.type, Calendar.filterEvent) !== -1){
                    target = null
                }
            }
            if(options.elem || (options.target && (event === undefined || target === null))){
                options.target = (target = $(options.elem||options.target))[0];
                var calendar = Calendar.box[options.target[Calendar.attr]] || new Calendar(options);
                calendar.eventCallback = function(e){
                    if(!target.hasClass('s-dis') && !target.prop('disabled')){
                        calendar.run()
                    }
                }
                target.off(options.event||'click', calendar.eventCallback)
                      .on(options.event||'click', calendar.eventCallback);
                return calendar.init(false)
            }
            else{
                options.target = $(options.target||target)[0];
                if(options.target){
                    return (Calendar.box[options.target[Calendar.attr]] || new Calendar(options)).init()
                }
                return new Calendar(options).init()
            }
        }
    })
    
    $.each(['config', 'date', 'hide', 'destroy', 'reset'], function(index, method){
        $.calendar[method] = function(){
            var that = this;
            var args = arguments;
            var model = args[0];
            if(method === 'date'){
                return Calendar.format.apply(that, args)
            }
            else if(method === 'config'){
                if(typeof model === 'object'){
                    $.extend(Calendar.config, model)
                }
                else if(typeof model === 'string' && args[1]){
                    Calendar.config[model] = args[1]
                }
            }
            else{
                var param = args.length > 1 ? Array.prototype.slice.call(args, 1) : [];
                if($.isArray(model)){
                    $.each(model, function(k, mod){
                        $.calendar[method].apply(that, [].concat(mod, param))
                    })
                }
                else if(typeof model === 'object'){
                    model[method].apply(that, param)
                }
                else if(typeof model === 'string'){
                    $.each(Calendar.box, function(key, object){
                        if(object.options.theme === model){
                            object.api[method].apply(that, param)
                            return false
                        }
                    })
                }
                else{
                    if(typeof model === 'boolean'){
                        param = args
                    }
                    $.each(Calendar.box, function(key, object){
                        if(object.options.ishide){
                            object.api[method].apply(that, param)
                        }
                    })
                }
            }
        }
    })

})(this, document, jQuery);