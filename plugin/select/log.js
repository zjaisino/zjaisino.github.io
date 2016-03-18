var LOG = {
    list:[{
        ver:'v2.7',
        date:'2016-03-18',
        desc:[
            '1.优化代码逻辑'
        ]
    }, {
        ver:'v2.5',
        date:'2015-08-01',
        desc:[
            '1.优化代码逻辑'
        ]
    }]
}

$(function(){
    $('#updatelog').html(template('updatelog-tpl', LOG));
});