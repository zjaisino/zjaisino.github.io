/**
 * @filename jquery.calculate.js
 * @author Aniu[2014-07-14 11:05]
 * @update Aniu[2015-10-12 14:18]
 * @version v1.1
 * @description none
 */

;!(function(window, document, $, undefined){
	$.fn.calculate = function(o){
	    o = $.extend({
	    	init:false,
	        isNull:false,
	        count:$.noop,
	        total:$.noop,
	        max:$.noop
	    }, o||{});
	    var result = function(num, val, that){
	        (o.max !== null && val > parseInt(o.max(that))) && (val = parseInt(o.max(that)));
	        num.val(val);
	        o.count(val, that, o.init);
	        o.init && o.total();
	    }
	
	    return this.each(function(){
	        var that = $(this),
	            less = that.find('.j-less'),
	            num = that.find('.j-num'),
	            value = num.val(),
	            add = that.find('.j-add'),
	            max = parseInt(o.max(that)),
	            flag = false;
	        if(max == value){
	        	add.addClass('s-dis');
	        }
	        if(o.isNull){
	        	if(value == '0'){
	        		less.addClass('s-dis');
	        	}
	        }
	        else{
	        	if(value == '1'){
	        		less.addClass('s-dis');
	        	}
	        }
	        less.click(function(){
	        	if(!less.hasClass('s-dis')){
	        		var val = num.val();
	                if(parseInt(val).toString() === 'NaN'||val<=0){
	    				val = o.isNull ? 0 : 1;
	    			}
	                if(val > (o.isNull ? 0 : 1)){
	                	val -= 1;
	                	add.removeClass('s-dis');
	                }
	                else{
	                	less.addClass('s-dis');
	                }
	                o.init = true;
	                result(num, val, that);
	        	}
	        });
	        add.click(function(){
	        	if(!add.hasClass('s-dis')){
		            var val = num.val();
		            parseInt(val).toString() === 'NaN' && (val = 0);
		            if(max !== 'NaN'){
		            	if(parseInt(val)===max){
		            		val = parseInt(val);
		            	}else{
		            		val = parseInt(val) + 1;
		            		if(val===max){
		            			add.addClass('s-dis');
		            		}
		            		less.removeClass('s-dis');
		            	}
		            }else{
		            	val = parseInt(val) + 1;
		            	less.removeClass('s-dis');
		            }
		            o.init = true;
		            result(num, val, that);
	        	}
	        });
	        num.keydown(function(e){
	        	var code = e.keyCode;
	        	if((code>=48&&code<=57) || (code>=96&&code<=105) || code === 8){
	        		return true;
	        	}
	        	return false;
	        });
	        num.keyup(function(){
	            var val = num.val();	
	        	if(flag){
	                val = (isNaN(val) || val<=0) ? (o.isNull ? 0 : 1) : ((val = parseInt(val)).toString() == 'NaN' ? 1 : val);
	            	o.init = true;
	            }
	            flag = true;
	            result(num, val, that);
	        }).keyup();
	    });
	}
})(this, document, jQuery);