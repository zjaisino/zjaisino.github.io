var LOG = {
    list:[{
        ver:'v1.5',
        date:'2015-10-08',
        desc:[
            '1.修复点击输入框展开搜索结果列表后，列表自动隐藏'
        ]
    }, {
        ver:'v1.4',
        date:'2015-02-12',
        desc:[
            '1.优化代码逻辑'
        ]
    }]
}

$(function(){
    $('#updatelog').html(template('updatelog-tpl', LOG));
});