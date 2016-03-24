;!(function(window, document, $, undefined){
    $.fn.calculate = function(o){
        o = $.extend({
            count:$.noop,
            total:$.noop,
            max:$.noop
        }, o||{});
        var result = function(num, val, that){
            (o.max !== null && val > o.max(that)) && (val = o.max(that));
            num.val(val);
            o.count(val, that);
            o.total();
        }
        return this.each(function(){
            var that = $(this),
                less = that.find('.j-less'),
                num = that.find('.j-num'),
                add = that.find('.j-add');
            less.click(function(){
                var val = num.val();
                isNaN(val) && (val = 0);
                val > 0 && (val -= 1);
                result(num, val, that);
            });
            add.click(function(){
                var val = num.val();
                isNaN(val) && (val = 0);
                val = parseInt(val) + 1;
                result(num, val, that);
            });
            num.keyup(function(){
                var val = num.val();	
                val = isNaN(val) ? 0 : ((val = parseInt(val)).toString() == 'NaN' ? 0 : val);
                result(num, val, that);
            });
        });
    }
})(this, document, jQuery);