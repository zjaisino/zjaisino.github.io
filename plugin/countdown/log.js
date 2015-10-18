var LOG = {
    list:[{
        ver:'v1.2',
        date:'2015-10-16',
        desc:[
            '1.优化代码逻辑'
        ]
    }]
}

$(function(){
    $('#updatelog').html(template('updatelog-tpl', LOG));
});