/**
 * @filename jquery.upload.js
 * @author Aniu[2014-12-17 12:14]
 * @update Aniu[2015-04-28 14:34]
 * @version v1.3
 * @description 文件上传，后台响应的content-type值必须为text/html
 */

;!(function(window, document, $, undefined){
    $.fn.upload = function(o){
        o = $.extend({
            /**
             * @func 文件上传url路径
             * @type <String>
             */
            url:'',
            /**
             * @func 最大加载时间，若超过该时间会调用error回调
             * @type <Number>
             */
            timeout:25000,
            /**
             * @func 加载速度
             * @type <Number>
             */
            speed:100,
            /**
             * @func 按钮点击上传
             * @type <Null, jQuery Selector>
             */
            button:null,
            /**
             * @func 上传接口返回值类型 json text
             * @type <String>
             */
            dataType:'json',
            /**
             * @func 文件选择后执行回调函数，可做类型验证
             * @type <Function>
             * @return <Boolean>
             * @param file <jQuery Object> 当前file jquery对象
             */
            start:null,
            /**
             * @func 文件上传进行中回调函数，可实现进度条
             * @type <Function>
             * @param scale <Number> 当前file jquery对象
             * @param file <jQuery Object> 当前file jquery对象
             * @param data <Response JSON> 返回json数据
             */
            send:$.noop,
            /**
             * @func ajax交互成功时回调函数
             * @type <Function>
             * @param data <Response JSON> 返回json数据
             * @param file <jQuery Object> 当前file jquery对象
             */
            success:$.noop,
            /**
             * @func ajax交互失败时回调函数
             * @type <Function>
             * @param file <jQuery Object> 当前file jquery对象
             */
            error:$.noop
        }, o||{});
        return this.each(function(){
            var that = $(this);
            if(that.is(':file')){
                var iframe = $('iframe[name="uploadfile"]'), timer = null,
                    type = o.dataType === 'json' ? 'text' : o.dataType,
                    form, val, timeout, response, body, clone, speed = o.speed || 100,
                    request = function(){
                        o.send(0, clone);
                        timer = setTimeout(function(){
                            timeout += speed;
                            o.send(parseInt(timeout/o.timeout), clone);
                            body = iframe.contents().find('body');
                            response = body[type]();
                            if(response || timeout >= o.timeout){
                                clearTimeout(timer);
                                if(timeout >= o.timeout){
                                    o.send(100, clone);
                                    o.error(clone); //超时
                                }
                                else{
                                    if(o.dataType === 'json'){
                                        if(/^{[\s\S]*}$/.test(response)){
                                            var data = eval('('+ response +')');
                                            o.send(100, clone, data);
                                            o.success(data, clone);
                                        }
                                        else{
                                            o.send(100, clone);
                                            o.error(clone); //格式错误
                                        }
                                    }
                                    else{
                                        o.send(100, clone, response);
                                        o.success(response, clone);
                                    }
                                }
                                body.empty();
                                return;
                            }
                            request();
                        }, speed);
                    }
                if(!iframe[0]){
                    iframe = $('<iframe name="uploadfile"></iframe>\
                                <form method="post" action="'+ o.url +'" target="uploadfile" enctype="multipart/form-data"></form>').appendTo('body').hide().first();
                }
                form = iframe.next('form');
                if(o.button !== null){
                    o.button.click(function(){
                        clearTimeout(timer);
                        timeout = 0;
                        if(typeof o.start === 'function' && !o.start(that)){
                            return;
                        }
                        form.submit();
                        request();
                    });
                }
                else{
                    that.change(function(){
                        clearTimeout(timer);
                        timeout = 0;
                        if((typeof o.start === 'function' && !o.start(that)) || !that.val()){
                            return;
                        }
                        clone = that.before(that.clone()).prev().upload(o);
                        form.children().remove().end().html(that).submit();
                        request();
                    });
                }
            }
        });
    }
})(this, document, jQuery);