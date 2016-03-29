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
            url:'',
            timeout:25000,
            dataType:'json', //json html text
            /**
             * @func 文件选择后执行回调函数，可做类型验证
             * @return <Boolean>
             * @param that <jQuery Object> 当前file jquery对象
             */
            start:null,
            /**
             * @func ajax交互成功时回调函数
             * @param data <Response JSON> 返回json数据
             * @param that <jQuery Object> 当前file jquery对象
             */
            success:$.noop,
            /**
             * @func ajax交互失败时回调函数
             * @param that <jQuery Object> 当前file jquery对象
             */
            error:$.noop
        }, o||{});
        return this.each(function(){
            var that = $(this);
            if(that.is(':file')){
                var iframe = $('iframe[name="uploadfile"]'), timer = null,
                    type = o.dataType === 'json' ? 'text' : o.dataType,
                    form, val, timeout, response, body, clone,
                    request = function(){
                        timer = setTimeout(function(){
                            timeout -= 100;
                            body = iframe.contents().find('body');
                            response = body[type]();
                            if(response || timeout <= 0){
                                clearTimeout(timer);
                                if(timeout <= 0){
                                    o.error(clone); //超时
                                }
                                else{
                                    if(o.dataType === 'json'){
                                        if(/^{[\s\S]*}$/.test(response)){
                                            eval('var data = '+response);
                                            o.success(data, clone);
                                        }
                                        else{
                                            o.error(clone); //格式错误
                                        }
                                    }
                                    else{
                                        o.success(response, clone);
                                    }
                                }
                                body.empty();
                                return;
                            }
                            request();
                        }, 100);
                }
                if(!iframe[0]){
                    iframe = $('<iframe name="uploadfile"></iframe>\
                                <form method="post" action="'+ o.url +'" target="uploadfile" enctype="multipart/form-data"></form>').appendTo('body').hide().first();
                }
                form = iframe.next('form');
                that.change(function(){
                    clearTimeout(timer);
                    timeout = o.timeout;
                    if((typeof o.start === 'function' && !o.start(that)) || !that.val()){
                        return;
                    }
                    clone = that.before(that.clone()).prev().upload(o);
                    form.children().remove().end().html(that).submit();
                    request();
                });
            }
        });
    }
})(this, document, jQuery);