var LOG = {
    list:[{
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