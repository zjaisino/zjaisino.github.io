/**
 * @filename jquery.numeral.js
 * @author Aniu[2016-07-01 16:31]
 * @update Aniu[2016-07-01 23:14]
 * @version v1.1
 * @description 限制输入框输入数字
 */

;!(function(window, document, $, undefined){
    
    //允许输入的keycode
    var kcode = [8, 9, 13, 37, 39];
    var keyCode = [];
    
    //大键盘数字
    for(var i=48; i<=57; i++){
        keyCode.push(i);
    }
    //小键盘数字
    for(var i=96; i<=105; i++){
        keyCode.push(i);
    }
    
    $.fn.numeral = function(o){
        o = $.extend({
            /**
             * @func 整数长度
             * @type <Number>
             */
            integer:4,
            /**
             * @func 小数长度，0则不启用小数
             * @type <Number>
             */
            decimal:2,
            /**
             * @func 是否可以输入负数
             * @type <Boolean>
             */
            minus:false,
            /**
             * @func 是否启用正负切换
             * @type <Boolean>
             * @desc 值为负数，输入“ - + ”转换为正数
             */
            convert:false,
            /**
             * @func 键盘抬起时的回调
             * @type <Null, Function>
             * @param elem <jQuery Object> 调用组件的jq对象
             * @param value <String> 输入框的值
             */
            callback:null
        }, o||{});
        
        //不能输入负数则无法启用正负抵消
        if(o.minus !== true){
            o.convert = false;
        }
        
        //若整数位数不大于0则用户可以任意输入
        if(o.integer <= 0){
            return;
        }
        
        //小数位数存在则可以输入小数点
        if(o.decimal > 0){
            keyCode.push(110);
            keyCode.push(190);
        }
        
        return this.each(function(){
            var elem = this;
            var me = $(elem);
            //禁用输入法 仅ie兼容
            elem.style.imeMode = 'disabled';
            
            me.keydown(function(e){
                var kc = e.keyCode;
                if($.inArray(kc, kcode) !== -1 || e.shiftKey || e.ctrlKey){
                    return true;
                }
                var val = $.trim(me.val());
                var index = getFocusIndex(elem, val);
                var arr = val.split('.');
                var integer = arr[0].replace(/-/g, '').length;
                var decimal;
                //存在小数点则获取小数位数
                if(arr[1] !== undefined){
                    decimal = arr[1].length;
                }
                
                //判断输入框中是否有选中的值
                if(isSelect()){
                    return true;
                }
                
                if($.inArray(kc, keyCode) === -1){
                    return false;
                }

                //只能输入一个小数点
                if(o.decimal > 0 && (kc === 110 || kc === 190)){
                    return decimal === undefined;
                }
                
                if(decimal !== undefined){
                    //在整数位置输入如果位数不够，则可以继续输入
                    if(index <= val.indexOf('.')){
                        if(integer < o.integer){
                            return true;
                        }
                    }
                    //在小数位置输入如果位数不够，则可以继续输入
                    else{
                        if(decimal < o.decimal){
                            return true;
                        }
                    }
                    
                    //如果小数位置超出则禁止输入
                    if(decimal >= o.decimal){
                        return false;
                    }
                }

                //如果整数位置超出则禁止输入
                if(integer >= o.integer){
                    return false;
                }
                
            }).keyup(function(e){
                var kc = e.keyCode;
                if($.inArray(kc, kcode) !== -1){
                    return true;
                }
                var val = $.trim(me.val());
                var index = getFocusIndex(elem, val);
                var minusIndex = val.indexOf('-');
                //过滤半角字符
                val = filterHalfAngle(val, o.integer);

                //开启负数
                if(o.minus === true){
                    if(o.convert === true){
                        //文本存在减号，按加号则移除减号
                        if(kc === 107 && minusIndex !== -1){
                            val = val.replace(/-/g, '');
                            index--;
                        }
                        //文本存在减号，按减号则移除减号，否则添加减号
                        else if(kc === 109 || kc === 189){
                            if(minusIndex !== -1){
                                val = val.replace(/-/g, '');
                                index--;
                            }
                            else{
                                val = '-' + val;
                                index++;
                            }
                        }
                    }
                    else{
                        //添加减号
                        if(minusIndex === -1){
                            val = '-' + val;
                            index++;
                        }
                    }
                    //文本中存在多个减号则只保留最前面的一个
                    if(val.match(/-/g)){
                        val = '-' + val.replace(/-/g, '');
                    }
                }
                //用户未启用负数则过滤文本中所有减号
                else{
                    val = val.replace(/-/g, '');
                }
                
                var dotIndex = val.indexOf('.');
                //用户启用了小数点，如果存在多个点号，则只保留最前面的
                if(o.decimal > 0){
                    if((kc === 110 || kc === 190) && dotIndex !== -1){
                        var start = val.substr(0, dotIndex+1);
                        var end = val.substr(dotIndex+1).replace(/\./, '');
                        val = start + end;
                    }
                }
                //未开启小数点则过滤文本中的小数点
                else if(dotIndex !== -1){
                    val = val.replace(/\./g, '');
                    index--;
                }
                
                //过滤文本中的除“减号、点号、数字”以外的字符
                val = val.replace(/[^-.0-9]/g, '');
                
                var temp = val.replace(/-/, '');
                var decimal = '';
                //截取小数，保留设置的位数，移除尾部多余部分
                if(o.decimal > 0 && temp.indexOf('.') !== -1){
                    decimal = temp.substr(temp.indexOf('.'), o.decimal+1);
                }
                //截取整数，保留设置的位数，移除尾部多余的部分，拼接上过滤的小数部分
                val = val.indexOf('-') !== -1 ? '-' : '' + temp.replace(/\.\d*/g, '').substr(0, o.integer) + decimal;

                me.val(val);
                var len = val.length;
                //重新给输入框填充过滤后的值后，焦点会在最后，因此要重新将焦点移到操作部位
                setTimeout(function(){
                    if(elem.setSelectionRange){
                        elem.setSelectionRange(index, index);   
                    } 
                    //ie
                    else{
                        var range = elem.createTextRange();
                        range.moveStart('character', -len);
                        range.moveEnd('character', -len);
                        range.moveStart('character', index);
                        range.moveEnd('character', 0);
                        range.select();
                    }
                });
                
                typeof o.callback === 'function' && o.callback(me, val);
            }).blur(function(){
                var me = $(this);
                var val = $.trim(me.val());
                if(val){
                    me.val(parseFloat(val).toFixed(o.decimal));
                }
            });
        });
    }
    
    //获取输入框内光标位置
    function getFocusIndex(elem, val){
        var index = val.length;
        if(elem.setSelectionRange){
            index = elem.selectionStart;
        }
        else{
            //ie
            var temp = document.selection.createRange();
            var textRange = elem.createTextRange();
            textRange.setEndPoint('endtoend', temp);
            index = textRange.text.length;
        }
        return index;
    }
    
    //判断输入框文本是否被选择
    function isSelect(){
        var text = '';
        //ie10以及以下浏览器
        if(document.selection){
            text =  document.selection.createRange().text;
        }
        //火狐和ie11浏览器getSelection无法获取表单元素选中文本
        else if(navigator.userAgent.toLowerCase().indexOf('gecko') !== -1){
            var textArea = document.activeElement;
            text = textArea.value.substring(textArea.selectionStart, textArea.selectionEnd);
        }
        //chrome safari opera
        else if(window.getSelection){
            text = window.getSelection().toString();
        }
        //低版本chrome
        else if(document.getSelection){
            text = document.getSelection().toString();
        }
        return !!text;
    }
    
    //过滤半角输入法数字
    function filterHalfAngle(val, len){
        var map1 = {
            '０':'0',
            '１':'1',
            '２':'2',
            '３':'3',
            '４':'4',
            '５':'5',
            '６':'6',
            '７':'7',
            '８':'8',
            '９':'9'
        }
        var map2 = {
            '－':'-',
            '．':'.',
            '。':'.'
        }
        val = val.replace(/([０１２３４５６７８９－．。])+/g, function(all, single){
            var value1, value2;
            if((value1 = map1[single]) !== undefined){
                var i = 1, length = all.length, temp = '';
                if(length > len){
                    length = len;
                }
                while(i <= length){
                    temp += value1;
                    i++;
                }
                return temp;
            }
            else if((value2 = map2[single]) !== undefined){
                return value2;
            }
            return all;
        });
        return val;
    }
    
})(this, document, jQuery);