var LOG = {
    list:[{
        ver:'v2.7',
        date:'2016-03-15',
        desc:[
            '1.优化代码逻辑'
        ]
    }, {
        ver:'v2.4',
        date:'2015-10-18',
        desc:[
            '1.增加首页尾页按钮'
        ]
    }, {
        ver:'v2.3',
        date:'2015-10-05',
        desc:[
            '1.优化代码逻辑'
        ]
    }]
}

$(function(){
    $('#updatelog').html(template('updatelog-tpl', LOG));
});