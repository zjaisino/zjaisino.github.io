/**
 * @filename jquery.calendar.js
 * @author Aniu[2016-08-08 20:10]
 * @update Aniu[2016-08-10 19:55]
 * @version v1.1.1
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
            //是否显示2个日历面板
            istwo:false,
            //只显示月
            ismonth:false,
            //是否显示时分秒
            istime:false,
            //是否显示其它月
            isother:true,
            //是否能关闭组件
            ishide:true,
            //是否点击日期关闭组件
            isclick:true,
            //是否开启选择区间，需要按住ctrl键
            iscope:false,
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
            //组件隐藏时回调函数
            onhide:$.noop
        }, options||{});
        that.index = Calendar.index++;
        Calendar.box[that.index] = that;
    }, win = $(window)
    
    $(document).click(function(){
        if(Calendar.current >= 0){
            Calendar.box[Calendar.current].hide();
        }
    });
    
    win.resize(function(){
        if(Calendar.current >= 0){
            Calendar.box[Calendar.current].resize();
        }
    })
    
    //存储对象实例
    Calendar.box = {};
    
    //给实例绑定唯一id
    Calendar.index = 0;
    
    //当前显示的id
    Calendar.current = -1;
    
    Calendar.format = function(scope, format){
        var date, timestamp;
        if(scope && typeof scope === 'number'){
            if(scope > 0 && scope.toString().length === 13){
                timestamp = scope;
            }
            else{
                timestamp = new Date().getTime() + scope*86400000;
            }
            date = new Date(timestamp);
        }
        else{
            if(typeof scope === 'string'){
                format = scope;
            }
            date = new Date();
        }
        if(!format){
            format = 'yyyy-MM-dd';
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
                    return value.substr(4-all.length);
                }
                if(all.length > 1){
                   value = '0' + value;
                   value = value.substr(value.length-2);
                } 
                return value;
            }
            return all;
        });
        return format;
    }
    
    Calendar.prototype = {
        constructor:Calendar,
        init:function(init){
            var that = this, opts = that.options;
            if(opts.iscope){
                opts.isclick = false;
            }
            if(opts.ismonth){
                opts.istime = false;
            }
            if(opts.target){
                that.target = opts.target.data('calendarindex', that.index);
                that.target.bind('setVal', function(e, val){
                    if(this.nodeName === 'INPUT' || this.nodeName === 'TEXTAREA'){
                        that.target.val(val);
                    }
                    else{
                        that.target.text(val);
                    }
                });
            }
            if(init !== false){
                that.run();
            }
            return ({
                setOptions:function(key, val){
                    if(key || val){
                        if($.isPlainObject(key)){
                            that.options = $.extend(that.options, key);
                        }
                        else{
                            that.options[key] = val;
                        }
                        that.run(true);
                    }
                },
                show:that.run,
                hide:that.hide
            });
        },
        run:function(setOpts){
            var that = this, opts = that.options;
            that.max = opts.max ? that.getTime(opts.max) : 0;
            that.min = opts.min ? that.getTime(opts.min) : 0;
            if(setOpts === true){
                if((that.getTime(that.initime) < that.min) || (that.max && that.getTime(that.initime) > that.max)){
                    that.target && that.target.trigger('setVal', '');
                }
                else{
                    return;
                }
            }
            if(!that.elem){
                that.createWrap();
            }
            that.initVal();
            that.show();
        },
        initVal:function(){
            var that = this, opts = that.options;
            var val = '';
            if(that.target){
                var target = that.target[0];
                if(target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA'){
                    val = that.target.val();
                }
                else{
                    val = that.target.text();
                }
                val = that.validDate(val);
            }
            if(val){
                val = val.split(opts.joint);
                if(val.length === 1){
                    that.initime = that.startime = val[0];
                }
                else{
                    that.startime = val[0];
                    that.initime = val[1];
                }
            }
            else{
                that.initime = opts.initime || Calendar.format();
                that.startime = opts.startime || that.initime;
            }
            that.startime = that.getArr(that.getTime(that.startime));
            that.initime = that.getArr(that.getTime(that.initime));
            that.current = [that.startime[0], that.startime[1]];
            if(opts.ismonth){
                that.nextcurrent = [that.initime[0], that.initime[1]];
            }
        },
        reverse:function(){
            var that = this;
            var startime = that.getTime(that.startime);
            var initime = that.getTime(that.initime);
            if(startime > initime){
                var tmp = initime;
                initime = startime;
                startime = tmp;
            }
            return [initime, startime];
        },
        createWrap:function(){
            var that = this, opts = that.options;
            that.container = $(opts.container || 'body');
            that.elem = $('<div class="ui-calendar" style="display:none;"></div>').appendTo(that.container);
            if(opts.istwo){
                that.elem.addClass('ui-calendar-multi');
            }
            if(opts.theme){
                that.elem.addClass('t-calendar-'+opts.theme);
            }
            if(that.container.get(0).nodeName === 'BODY'){
                that.elem.css('position', 'absolute');
            }
            else{
                opts.isclick = false;
            }
            that.bindEvent();
        },
        createContent:function(){
            var that = this, opts = that.options, scope = opts.scope.length, button = opts.button.length, html = '';
            if(scope){
                var i = 0;
                var time = that.reverse();
                var startime = Calendar.format(that.getTime(that.startime), opts.format);
                var initime = Calendar.format(that.getTime(that.initime), opts.format);
                var initdate = Calendar.format(opts.format);
                html += '<div class="ui-calendar-head clearfix">';
                for(i; i<scope; i++){
                    var btn = opts.scope[i];
                    var crt = '';
                    var startdate = Calendar.format(parseInt(btn.value), opts.format);
                    if((initime === startdate && startime === initdate) || (initime === initdate && startime === startdate)){
                        crt = 'class="s-crt"';
                    }
                    html += '<em scope="'+ btn.value +'" '+ crt +'>'+ btn.text +'</em>';
                }
                html += '</div>';
            }
            html += '<div class="ui-calendar-body clearfix">'+ that.createBody() +'</div>';
            if(opts.istime || button){
                html += '<div class="ui-calendar-foot">';
                if(opts.istime){
                    html += '<p>';
                    html += '<em class="hour">'+ that.initime[3] +'</em><em class="minute">'+ that.initime[4] +'</em><em class="second">'+ that.initime[5] +'</em>';
                    html += '</p>';
                }
                if(button){
                    html += '<span>';
                    $.each(opts.button, function(k, btn){
                        html += '<em class="'+ btn.name +'">'+ btn.text +'</em>';
                    })
                    html += '</span>';
                }
                html += '</div>';
            }
            return html;
        },
        createMain:function(year, month){
            var that = this, html = '';
            month = that.mend(month);
            if(!that.options.ismonth){
                return '<div class="ui-calendar-main">\
                        <div class="ui-calendar-tab">\
                            <span class="tab-left">\
                                <em class="dirbtn prevYear"></em>\
                                <em class="dirbtn prevMonth"></em>\
                            </span>\
                            <strong>\
                                <b>'+ year +'</b>年<b>'+ month +'</b>月\
                            </strong>\
                            <span class="tab-right">\
                                <em class="dirbtn nextMonth"></em>\
                                <em class="dirbtn nextYear"></em>\
                            </span>\
                        </div>\
                        <table class="ui-calendar-table"><thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead><tbody>'+ that.createCell(year, month) +'</tbody></table>\
                    </div>';
            }
            return '<div class="ui-calendar-main">\
                        <div class="ui-calendar-tab">\
                            <span class="tab-left">\
                                <em class="dirbtn prevYear"></em>\
                            </span>\
                            <strong>\
                                <b>'+ year +'</b>年\
                            </strong>\
                            <span class="tab-right">\
                                <em class="dirbtn nextYear"></em>\
                            </span>\
                        </div>\
                        <table class="ui-calendar-table"><tbody>'+ that.createList(year) +'</tbody></table>\
                    </div>';
        },
        //创建主体
        createBody:function(){
            var that = this, opts = that.options;
            var year = that.current[0];
            var month = that.current[1];
            var html = that.createMain(year, month);
            if(opts.istwo){
                if(opts.ismonth){
                    year = that.nextcurrent[0];
                    month = that.nextcurrent[1];
                }
                else{
                    if(13 == ++month){
                        year++;
                        month = 1;
                    }
                }
                
                html += that.createMain(year, month);
            }
            return html;
        },
        //创建单元格
        createCell:function(year, month){
            var that = this, opts = that.options, a = 1, b = 1, c = 1, d = 1, html = '';
            var time = that.reverse();
            var startime = time[1], initime = time[0];
            var date = new Date(year, month-1, 1);
            //获取月初是星期几
            var week = date.getDay();
            if(week === 7){
                week = 0;
            }
            var monthArray = that.getMonth(year);
            var days = monthArray[month-1];
            for(a; a<43; a++){
                if((a-1)%7 === 0){
                    html += '<tr>';
                }
                if(a > week && b <= days){
                    var crt = that.setCell(startime, that.getTime([year, month, b]), initime);
                    html += '<td data-year="'+ year +'" data-month="'+ month +'" data-day="'+ b +'" class="cell '+ crt +'"><span>'+ that.mend(b) +'</span></td>';
                    b++;
                }
                else if(opts.isother){
                    //获取上月末尾时间
                    if(a <= week && c <= week){
                        var lastMonth = month-1;
                        var lastYear = year;
                        if(lastMonth === 0){
                            lastMonth = 12;
                            lastYear--;
                        }
                        var end = monthArray[lastMonth-1];
                        var start = end - week;
                        if(start+c <= end){
                            var lastDay = start+c;
                            html += '<td data-year="'+ lastYear +'" data-month="'+ lastMonth +'" data-day="'+ lastDay +'" class="cell other-cell '+ that.setCell(startime, that.getTime([lastYear, lastMonth, lastDay]), initime) +'"><span>'+ that.mend(lastDay) +'</span></td>';
                        }
                        c++;
                    }
                    //获取下月月初时间
                    else if(a < 43 && a > days+week){
                        var nextMonth = month*1+1;
                        var nextYear = year;
                        if(nextMonth === 13){
                            nextMonth = 1;
                            nextYear++;
                        }
                        html += '<td data-year="'+ nextYear +'" data-month="'+ nextMonth +'" data-day="'+ d +'" class="cell other-cell '+ that.setCell(startime, that.getTime([nextYear, nextMonth, d]), initime) +'"><span>'+ that.mend(d) +'</span></td>';
                        d++;
                    }
                }
                else{
                    html += '<td></td>'
                }
                if(a%7 === 0){
                    html += '</tr>';
                }
            }
            return html;
        }, 
        createList:function(year){
            var that = this, opts = that.options, i = 1, html = '';
            var time = that.reverse();
            var startime = time[1], initime = time[0];
            
            for(i; i<=14; i++){
                var month = that.mend(i);
                if((i-1)%7 === 0){
                    html += '<tr>';
                }
                if(i <= 12){
                    html += '<td class="cell '+ that.setCell(startime, that.getTime([year, i]), initime) +'" data-year="'+ year +'" data-month="'+ month +'"><span>'+ month +'</span></td>';
                }
                else{
                    html += '<td></td>'
                }
                if(a%7 === 0){
                    html += '</tr>';
                }
            }
            return html;
        },
        setCell:function(startime, currentime, initime){
            var that = this, className = '';
            if(startime <= currentime && currentime <= initime){
                if(startime == currentime || currentime == initime){
                    className += 's-crt';
                }
                else{
                    className += 's-sel';
                }
            }
            if((that.min && currentime < that.min) || (that.max && currentime > that.max)){
                className += (className ? ' ' : '' + 's-dis')
            }
            return className;
        },
        bindEvent:function(){
            var that = this, opts = that.options;
            that.elem.on('click', function(e){
                e.stopPropagation();
            }).on('click', '[scope]', function(e){
                var me = $(this);
                me.addClass('s-crt').siblings('[scope]').removeClass('s-crt');
                var scope = parseInt(me.attr('scope'));
                var initdate = Calendar.format(opts.format);
                var startdate = Calendar.format(scope, opts.format);
                initime = that.getArr(that.getTime(initdate));
                startime = that.getArr(that.getTime(startdate));
                that.setTime(initime, startime);
                that.current[0] = initime[0];
                that.current[1] = initime[1];
                that.show();
                var date = initdate;
                if(initdate != startdate){
                    date = startdate + opts.joint + initdate;
                }
                opts.onselect(date.split(opts.joint), that.target);
            }).on('click', '.cell:not(.s-dis), .today, .confirm', function(e){
                var me = $(this), initime, startime;
                var end = {
                    hour:'00',
                    minute:'00',
                    second:'00'
                }
                that.elem.find('.ui-calendar-foot p em').each(function(){
                    var em = $(this);
                    end[em.attr('class')] = em.text();
                });
                if(me.hasClass('today') || me.hasClass('confirm')){
                    if(me.hasClass('today')){
                        initime = that.getArr(that.getTime(false));
                        that.setTime(initime, initime, end);
                    }
                }
                else{
                    //多选
                    if(opts.iscope && e.ctrlKey){
                        that.setTime(that.initime, $.extend(me.addClass('s-crt').data(), end));
                        that.elem.find('[scope]').removeClass('s-crt');
                        that.show();
                        return;
                    }
                    else{
                        var main = me.closest('.ui-calendar-main');
                        if(main.index() === 0){
                            that.body.find('.s-crt, .s-sel').removeClass('s-crt s-sel');
                            that.setTime($.extend(me.addClass('s-crt').data(), end));
                        }
                        else{
                            main.find('.s-crt, .s-sel').removeClass('s-crt s-sel');
                            that.setTime($.extend(me.addClass('s-crt').data(), end), that.startime);
                        }
                    }
                }
                var time = that.reverse();
                var enddate = time[0];
                var startdate = time[1];
                enddate = Calendar.format(enddate, opts.format);
                startdate = Calendar.format(startdate, opts.format);
                var date = enddate;
                if(enddate != startdate){
                    date = startdate + opts.joint + enddate;
                }
                if(this.nodeName === 'TD' && !opts.isclick){
                    opts.onselect(date.split(opts.joint), that.target);
                    return false;
                }
                that.target.trigger('setVal', date);
                that.hide();
                opts.onchoose(date.split(opts.joint), that.target);
            }).on('click', '.dirbtn', function(e){
                var me = $(this);
                var index = me.closest('.ui-calendar-main').index();
                if(!me.hasClass('s-dis')){
                    if(me.hasClass('prevYear')){
                        if(opts.ismonth && index === 1){
                            --that.nextcurrent[0];
                        }
                        else{
                            --that.current[0];
                        }
                    }
                    else if(me.hasClass('prevMonth')){
                        if(--that.current[1] === 0){
                            that.current[1] = 12;
                            --that.current[0];
                        }
                    }
                    else if(me.hasClass('nextYear')){
                        if(opts.ismonth && index === 1){
                            ++that.nextcurrent[0];
                        }
                        else{
                            ++that.current[0];
                        }
                    }
                    else if(me.hasClass('nextMonth')){
                        if(++that.current[1] === 13){
                            that.current[1] = 1;
                            ++that.current[0];
                        }
                    }
                    that.body.html(that.createBody());
                }
            }).on('click', '.clear', function(e){
                that.target.trigger('setVal', '');
                opts.onselect([''], that.target);
            }).on('click', '.close', function(e){
                that.hide();
            })
        },
        setTime:function(initime, startime, data){
            var that = this;
            if(!startime && !data){
                startime = initime;
                data = initime;
            }
            that.initime[0] = initime[0]||initime['year'];
            that.initime[1] = initime[1]||initime['month'];
            that.initime[2] = initime[2]||initime['day'];
            that.startime[0] = startime[0]||startime['year'];
            that.startime[1] = startime[1]||startime['month'];
            that.startime[2] = startime[2]||startime['day'];
            if(data){
                that.initime[3] = that.startime[3] = data.hour;
                that.initime[4] = that.startime[4] = data.minute;
                that.initime[5] = that.startime[5] = data.second;
            }
        },
        //获取所有月的天数
        getMonth:function(year){
            return [31, ((year % 4) == 0 ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        },
        getArr:function(time){
            var date = Calendar.format(time, this.options.ismonth ? 'yyyy M 1 00 00 00' : 'yyyy M d hh mm ss');
            date = date.split(' ');
            return date;
        },
        //获取时间戳
        getTime:function(date){
            if(date){
                if($.isArray(date)){
                    return new Date(date[0], date[1]-1, date[2]||1, date[3]||0, date[4]||0, date[5]||0).getTime();
                }
                else{
                    //IE6不支持横杠
                    date = date.replace(/-/g, '/');
                    return new Date(date).getTime();
                }
            }
            if(date === false){
                return new Date().getTime();
            }
            return 0;
        },
        //校验日期格式
        validDate:function(date){
            var that = this;
            if(date && (!(/^\d{4}(\/|-)\d{1,2}/g).test(date))){
                that.target.trigger('setVal', '');
                return '';
            }
            return date;
        },
        //补齐0
        mend:function(day){
            day = day.toString();
            day.length == 1 && (day = '0'+day);
            return day;
        },
        //显示组件
        show:function(){
            var that = this, opts = that.options;
            that.body = that.elem.html(that.createContent()).find('.ui-calendar-body');
            that.resize();
            if(opts.ishide){
                $.each(Calendar.box, function(key, val){
                    if(val.index !== that.index && val.options.ishide){
                        val.hide();
                    }
                })
                Calendar.current = that.index;    
            }
            that.elem.show();
        },
        //隐藏组件
        hide:function(){
            var that = this;
            try{
                that.elem.hide();
                Calendar.current = -1;
                that.options.onhide(that.elem);
            }
            catch(e){}
        },
        //定位
        resize:function(){
            var that = this;
            try{
                var offset = that.target.offset();
                that.elem.css({
                    top:offset.top + that.target.height(),
                    left:offset.left
                });
            }
            catch(e){}
        }
    }
    
    $.extend({
        calendar:function(options){
            options = options || {};
            var event = window.event, target = '';
            if(event != undefined){
                target = $(event.target || event.srcElement);
                event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true)
            }
            if(options.target){
                target = $(options.target);
            }
            if(event != undefined && target && (target.hasClass('s-dis') || target.prop('disabled'))){
                return;
            }
            if(target){
                options.target = target;
                var calendarindex = options.target.data('calendarindex');
                var calendar = Calendar.box[calendarindex] || new Calendar(options);
                if(event == undefined && options.target){
                    options.target.on('click', function(e){
                        if(!options.target.hasClass('s-dis') && !options.target.prop('disabled')){
                            calendar.run();
                        }
                        e.stopPropagation();
                    });
                    return calendar.init(false);
                }
                return calendar.init();
            }
            else{
                return new Calendar(options).init();
            }
        }
    })
    
    $.calendar.date = Calendar.format;
    
})(this, document, jQuery);