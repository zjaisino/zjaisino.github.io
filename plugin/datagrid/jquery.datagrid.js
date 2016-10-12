/**
 * @filename jquery.datagrid.js
 * @author Aniu[2016-10-12 13:13]
 * @update Aniu[2016-10-12 13:13]
 * @version v1.1
 * @description 数据网格，依赖paging组件
 */
 
;!(function(root, factory){
    if(typeof define === 'function' && (define.cmd || define.amd)){
        define(['jquery', 'paging'], factory)
    }
	else if(typeof jQuery !== 'undefined'){
        factory(jQuery, root, document)
    }
})(this, function($, root, doc, undefined){
    
    var Datagrid = function(options){
        var that = this;
        that.options = $.extend(true, {
            container:'',
            url:'',
            pCount:10,
            paramJSON:'',
            current:1,
            paging:true,
            last:false,
            isFull:true,
            scroll:{
				enable:false,
				container:window
			},
            ajax:{},
            condition:{},
            loading:{
                show:function(){
                    
                },
                hide:function(){
                   
                }
            },
            button:{
                prev:'«',
                next:'»',
                first:'',
                last:''
            },
            caption:{
                enable:true,
                text:''
            },
            btnleft:[],
            btnright:[],
            fields:[]
        }, options||{});
        
        that.pagingName = 'datagridPaging' + (++Datagrid.index);
    }
    
    Datagrid.index = 0;
    
    Datagrid.attr = ['width', 'align', 'style', 'name', 'colspan', 'rowspan'];
    
    Datagrid.prototype = {
        constructor:Datagrid,
        init:function(){
            var that = this;
            that.working();
            return ({
                set:function(key, val){
                    if(key || val){
                        if($.isPlainObject(key)){
                            that.options = $.extend(true, that.options, key)
                        }
                        else{
                            that.options[key] = val
                        }
                        that.working(true)
                    }
                },
                get:function(key){
                    if(!key){
                        return that.options
                    }
                    return that.options[key]
                }
            })
        },
        working:function(set){
            var that = this, opts = that.options;
            var container = opts.container;
            if(!container){
                return;
            }
            if(typeof container == 'string'){
                container = $(container)
            }
            container.children().remove();
            that.element = $(that.createHtml()).appendTo(container);
            var tablebox = that.element.find('.datagrid-tablebox');
            that.paging = $.paging(that.pagingName, opts, {
                wrap:opts.paging ? that.element.find('datagrid-paging') : null,
                echoData:function(res, type){
                    tablebox.html(that.createList(res))
                }
            })
            that.createHead();
        },
        createHtml:function(){
            var that = this, opts = that.options;
            var tpl = '<div class="ui-datagrid">\
                            <div class="datagrid-body">\
                                <div class="datagrid-main">\
                                    <div class="datagrid-tablebox">\
                                    </div>'+ (opts.paging ? '<div class="datagrid-paging"></div>' : '') +'\
                                </div>\
                            </div>\
                       </div>';
            
            return tpl
        },
        createHead:function(){
            var that = this, opts = that.options;
            if(opts.caption.enable || opts.btnleft.length || opts.btnright.length){
                var elem = $('<div class="datagrid-head"></div>');
                if(opts.btnleft.length){
                    that.createBtn($('<div class="datagrid-btnleft"></div>').appendTo(elem), opts.btnleft)
                }
                
                if(opts.caption.enable){
                    elem.append('<div class="datagrid-caption">'+(opts.caption || '')+'</div>')
                }
                
                if(opts.btnright.length){
                    that.createBtn($('<div class="datagrid-btnright"></div>').appendTo(elem), opts.btnright)
                }
                
                that.element.append(elem)
            }
            
        },
        createBtn:function(elem, arr){
            var that = this;
            $.each(arr, function(key, val){
                if(typeof val.text === 'function'){
                    var tpl = val.text();
                }
                else{
                    tpl += '<a href="javascript:void(0);" target="'+ (val.target||'_self') +'" class="datagrid-btn'+ (val.classname||'').replace(/^([\w-]+)$/g, ' $1') +'">'+ val.text +'</a>'
                }
                if(tpl){
                    var btn = $(tpl).appendTo(elem);
                    if(typeof val.callback === 'function'){
                        btn.on(val.event||'click', val.callback)
                    }
                    else if(typeof val.funcCallback){
                        val.funcCallback(btn, that.paging)
                    }
                }
            });
        },
        createList:function(res){
            var that = this, opts = that.options;
            var tpl = '<table class="datagrid-table">';
            if(opts.title.length){
                tpl += '<thead>';
                //二维数组
                if($.isArray(opts.title[0])){
                    
                }
                else{
                    that.createCols(opts.title, true)
                }
                tpl += '</thead>';
            }
            tpl += '</table>';
            return tpl;
        },
        createCols:function(arr, title){
            var tpl = '<tr>';
            var col = 'td';
            if(title){
                col = 'th';
            }
            $.each(arr, function(k, v){
                tpl += '<'+ col;

                tpl += '>'+ (typeof v.filter == 'function' ? v.filter(v.text) : v.text) +'</'+ col +'>';
            })
            tpl += '</tr>';
            return tpl;
        },
        bindEvent:function(){
            var that = this, opts = that.options;
            if(opts.btnleft.length && opts.btnleft){
                $.each(opts.btnleft, function(key, val){
                    
                })
            }
        }
    }
    
    $.extend({
        datagrid:function(options){
            return new Datagrid(options).init()
        }
    })

    return $.datagrid;
})