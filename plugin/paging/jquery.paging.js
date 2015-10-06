/**
 * @fileName jquery.paging.js
 * @author Aniu[date:2014-03-29 10:07]
 * @update Aniu[date:2015-10-05 17:18]
 * @version v2.3
 * @description 分页组件
 */

;!(function(window, document, $, undefined){

    function Paging(options){
        var that = this;
        //获取实例对象的名称
        that.instance = function(){
            for(var attr in window){
                if(window[attr] == that){
                    return attr.toString();
                }
            }
        }
        that.options = $.extend(true, {
            /**
             * @function ajax请求url
             * @type <String>
             */
            url:'',
            /**
             * @function 数据填充容器
             * @type <Object>
             */
            wrap:null,
            /**
             * @function 传递参数值
             * @type <String>
             * @desc 将传递参数封装为json字符串，后台接收该参数来获取该json
             */
            paramJSON:'',
            /**
             * @function 当页显示数量
             * @type <Number>
             */
            pCount:10,
            /**
             * @function 是否初始化展示最后一页
             * @type <Boolean>
             */
            last:false,
            /**
             * @function 是否读取全部数据
             * @type <Boolean>
             * @desc 该参数启用后，接口将无法接收到pCount和current参数，前后端约定好，若没接收到这2个参数，将返回全部数据
             */
            allData:false,
            /**
             * @function 是否完整形式展示分页
             * @type <Boolean>
             */
            isFull:true,
            /**
             * @function ajax配置信息
             * @type <JSON Obejct>
             */
            ajax:{},
            /**
             * @function 接口接收参数
             * @type <JSON Obejct>
             */
            condition:{},
            /**
             * @function loading加载效果
             * @type <JSON Obejct>
             */
            loading:{
                //loading容器
                wrap:null,
                //显示loading
                show:function(){
                    var that = this;
                    that.hide();
                    var wrap = that.wrap;
                    wrap && wrap.append('<i class="ui-loading" style="position:absolute;">正在加载数据...</i>').css({position:'relative'});
                },
                //隐藏loading
                hide:function(){
                    $('.ui-loading').remove();
                }
            },
            /**
             * @function 上一页下一页按钮文字
             * @type <JSON Obejct>
             */
            button:{
                prev:'«',
                next:'»'
            },
            /**
             * @function 拓展分页部分
             * @type <JSON Obejct>
             */
            extPage:{
                wrap:null,
                desc:'',
                prev:'上一页',
                next:'下一页'
            },
            /**
             * @function 传统页面刷新方式
             * @type <Null, Function>
             * @param current <Number> 目标页码
             * @desc 值为函数将启用
             */
            refreshCallback:null,
            /**
             * @function ajax响应数据并且分页创建完毕后回调函数
             * @type <Function>
             * @param data <JSON Object> 响应数据
             */
            endCallback:$.noop,
            /**
             * @function 分页数据处理
             * @type <Function>
             * @param data <JSON Object> 响应数据
             */
            echoData:$.noop
        }, options||{});
    }

    Paging.prototype = {
        constructor:Paging,
        aCount:0,
        isJump:false,
        //页面跳转
        jump:function(n, isinit){
            var that = this, opts = that.options, count = Math.ceil(that.aCount/opts.pCount), current;
            that.isJump = true;
            if(typeof(n) === 'object'){
                var val = $(n).prevAll('input').val();
                if(val <= count && val != that.current){
                    current = parseInt(val);
                }
                else{
                    current = this.current;
                }
            }
            else if(n > 0 && n <= count){
                current = n;
            }
            else if(n < 0){
                current = count + n + 1;
            }
            else{
                current = count;
            }
            if(isinit){
                current = n;
            }
            that.current = opts.condition.current = current;
            if(typeof opts.refreshCallback === 'function'){
                opts.refreshCallback(current);
                that.create();
                return;
            }
            that.getData();
        },
        query:function(condition){
            var that = this, opts = that.options;
            if(condition !== 'refresh'){
                that.current = 1;
                that.isJump = false;
                if(condition === true){
                    that.filter();
                    opts.condition.current = that.current;
                }
                else{
                    opts.condition = {current:that.current};
                }
            }
            else{
                if(typeof opts.refreshCallback !== 'function'){
                    opts.refreshCallback = $.noop;
                }
            }
            that.getData();
        },
        filter:function(){
            var that = this, opts = that.options;
            for(var i in opts.condition){
                if(!opts.condition[i]){
                    delete opts.condition[i];
                }
            }
        },
        //ajax请求数据
        getData:function(){
            var that = this, opts = that.options;
            if(typeof opts.refreshCallback !== 'function'){
                opts.loading.show();
                opts.condition.pCount = opts.pCount;
                if(opts.allData === true){
                    delete opts.condition.pCount;
                    delete opts.condition.current;
                }
                var param = opts.condition;
                if(opts.paramJSON){
                    param = [];
                    $.each(opts.condition, function(key, val){
                        param.push(key+':'+val);
                    });
                    var temp = param.length ? '{'+param.join(',')+'}' : '';
                    param = {};
                    param[opts.paramJSON] = temp;
                }
                delete opts.ajax.data;
                delete opts.ajax.success;
                $.ajax($.extend(true, {
                    url:opts.url,
                    async:true,
                    cache:false,
                    dataType:'json',
                    data:param,
                    success:function(data){
                        opts.loading.hide();
                        data.current = that.current;
                        opts.echoData(data);
                        that.aCount = data.aCount;
                        if(opts.last === true){
                            opts.last = false;
                            that.jump(-1);
                            return;
                        }
                        that.create();
                        opts.endCallback(data);
                    },
                    error:function(){
                        opts.loading.hide();
                    }
                }, opts.ajax||{}));
            }
            else{
                that.create();
            }
        },
        //过滤分页中input值
        trim:function(o){
            var val = Math.abs(parseInt($(o).val()));
            !val && (val = 1);
            $(o).val(val);
        },
        echoList:function(html, i, instance){
            var that = this;
            if(that.current == i){
                html = '<li><span class="s-crt">'+ i +'</span></li>';
            }
            else{
                html = '<li><a href="javascript:'+ instance +'.jump('+ i +');" target="_self">'+ i +'</a></li>';
            }
            return html;
        },
        //创建分页骨架
        create:function(){
            var that = this, opts = that.options, button = opts.button,
                count = Math.ceil(that.aCount/opts.pCount), current = that.current,
                html = '', next = count == current ? 1 : current+1,
                instance = that.instance(), extPage = opts.extPage;

            if(extPage.wrap){
                var page = '<div>';
                page += current == count || count == 0 ?
                     '<span>'+ extPage.next +'</span>' : '<a href="javascript:'+ instance +'.jump('+ (current+1) +');" target="_self">'+ extPage.next +'</a>';
                page += current == 1 ?
                     '<span>'+ extPage.prev +'</span>' : '<a href="javascript:'+ instance +'.jump('+ (current-1) +');" target="_self">'+ extPage.prev +'</a>';
                page += '</div><em>'+ (count !== 0 ? current : 0) +'/'+ count +'</em><strong>共'+ that.aCount + extPage.desc +'</strong>';
                extPage.wrap.html(page);
            }
            
            if(!opts.wrap){
                return;
            }
            
            if(!count){
                opts.wrap.empty();
                return;
            }

            html += current == 1 ? '<li><span>'+ button.prev +'</span></li>' : '<li><a href="javascript:'+ instance +'.jump('+ (current-1) +');" target="_self">'+ button.prev +'</a></li>';
            if(count <= 7){
                for(var i = 1; i <= count; i++){
                    html += that.echoList(html, i, instance);
                }
            }
            else{
                if(current-3 > 1 && current+3 < count){
                    html += '<li><a href="javascript:'+ instance +'.jump(1);" target="_self">1</a></li>';
                    html += '<li><em>...</em></li>';
                    for(var i = current-2; i <= current+2; i++){
                        html += that.echoList(html, i, instance);
                    }
                    html += '<li><em>...</em></li>';
                    html += '<li><a href="javascript:'+ instance +'.jump('+ count +');" target="_self">'+ count +'</a></li>';
                }
                else if(current-3 <= 1 && current+3 < count){
                    for(var i = 1; i <= 5; i++){
                        html += that.echoList(html, i, instance);
                    }
                    html += '<li><em>...</em></li>';
                    html += '<li><a href="javascript:'+ instance +'.jump('+ count +');" target="_self">'+ count +'</a></li>';
                }
                else if(current-3 > 1 && current+3 >= count){
                    html += '<li><a href="javascript:'+ instance +'.jump(1);" target="_self">1</a></li>';
                    html += '<li><em>...</em></li>';
                    for(var i = count-5; i <= count; i++){
                        html += that.echoList(html, i, instance);
                    }
                }
            }
            html += current == count ? '<li><span>'+ button.next +'</span></li>' : '<li><a href="javascript:'+ instance +'.jump('+ (current+1) +');" target="_self">'+ button.next +'</a></li>';
            if(opts.isFull){
                html += '<li><em>跳转到第</em><input type="text" onblur="'+ instance +'.trim(this);" value="'+ next +'" /><em>页</em><button type="button" onclick="'+ instance +'.jump(this);">确定</button></li>';
            }
            html = '<ul class="ui-paging">' + html + '</ul>';
            opts.wrap.html(html);
        }
    }
    
    $.extend({
        paging:function(name, options){
            if(options === undefined){
                options = name;
                name = 'paging';
            }
            window[name] = new Paging(options);
            window[name].query(true);
        }
    });
    
    window.Paging = Paging;
    
})(this, document, jQuery);