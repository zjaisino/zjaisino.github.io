/**
 * FileName: template.js
 * Create: 2015-02-03 10:21
 * Update: 2015-02-04 14:26
 * Version: v1.1
 * Author：Aniu
 * QQ：897102078
 */

;!(function(window, document, undefined){
    var template = function(tplid, source){
        var ele = document.getElementById(tplid);
        if(ele && ele.nodeName=='SCRIPT'){
            source = source||{};
            return detach(ele.innerHTML, source);
        }
        return '';
    }
    
    template.config = {
        openTag:'{{',
        closeTag:'}}'
    }
    
    var each = function(data, callback){
        for(i in data){
            callback.call(data, data[i], i);
        }
    }
    
    var tools = {
        each:each
    }
    
    template.tools = function(toolName, callback){
        tools[toolName] = callback;
    }
    
    //分离逻辑和html
    var detach = function(tpl, source){
        var openTag = template.config.openTag, closeTag = template.config.closeTag, code = '';
        each(tpl.replace(/^\s+/g, '').split(openTag), function(val, key){
            val = val.replace(/\s+$/g, '').split(closeTag);
            if(key >= 1){
                code += compile(val[0].replace(/^\s+/g, '').replace(/\s+$/g, ''), true);
            }
            else{
                val[1] = val[0];
            }
            code += compile(val[1].replace(/[\n\r]+/g, ''));
        });
        return render(code, source);
    }
    
    var compile = function(code, logic){
        var flag, echo;
        if(logic){
            if((flag = match(code, 'if')) !== false){
                echo = 'if('+flag+'){';
            }
            else if((flag = match(code, 'elseif')) !== false){
                echo = '}else if('+flag+'){';
            }
            else if((flag = match(code, 'else')) !== false){
                echo = '}else{';
            }
            else if(match(code, '/if') !== false){
                echo = '}';
            }
            else if((flag = match(code, 'each')) !== false){
                flag = flag.split(/\s+/);
                echo = 'tools.each('+ flag[0] +', function('+ flag[1];
                if(flag[2]){
                    echo += ', '+flag[2]+'){';
                }
            }
            else if(match(code, '/each') !== false){
                echo = '});';
            }
            else{
                echo = 'code+='+code+';';
            }
        }
        else{
            echo = 'code+=\"'+code+'\";';
        }
        return echo;
    }
    
    var render = function(code, source){
        code = 'var code="",tools=this.tools;with(source){'+code;
        code += '};this.echo=function(){return code;}';
        var Result = new Function('source', code);
        Result.prototype.tools = tools;
        return new Result(source).echo();
    }
    
    var match = function(string, filter){
        if(string.indexOf(filter) === 0){
            return string.substr(filter.length).replace(/^\s+/g, '').replace(/\s+$/g, '');
        }
        return false;
    }
    
    window.template = template;
})(this, document);