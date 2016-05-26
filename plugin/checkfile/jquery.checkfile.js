;!(function(window, document, $, undefined){
            
    if($.browser.msie){
        var _ = new Date().getTime();
        if(!$('#fileimg_'+_).length){
            $('<img id="fileimg_'+ _ +'" style="display:none;" />').appendTo('body');
        }
        var fileimg = $('#fileimg_'+_);
    }
    
    $.fn.checkfile = function(o){
        o = $.extend({
            maxsize:2*1024*1024,
            ext:'gif/jpg/jpeg/png',
            success:$.noop,
            error:$.noop
        }, o||{});
        return this.each(function(i, item){
            $(item).change(function(e){
                var that = this;
                var me = $(that);
                var val = me.val().toLowerCase();
                if(o.ext){
                    o.ext = o.ext.replace(/\/\.?/g, '|.');
                    var regex = new RegExp(o.ext+'$', 'g');
                    if(!regex.test(val)){
                        o.error(1, e);
                        return;
                    }
                }
                
                var filesize = 0;
                if($.browser.msie){
                    fileimg.attr('dynsrc', val);
                    filesize = fileimg.get(0).fileSize;  
                }
                else{
                    filesize = that.files[0].size;
                }
                
                if(filesize > o.maxsize){
                    o.error(2, e);
                    return;
                }
                
                o.success({
                    size:filesize,
                    url:val,
                    name:val.substr(val.lastIndexOf('\\')+1)
                }, me, function(){
                    me.before(me.clone()).prev().checkfile(o);
                });
            });
        });
    }
    
})(this, document, jQuery);