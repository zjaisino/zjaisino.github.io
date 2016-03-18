/**
 * @filename jquery.print.js
 * @author Aniu[2016-03-15 13:25]
 * @update Aniu[2016-03-15 13:25]
 * @version v1.1
 * @description 打印
 */

$.fn.print = function(o){
    o = $.extend({
        /**
         * @func 打印元素
         * @type <Object, String>
         * @desc 为空将打印全部网页内容
         */
        element:'',
        /**
         * @func 加载样式
         * @type <Null, String, Array>
         * @desc 若值不为null则使用iframe打印
         */
        cssurl:null,
        /**
         * @func 分页打印
         * @type <Function>
         * @return <undefined>
         * @param element <Object> 打印内容JQ对象
         * @param css <Object> 打印样式类
         * @desc 通过element筛选需要分页的元素添加css对象
         */
        callback:$.noop
    }, o||{});
    
    var me = $(this);
    var page = {'page-break-after':'always'};
    var body = $('body');
    //防止打印界面的该组件被再次调用
    if(!me.attr('bindprint')){
        me.attr('bindprint', '1');
        me.on('click', function(e){
            if(o.element){
                var ele = $(o.element).clone();
                if(typeof o.cssurl === 'string'){
                    o.cssurl = [o.cssurl];
                }
                if($.isArray(o.cssurl)){
                    
                }
                else{
                    body.children().wrapAll('<div class="ui-printbox" style="display:none;"></div>');
                    o.callback(ele, page);
                    body.append(ele);
                    print();
                    ele.remove();
                    $('.ui-printbox').children().unwrap();
                }
            }
            else{
                o.callback(body, page);
                print();
            } 
            
            e.stopPropagation();
        });
    }
    return this;
}