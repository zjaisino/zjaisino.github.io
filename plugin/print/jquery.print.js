/**
 * @filename jquery.print.js
 * @author Aniu[2016-03-15 13:25]
 * @update Aniu[2016-03-21 10:49]
 * @version v1.2
 * @description 打印
 */

$.fn.print = function(o){
    o = $.extend(true, {
        /**
         * @func 打印元素
         * @type <Object, String>
         * @desc 为空将打印全部网页内容
         */
        element:'',
        /**
         * @func iframe打印
         * @type <Object>
         */
        iframe:{
            enable:true,
            title:''
        },
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
        var ele = typeof o.element === 'string' ? $(o.element).clone() : o.element.clone();
        me.on('click', function(e){
            if(o.element){
                if(o.iframe.enable === true){
                    var iframeBox = $('<div><iframe /></div>').appendTo('body');
                    var iframe = iframeBox.children();
                    iframeBox.css({
                        height:0,
                        width:0,
                        margin:0,
                        padding:0,
                        overflow:'hidden',
                        dislay:'block'
                    });
                    var contents = iframe.contents();
                    var iframeHead = contents.find('head');
                    iframe = iframe[0];
                    var iframeWin = iframe.contentWindow;
                    var iframeDoc = iframeWin.document;
                    iframeDoc.write('<title>'+ (o.iframe.title || '&nbsp;') +'</title>');
                    o.callback(ele, page, iframeDoc);
                    $('link[rel="stylesheet"]').each(function(){
                        iframeDoc.write('<link rel="stylesheet" type="text/css" href="'+ $(this).attr('href') +'" />');
                    });
                    $('style').each(function(){
                        iframeDoc.write('<style>'+ $(this).text() +'</style>');
                    });
                    iframeDoc.write(ele.prop('outerHTML'));
                    iframeDoc.close();
                    iframeWin.focus();
                    setTimeout(function(){
                        iframeWin.print();
                        iframeBox.remove();
                    }, 500);
                }
                else{
                    body.children().wrapAll('<div class="ui-printbox" style="display:none;"></div>');
                    o.callback(ele, page);
                    body.append(ele);
                    setTimeout(function(){
                        print();
                        ele.remove();
                        $('.ui-printbox').children().unwrap();
                    }, 100);
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