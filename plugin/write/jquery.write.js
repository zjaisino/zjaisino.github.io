/**
 * @fileName jquery.write.js
 * @author Aniu[date:2015-08-29 20:19]
 * @update Aniu[date:2015-08-29 20:19]
 * @version v1.1
 * @description none
 */

;!(function(window, document, $, undefined){
    $.fn.write = function(o){
        o = $.extend(true, {
            speed:120,
            data:[{
                html:'<p></p>',
                text:'这是一个例子。'
            }]
        }, o||{});
        var me = $(this), data = o.data;
        if($.isArray(data)){
            var size = data.length;
            if(size){
                size--;
                var run = function(index){
                    var res = data[index];
                    var html = $(res.html).appendTo(me);
                    var len = res.text.length;
                    var i = 0;
                    var flag = 0;
                    var _ = '_';
                    var write = function(){
                        if(i < len){
                            i == len-1 && (_='');
                            html.text(res.text.substr(0, ++i)+_);
                            setTimeout(write, o.speed);
                        }
                        else if(index < size){
                            run(++index);
                        }
                    }
                    var cursor = function(){
                        flag++;
                        if(flag < 7){
                            html.text(flag % 2 == 0 ? '' : '_');
                            setTimeout(cursor, 100);
                        }
                        else{
                            write();
                        }
                    }
                    cursor();
                }
                run(0);
            }
        }
        return me;
    }
})(this, document, jQuery);