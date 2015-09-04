/**
 * FileName: tools.js
 * Author: Aniu[date:2015-07-31 08:50]
 * Update: Aniu[date:2015-08-17 11:15]
 * Version: v1.2
 * Description: 工具库
 */

var tools = {
    /**
     * @func 获取url参数值
     * @return <String, Object>
     * @param name <String, Undefined> 参数名，不传则以对象形式返回全部参数
     * @param urls <String, Undefined> url地址，默认为当前访问地址
     */
    getParam:function(name, urls){
        var url = urls||location.href, value = '';
        startIndex = url.indexOf('?');
        if(startIndex++ > 0){
			value = {};
            var param = url.substr(startIndex).split('&'), temp;
            $.each(param, function(key, val){
                temp = val.split('=');
                value[temp[0]] = temp[1];
            });
            if(typeof name === 'string' && name){
                value = (temp = value[name]) !== undefined ? temp : '';
            }
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
                if(typeof val === 'number' || typeof val === 'string'){
                    url = tools.setParam(key, val, url);
                }
            });
        }
        else{
            url = urls||location.href;
            if(url.indexOf('?') === -1){
                url += '?';
            }
            if(url.indexOf(name+'=') !== -1){
                var reg = new Regexp('('+name+'=)[^&]*');
                url.replace(reg, '$1'+value);
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
     * @func 加入收藏
     * @return <Undefined>
     * @param url <String> 网址url
     * @param title <String> 网址中文名称
     */
    addFav:function(url, title){
        try{
            window.external.addFavorite(url, title);
        }
        catch(e){
            try{
                window.sidebar.addPanel(title, url, '');
                }
            catch(e){
                alert('您所使用的浏览器不支持该功能,请使用Ctrl+D手动添加!');
            }
        }
    },
    /**
     * @func 设为首页
     * @return <Undefined>
     * @param obj <DOM Object> 调用方法的DOM对象，兼容IE
     * @param url <String> 网址url
     */
    setHome:function(obj, url){
        try{  
            obj.style.behavior = 'url(#default#homepage)';  
            obj.setHomePage(url);  
        }catch(e){  
            if(window.netscape){  
                try{  
                    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');  
                }catch(e){  
                    alert('抱歉，此操作被浏览器拒绝！请在浏览器地址栏输入"about:config"并回车然后将[signed.applets.codebase_principal_support]设置为true');  
                }
            }else{  
                alert('抱歉，您所使用的浏览器无法完成此操作。您需要手动将' + url + '设置为首页。');  
            } 
        }
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
}