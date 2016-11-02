var LOG = {
    list:[{
        ver:'v1.4.2',
        date:'2016-11-01',
        desc:[
            '1.修复当相册为一个时，报错bug'
        ]
    }, {
        ver:'v1.4.1',
        date:'2016-04-07',
        desc:[
            '1.修复当图片为一张时报错问题'
        ]
    }, {
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