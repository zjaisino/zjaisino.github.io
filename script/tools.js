/**
 * @filename jquery.tools.js
 * @author Aniu[2016-03-29 09:53]
 * @update Aniu[2016-03-29 09:53]
 * @version v1.1
 * @description 工具类
 */

var tools = {
    /**
     * @func 获取url参数值
     * @return <String, Object>
     * @param name <String, Undefined> 参数名，不传则以对象形式返回全部参数
     * @param urls <String, Undefined> url地址，默认为当前访问地址
     */
    getParam:function(name, urls){
        var url = decodeURI(urls||location.href), value = {};
        startIndex = url.indexOf('?');
        if(startIndex++ > 0){
            var param = url.substr(startIndex).split('&'), temp;
            $.each(param, function(key, val){
                temp = val.split('=');
                value[temp[0]] = temp[1];
            });
        }
        if(typeof name === 'string' && name){
            value = (temp = value[name]) !== undefined ? temp : '';
        }
        return value;
    },
    /**
     * @func 设置url参数值
     * @return <String> 设置后的url
     * @param name <String, Object> 参数名或者{key:value, ...}参数集合
     * @param value <String> 参数值或者url
     * @param urls <String, Undefined> url，没有则获取浏览器url
     */
    setParam:function(name, value, urls){
        var url;
        if($.isPlainObject(name)){
            url = value||location.href;
            $.each(name, function(key, val){
                if(val !== ''){
                	if($.isPlainObject(val)){
                		val = tools.getJSON(val);
                	}
                    url = tools.setParam(key, val, url);
                }
            });
        }
        else{
            url = urls||location.href;
            if(url.indexOf('?') === -1){
                url += '?';
            }
            if($.isPlainObject(value)){
            	value = tools.getJSON(value);
        	}
            if(url.indexOf(name+'=') !== -1){
                var reg = new RegExp('('+name+'=)[^&]*');
                url = url.replace(reg, '$1'+value);
            }
            else{
                var and = '';
                if(url.indexOf('=') !== -1){
                    and = '&';
                }
                url += and+name+'='+value;
            }
        }
        return url;
    },
    /**
     * @func 检测浏览器是否支持CSS3属性
     * @return <Boolean>
     * @param style <String> 样式属性
     */
    supportCss3:function(style){
        var prefix = ['webkit', 'Moz', 'ms', 'o'], 
            i, humpString = [], 
            htmlStyle = document.documentElement.style, 
            _toHumb = function (string) { 
                return string.replace(/-(\w)/g, function ($0, $1) { 
                    return $1.toUpperCase(); 
                }); 
            }; 
        for (i in prefix) 
            humpString.push(_toHumb(prefix[i] + '-' + style)); 
        humpString.push(_toHumb(style)); 
        for (i in humpString) 
            if (humpString[i] in htmlStyle) return true; 
        return false; 
    },
    /**
     * @func 模拟location.href跳转，前者IE下有问题
     * @return <Undefined>
     * @param url <String> 跳转的url
     * @param target <String> 跳转类型，默认为_self
     */
    jumpUrl:function(url, target){
        if(url){
            $('<a href="'+ url +'"'+ (target ? 'target="'+ (target||'_self') +'"' : '' ) +'><span></span></a>')
                .appendTo('body').children().click().end().remove();
        }
    },
    /**
     * @func 格式化日期
     * @return <String>
     * @param timestamp <String, Number> 时间戳，为空返回横杠“-”
     * @param format <String, Undefined> 输出格式，为空则返回时间戳
     */
    formatDate:function(timestamp, format){
        if(timestamp = parseInt(timestamp)){
            if(!format){
                return timestamp;
            }
            var date = new Date(timestamp);
            var map = {
                'M':date.getMonth()+1,
                'd':date.getDate(),
                'h':date.getHours(),
                'm':date.getMinutes(),
                's':date.getSeconds()
            }
            format = format.replace(/([yMdhms])+/g, function(all, single){
                var value = map[single];
                if(value !== undefined){
                    if(all.length > 1){
                       value = '0' + value;
                       value = value.substr(value.length-2);
                   } 
                   return value;
                }
                else if(single === 'y'){
                    return (date.getFullYear() + '').substr(4-all.length);
                }
                return all;
            });
            return format;
        }
        return '-';
    },
    /**
     * @func 格式化json
     * @return <JSON String>
     * @param data <Array, Object> 数组或者对象
     */
    getJSON:function(data){
        if(typeof JSON !== 'undefined'){
            return JSON.stringify(data);
        }
        else{
            if($.isArray(data)){
                var arr = [];
                $.each(data, function(key, val){
                    arr.push(tools.getJSON(val));
                });
                return '[' + arr.join(',') + ']';
            }
            else if($.isPlainObject(data)){
                var temp = [];
                $.each(data, function(key, val){
                    temp.push('"'+ key +'":'+ tools.getJSON(val));
                });
                return '{' + temp.join(',') + '}';
            }
            else{
                return '"'+data+'"';
            }
        }
    },
    /**
     * @func 正则表达式
     */
    regex:{
    	//手机
    	mobile:/^1(3|4|5|7|8)[0-9]{9}$/,
    	//电话
    	tel:/^[0-9-()（）]{7,18}$/,
    	//邮箱
    	email:/^\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/,
    	//身份证
    	idcard:/^[1-9]\d{5}((\d{2}[01]\d[0-3]\d{4})|([1-9]\d{3}[01]\d[0-3]\d{4}(\d|X)))$/,
    	//中文
    	cn:/^[\u4e00-\u9fa5]+$/,
    	//税号
    	taxnum:/^[a-zA-Z0-9]{15,20}$/,
    	//银行卡号
    	banknum:/^[0-9]*$/
    },
    /**
     * @func 判断是否安装pdf
     */
    isPDFInstalled:function(){
    	var i, len;
        var flag = false;
        if($.browser.webkit){
            flag = true;
        }
        if(navigator.plugins && (len = navigator.plugins.length)){
            for(i = 0; i < len; i++){
                if(/Adobe Reader|Adobe PDF|Acrobat|Chrome PDF Viewer/.test(navigator.plugins[i].name)){
                    flag = true;
                    break;
                }
            }
        }
        try{
            if(window.ActiveXObject || window.ActiveXObject.prototype){
                for(i = 1; i < 10; i++){
                    try{
                        if(eval("new ActiveXObject('PDF.PdfCtrl." + i + "');")){
                            flag = true;
                            break;
                        }
                    } 
                    catch(e){
                        flag = false;
                    }
                }
                
                var arr = ['PDF.PdfCtrl', 'AcroPDF.PDF.1', 'FoxitReader.Document', 'Adobe Acrobat', 'Adobe PDF Plug-in'];
                len = arr.length;
                for(i = 0; i < len; i++){
                    try{
                        if(new ActiveXObject(arr[i])){
                            flag = true;
                            break;
                        }
                            
                    } 
                    catch(e){
                        flag = false;
                    }
                }
            }
        }
        catch(e){
            
        }
        return flag;
    },
    /**
     * @func 设置上传图片本地路径
     * @param file <jQuery Object> file上传按钮jq对象
     * @param target <jQuery Object> 图片jq对象
     */
    setPath:function(file, target){
        if(typeof document.selection !== 'undefined'){
            file.select();
            file.blur();
            target.removeAttr('src');
            target[0].style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+ document.selection.createRange().text +'", sizingMethod = scale)';
        }
        else{
            file = file.files[0];
            var reader = new FileReader();
            reader.onload = function(event){ 
                var txt = event.target.result;
                target.attr('src', txt);
            }
            reader.readAsDataURL(file);
        }
    }
};