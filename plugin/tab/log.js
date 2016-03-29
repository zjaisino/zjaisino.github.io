var LOG = {
    list:[{
        ver:'v1.4',
        date:'2016-03-24',
        desc:[
            '1.优化代码逻辑'
        ]
    }, {
        ver:'v1.4',
        date:'2016-01-15',
        desc:[
            '1.选项卡可滚动切换'
        ]
    }, {
        ver:'v1.3',
        date:'2015-06-07',
        desc:[
            '1.优化代码逻辑'
        ]
    }]
}

$(function(){
    $('#updatelog').html(template('updatelog-tpl', LOG));
});