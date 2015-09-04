/**
 * FileName: jquery.paging.js
 * Author: Aniu[date:2014-03-29 10:07]
 * Update: Aniu[date:2014-08-13 14:36]
 * Version: v3.0
 */
 
;!(function(window, document, $, undefined){
    window.Paging = function(setting){
        var that = this;
        //获取实例对象的名称
        this.instance = function(){
            for(var attr in window){
                if(window[attr] == this){
                    return attr.toString();
                }
            }
        }
        this.init(setting);
    }
    
    Paging.prototype = {
        //ajax返回数据的DOM容器
        wrap:'',
        //ajax请求的url
        url:'',
        //当前页面显示的数量
        pCount:10,
        //总数量
        aCount:0,
        //第一页
        current:1,
        //ajax url后缀参数
        condition:{},
        isJump:false,
        //loading 设置
        loadingSet:{
            isOpen:false,
            wrap:''
        },
        button:{
            prev:'«',
            next:'»'
        },
        //simp  full
        isFull:true,
        //拓展分页部分
        extPage:{
            isOpen:false,
            wrap:'',
            desc:''
        },
        //输出服务器端返回的数据
        echoData:function(){},
        //loading的显示与隐藏
        loading:function(){
            var that = this;
            return {
                show:function(){
                    this.hide();
                    that.loadingSet.wrap.append('<i class="ui-loading" style="position:absolute;">正在加载数据...</i>').css({position:'relative'});
                },
                hide:function(){
                    $('.ui-loading').remove();
                }
            }
        },
        //初始化分页属性
        init:function(setting){
            if(setting){
                for(k in setting){
                    this[k] = setting[k];
                }
            }
        },
        //页面跳转
        jump:function(n){
            var count = Math.ceil(this.aCount/this.pCount), current;
            this.isJump = true;
            if(typeof(n) === 'object'){
                var val = $(n).prevAll('input').val();
                if(val <= count && val != this.current){
                    current = parseInt(val);
                }
                else{
                    current = this.current;
                }
            }
            else if(n <= count){
                current = n;
            }
            this.current = this.condition.current = current;
            this.getData();
        },
        query:function(isQuery){
            this.current = 1;
            this.isJump = false;
            if(isQuery){
                this.filter();
                this.condition.current = 1;
            }
            else{
                this.condition = {current:1};
            }
            this.getData();
        },
        filter:function(){
            for(var i in this.condition){
                if(!this.condition[i]){
                    delete this.condition[i];
                }
            }
        },
        //ajax请求数据
        getData:function(){
            var that = this;
            this.condition.pCount = this.pCount;
            this.condition.t = (new Date()).getTime();
            this.loadingSet.isOpen && this.loading().show();
            $.getJSON(this.url, this.condition, function(data){
                that.loadingSet.isOpen && that.loading().hide();
                that.echoData(data);
                that.aCount = data.aCount;
                that.create();
            });
        },
        //过滤分页中input值
        trim:function(o){
            var val = Math.abs(parseInt($(o).val()));
            !val && (val = 1);
            $(o).val(val);
        },
        echoList:function(html, i, instance){
            if(this.current == i){
                html = '<li><span>'+ i +'</span></li>';
            }
            else{
                html = '<li><a href="javascript:'+ instance +'.jump('+ i +');">'+ i +'</a></li>';
            }
            return html;
        },
        //创建分页骨架
        create:function(){
            var count = Math.ceil(this.aCount/this.pCount),
                html = '', next = count == this.current ? 1 : this.current+1,
                instance = this.instance();
            
            if(this.extPage.isOpen){
                var page = '<div>';
                page += this.current == count || count == 0 ?
                     '<span>下一页</span>' : '<a href="javascript:'+ instance +'.jump('+ (this.current+1) +');">下一页</a>';
                page += this.current == 1 ?
                     '<span>上一页</span>' : '<a href="javascript:'+ instance +'.jump('+ (this.current-1) +');">上一页</a>';
                page += '</div><em>'+ (count !== 0 ? this.current : 0) +'/'+ count +'</em><strong>共'+ this.aCount + this.extPage.desc +'</strong>';
                this.extPage.wrap.html(page);
            }
                
            if(!count){
                this.wrap.empty();
                return;
            }

            html += this.current == 1 ? '<li><span>'+ this.button.prev +'</span></li>' : '<li><a href="javascript:'+ instance +'.jump('+ (this.current-1) +');">'+ this.button.prev +'</a></li>';
            if(count <= 7){
                for(var i = 1; i <= count; i++){
                    html += this.echoList(html, i, instance);
                }
            }
            else{
                if(this.current-3 > 1 && this.current+3 < count){
                    html += '<li><a href="javascript:'+ instance +'.jump(1);">1</a></li>';
                    html += '<li><em>...</em></li>';
                    for(var i = this.current-2; i <= this.current+2; i++){
                        html += this.echoList(html, i, instance);
                    }
                    html += '<li><em>...</em></li>';
                    html += '<li><a href="javascript:'+ instance +'.jump('+ count +');">'+ count +'</a></li>';
                }
                else if(this.current-3 <= 1 && this.current+3 < count){
                    for(var i = 1; i <= 5; i++){
                        html += this.echoList(html, i, instance);
                    }
                    html += '<li><em>...</em></li>';
                    html += '<li><a href="javascript:'+ instance +'.jump('+ count +');">'+ count +'</a></li>';
                }
                else if(this.current-3 > 1 && this.current+3 >= count){
                    html += '<li><a href="javascript:'+ instance +'.jump(1);">1</a></li>';
                    html += '<li><em>...</em></li>';
                    for(var i = count-5; i <= count; i++){
                        html += this.echoList(html, i, instance);
                    }
                }
            }
            html += this.current == count ? '<li><span>'+ this.button.next +'</span></li>' : '<li><a href="javascript:'+ instance +'.jump('+ (this.current+1) +');">'+ this.button.next +'</a></li>';
            if(this.isFull){
                html += '<li><em>跳转到第</em><input type="text" onblur="'+ instance +'.trim(this);" value="'+ next +'" /><em>页</em><button type="button" onclick="'+ instance +'.jump(this);">确定</button></li>';
            }
            html = '<ul class="ui-paging">' + html + '</ul>';
            this.wrap.html(html);
        }
    }
    
    $.extend({
        paging:function(name, setting){
            if(setting === undefined){
                setting = name;
                name = 'paging';
            }
            window[name] = new Paging(setting);
            window[name].query();
        }
    });
})(this, document, jQuery);