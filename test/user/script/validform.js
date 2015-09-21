/**
 * FileName: validform.js
 * Author: Aniu[date:2015-04-05 14:31]
 * Update: Aniu[date:2015-04-14 15:09]
 * Version: v1.2 beta
 */

;!(function(window, document, $, undefined){
    var valid = {
        required:function(val){
            return !!val;
        },
        mobile:function(val){
            return /^0?(13|14|15|17|18)[0-9]{9}$/.test(val);
        },
        email:function(val){
            return /^\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(val)
        },
        phone:function(val){
            return /^[0-9-()（）]{7,18}$/.test(val);
        },
        idcard:function(val){
            return /^\d{17}[\d|x]|\d{15}$/.test(val);
        },
        taxnum:function(val){
        	return /^[a-zA-Z0-9]{15,20}$/.test(val);
        },
        equal:function(val1, val2){
            return val1 == val2;
        },
        remote:{
            url:'', //请求url
            field:'', //传递字段参数名
            data:{} //其它参数，已对象形式
        }
    }
    
    /**
     * @func 添加方法校验
     * @param method <String> 方法名
     * @param callback <Function> 校验方法，返回true or false
     */
	$.extend({
		addMethods:function(method, callback){
			valid[method] = callback;
		}
	});
    
    $.fn.validform = function(o){
        o = $.extend({
            msgType:'alert', //alert tips
			blur:true,
            rules:{},
            message:{},
            filter:null,
            ajaxSuccess:null
        }, o||{});
        return this.each(function(){
            var that = this, me = $(this), rules = o.rules, msg = o.message, type = o.msgType;
            
            /**
             * @func 新增或者删除校验规则，DOM元素调用
             * @param options <Object> 校验对象{rules:{}, message:{}}
             * @param type <Undefined, String> 定义类型，若为delete，则为删除规则
             */
            that.resetValid = function(options, type){
                if(!$.isPlainObject(options)){
                    return;
                }
                if(type != 'delete'){
                    $.extend(rules, options.rules||{});
                    $.extend(msg, options.message||{});
                }
                else{
                    $.each(options.rules, function(key, val){
                        delete rules[key];
                    });
                    $.each(options.message, function(key, val){
                        delete msg[key];
                    });
                }
            }
            
            $.each(rules, function(key, value){
                var ele = me.find('[name="'+ key +'"]'), check;
                o.blur && ele.on('blur', function(){
                    var val = $.trim($(this).val());
                    if(!val && !value.hasOwnProperty('required')){
                        return false;
                    }
                    $.each(value, function(k, v){
                        //判断字段存在并且需要验证
                        if(valid.hasOwnProperty(k) && v){
                            if(k == 'remote'){
                                //后端返回字符串 true or false
                                if(!ele.hasClass('s-dis')){
                                    ele.addClass('s-dis');
                                    $.ajax({
                                        url:v.url,
                                        data:(function(){
                                            var param = {};
                                            if(v.field){
                                                param[v.field] = val;
                                            }
                                            return $.extend(param, v.data||{});
                                        })(),
                                        cache:false,
                                        success:function(res){
                                        	if(typeof o.filter === "function"){
                                        		res = o.filter(res);
                                        	}
                                            ele.data('check', res);
                                            ele.removeClass('s-dis');
                                            //验证不通过
                                            if(!res){
                                                $.showmsg({type:type, message:msg[key][k], target:ele});
                                            }
                                        },
                                        error:function(){
                                            ele.data('check', false);
                                            ele.removeClass('s-dis');
                                        }
                                    });
                                }
                            }else{
                                //传#id验证
                                if(k == 'equal'){
                                    check = valid[k](val, me.find(v).val());
                                }
                                else{
                                    check = valid[k](val);
                                }
                                //验证不通过
                                if(!check){
                                    $.showmsg({type:type, message:msg[key][k], target:ele});
                                    return istrue = false;
                                }
                            }
                        }
                    });
                });
            });
            
            me.on('submit', function(){
                var flag = true;
                $.each(rules, function(key, value){
                    var istrue = true, ele = me.find('[name="'+ key +'"]'), val = $.trim(ele.val()), check;
                    //判断是否必填，如果不必填的情况下，值为空不继续验证
                    if(!val && !value.hasOwnProperty('required')){
                        return false;
                    }
                    $.each(value, function(k, v){
                        //判断字段存在并且需要验证
                        if(valid.hasOwnProperty(k) && v){
                            if(k == 'equal'){
                                check = valid[k](val, me.find(v).val());
                            }
                            else if(k == 'remote'){
                                check = ele.data('check') === true;
                            }
                            else{
                                check = valid[k](val);
                            }
                            //验证不通过
                            if(!check){
                                $.showmsg({type:type, message:msg[key][k], target:ele});
                                return istrue = false;
                            }
                        }
                    });
                    if(!istrue){
                        return flag = false;
                    }
                });
                if(flag === false){
                    return false;
                }
                if(typeof o.ajaxSuccess == 'function'){
                    var button = me.find('[type="submit"]'), 
                        btnType = button[0].nodeName, 
                        valType = {INPUT:'val', BUTTON:'text'},
                        value = button[valType[btnType]]();
                    if(!button.hasClass('s-dis')){
                        button.addClass('s-dis');
                        button[valType[btnType]]('正在提交...');
                        $.ajax({
                            url:me.attr('action'),
                            type:(me.attr('method')||'GET').toUpperCase(),
                            cache:false,
                            dataType:'json',
                            data:(function(){
                                var data = {}, arr = me.serializeArray(), len = arr.length, i = 0;
                                for(i; i<len; i++){
                                    data[arr[i].name] = arr[i].value;
                                }
                                return data;
                            })(),
                            success:function(data){
                                o.ajaxSuccess(data, me);
                                button.removeClass('s-dis');
                                button[valType[btnType]](value);
                            },
                            error:function(){
                                button.removeClass('s-dis');
                                button[valType[btnType]](value);
                            }
                        });
                    }
                    return false;
                }
            });
        });
    }
})(this, document, jQuery);