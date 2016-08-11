var LOG = {
    list:[{
        ver:'v1.2',
        date:'2016-07-27',
        desc:[
            '1.增加paste事件'
        ]
    }, {
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