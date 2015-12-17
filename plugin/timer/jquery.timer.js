/**
 * FileName: jqyery.timer.js
 * Author: Aniu[date:2015-01-04 09:48]
 * Update: Aniu[date:2015-07-24 19:29]
 * Version: v1.3
 * Description: data-starttime  倒计时开始时间，默认为当前系统时间
 *              data-readytime  活动开始前准备时间，例如活动开始前几分钟需要改变一些状态，默认空
 *              data-begintime  活动开始时间，必须值
 *              data-endtime    活动结束时间，必须值
 *              data-beforetime 结束前某一时间，默认空
 */
 
$.fn.timer = function(o){
    o = $.extend({
        /**
         * @func 创建倒计时html骨架
         * @type <Function>
         * @param target <jQuery Object> 调用组件的当前对象
         * @param dayArray <Array> 剩余天数数组
         * @param dateArray <Array> 剩时间数组不包含天数
         * @param dateUnit <Array> ['时', '分', '秒']
         */
        createHtml:function(target, dayArray, dateArray, dateUnit){
            var html = day = '', i, j, k, temp;
            if(dayArray[0] != 0){
                html += '<span>';
                for(i in dayArray){
                    html += '<em>'+ dayArray[i] +'</em>';
                }
                html += '</span><b>天</b>';
                dateArray = dateArray.slice(dayArray.length);
            }
            for(i in dateUnit){
                html += '<span>';
                temp = dateArray.slice(k=i*2, k+2);
                for(j in temp){
                    html += '<em>'+ temp[j] +'</em>';
                }
                html += '</span><b>'+ dateUnit[i] +'</b>';
            }
            target.html(html);
        },
        /**
         * @func 倒计时运行回调函数
         * @type <Function>
         * @return <Boolean> 返回true则会立即终止当前倒计时
         * @param target <jQuery Object> 调用组件的当前对象
         * @param dayArray <Array> 剩余天数数组
         * @param dateArray <Array> 剩时间数组，若天数为0，会被移除
         * @param dateUnit <Array> ['时', '分', '秒']
         */
        runCallback:function(target, dayArray, dateArray, dateUnit){
            this.createHtml(target, dayArray, dateArray, dateUnit);
        },
        /**
         * @func 活动倒计时进行中时调用,用于初始化进行中倒计时，仅调用一次
         * @type <Function>
         * @param target <jQuery Object> 调用组件的当前对象
         */
        runningCallback:$.noop,
        /**
         * @func 结束前回调函数，搭配data-beforetime使用
         * @type <Function>
         * @return <Boolean> 返回false仅执行一次
         * @param target <jQuery Object> 调用组件的当前对象
         */
        beforeCallback:$.noop,
        /**
         * @func 准备阶段回调函数
         * @type <Function>
         * @return <Boolean> 返回false仅执行一次
         * @param target <jQuery Object> 调用组件的当前对象
         */
        readyCallback:$.noop,
        /**
         * @func 倒计时结束回调函数
         * @type <Function>
         * @param target <jQuery Object> 调用组件的当前对象
         */
        endCallback:function(target){
            target.html('<span><em>活动已结束</em></span>');
        }
    }, o||{});
    var getTime = function(date){
        return new Date(date).getTime();
    }
    return this.each(function(){
        var _this = $(this), delay = 1000, timeout = null, data = _this.data(), status = 1, //1未开始 2进行中
            starttime = data.starttime ? getTime(data.starttime) : new Date().getTime(),
            readytime = data.readytime ? getTime(data.readytime) : null,
            begintime = getTime(data.begintime), _begintime = begintime, endtime = getTime(data.endtime),
            beforetime = data.beforetime ? getTime(data.beforetime) : null, system = [new Date().getTime()], 
            ready = true, before = true, isStop = false, isAuto = false, //是否自动切换到进行中的倒计时，如果在进行中，用户刷新页面，将自动创建进行中的倒计时，之后必须设为true
            dateArray = [], dayArray = [], dateUnit = ['时', '分', '秒'],
            running = function(isInit){
                var day = hour = minute = second = 0, time = begintime - starttime, underway = starttime>=begintime && starttime<endtime && !isAuto;
                if(underway || ((isAuto=true) && time>0 && !isStop)){
                    delay = 1000;
                    if(underway){
                        begintime = endtime;
                        time = begintime - starttime;
                        status = 2;
                        delay = 0;
                        o.runningCallback(_this);
                    }
                    day = Math.floor(time/86400000);
                    time -= day*86400000;
                    hour = Math.floor(time/3600000);
                    time -= hour*3600000;
                    minute = Math.floor(time/60000);
                    time -= minute*60000;
                    second = Math.floor(time/1000);
                    if(hour<10){hour='0'+hour;}
                    if(minute<10){minute='0'+minute;}
                    if(second<10){second='0'+second;}
                    dateArray = (day+''+hour+''+minute+''+second).split('');
                    dayArray = dateArray.slice(0, -6);
                    if(isInit == true){
                        o.createHtml(_this, dayArray, dateArray.slice(dayArray.length), dateUnit);
                    }
                    else{
                        dayArray[0] == 0 && dateArray.shift();
                        isStop = o.runCallback(_this.data('starttime', starttime), dayArray, dateArray, dateUnit, status);
                        if(isStop){
                            delay = 0;
                        }
                    }
                    if(beforetime && starttime >= beforetime && before !== false){
                        before = o.beforeCallback(_this);
                    }
                    if(readytime && readytime <=starttime && starttime < _begintime && ready !== false){
                        ready = o.readyCallback(_this);
                    }

                    //不能加等于1000，因为不同浏览器对js的渲染速度不一样，会导致时间延迟，应该获取系统时间的差值
                    system.push(new Date().getTime());
                    system.length > 2 && system.shift();
                    starttime += (system[1] - system[0]);
                    isAuto = true;
                }
                else{
                    o.endCallback(_this, starttime);
                    clearTimeout(timeout);
                    return;
                }
                timeout = setTimeout(running, delay);
            }
        running(true);
    });
}