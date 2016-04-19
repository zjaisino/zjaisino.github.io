var LOG = {
    list:[{
        ver:'v1.3',
        date:'2015-04-28',
        desc:[
            '1.优化代码逻辑，修复一些bug'
        ]
    }]
}

$(function(){
    $('#updatelog').html(template('updatelog-tpl', LOG));
});