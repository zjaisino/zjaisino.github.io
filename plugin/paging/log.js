var LOG = {
    list:[{
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