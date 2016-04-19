var LOG = {
    list:[{
        ver:'v1.2',
        desc:[
            '1.增加在浮动框架中打印'
        ]
    }]
}

$(function(){
    $('#updatelog').html(template('updatelog-tpl', LOG));
});