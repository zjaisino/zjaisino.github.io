/**
 * FileName: jqyery.timer.js
 * Author: Aniu[date:2015-01-04 09:48]
 * Update: Aniu[date:2015-01-08 13:35]
 * Version: v1.2
 * Description: 倒计时，调用元素含有属性data-starttime，data-endtime，data-stoptime
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
         * @func 倒计时进行时回调函数
         * @type <Function>
         * @param target <jQuery Object> 调用组件的当前对象
         * @param dayArray <Array> 剩余天数数组
         * @param dateArray <Array> 剩时间数组，若天数为0，会被移除
         * @param dateUnit <Array> ['时', '分', '秒']
         */
        runCallback:function(target, dayArray, dateArray, dateUnit){
            this.createHtml(target, dayArray, dateArray, dateUnit);
        },
        /**
         * @func 下一个倒计时，若系统时间大于结束时间，并且小于倒计时停止时间，将被调用
         * @type <Function>
         * @param target <jQuery Object> 调用组件的当前对象
         */
        nextCallback:$.noop,
        /**
         * @func 倒计时结束回调函数
         * @type <Function>
         * @param target <jQuery Object> 调用组件的当前对象
         */
        endCallback:function(target){
            target.html('<span><em>活动已结束</em></span>');
        },
        showCallback:$.noop
	}, o||{});
	return this.each(function(){
		var _this = $(this), delay = 1000, timeout = null, isStop = false, data = _this.data(), status = 1, //1未开始 2进行中 3已结束
            starttime = data.starttime ? new Date(data.starttime).getTime() : new Date().getTime(),
            endtime = new Date(data.endtime).getTime(), stoptime = new Date(data.stoptime).getTime(),
            nexttime = new Date(data.nexttime).getTime(), system = [new Date().getTime()], isAuto = false, //是否自动切换到进行中的倒计时，如果在进行中，用户刷新页面，将自动创建进行中的倒计时，之后必须设为true
            showtime = _this.prev().data('nexttime') ? new Date(_this.prev().data('nexttime')).getTime() : null,
            dateArray = [], dayArray = [], dateUnit = ['时', '分', '秒'],
			running = function(isInit){
				var day = hour = minute = second = 0, time = endtime - starttime;
                if((starttime>=endtime && starttime<stoptime && !isAuto) || ((isAuto=true) && time>0 && !isStop)){
                    delay = 1000;
                    if(starttime>=endtime && starttime<stoptime && !isAuto){
                        endtime = stoptime;
                        time = endtime - starttime;
                        status = 2;
                        delay = 0;
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
                        o.createHtml(_this, dayArray, dateArray.slice(dayArray.length), dateUnit, isAuto);
                    }
                    else{
                        dayArray[0] == 0 && dateArray.shift();
                        isStop = o.runCallback(_this, dayArray, dateArray, dateUnit);
                        if(isStop){
                            delay = 0;
                            o.showCallback(_this.next(), 1);
                        }
                    }
                    if(starttime < nexttime){
                        if(!showtime || (showtime && starttime >= showtime)){
                            o.showCallback(_this, status);
                        }
                    }
                    else if(starttime >= nexttime || !isAuto){
                        o.showCallback(_this.next(), 1);
                        if(!isAuto){
                            o.showCallback(_this, status);
                        }
                    }

                    //不能加等于1000，因为不同浏览器对js的渲染速度不一样，会导致时间延迟，应该获取系统时间的差值
                    system.push(new Date().getTime());
                    system.length > 2 && system.shift();
                    starttime += (system[1] - system[0]);
                    isAuto = true;
                }
                else if(starttime >= endtime && starttime < stoptime && !isStop && isAuto){
                    endtime = stoptime;
                    delay = 0;
                    status = 2;
                    o.nextCallback(_this);
                }
                else{
                    o.showCallback(_this, 3);
                    o.endCallback(_this, starttime);
                    clearTimeout(timeout);
                    return;
                }
                timeout = setTimeout(running, delay);
			}
        running(true);
	});
}