var LOG = {
    list:[{
        ver:'v1.4',
        date:'2015-12-08',
        desc:[
            '1.callback和endCallback增加参数',
            '2.优化代码逻辑'
        ]
    }, {
        ver:'v1.3',
        date:'2015-03-23',
        desc:[
            '1.优化代码逻辑'
        ]
    }]
}

$(function(){
    $('#updatelog').html(template('updatelog-tpl', LOG));
});