var LOG = {
    list:[{
        ver:'v1.1',
        date:'2016-07-01',
        desc:[
            '测试版发布'
        ]
    }]
}

$(function(){
    $('#updatelog').html(template('updatelog-tpl', LOG));
});