var LOG = {
    list:[{
        ver:'v1.2.1',
        date:'2016-09-10',
        desc:[
            '1.修复一些bug',
            '2.增加双面板日历、年月下拉、时分秒选择、自定义单元格功能'
        ]
    }, {
        ver:'v1.1.1',
        date:'2016-08-10',
        desc:[
            '初版发布'
        ]
    }]
}

$(function(){
    $('#updatelog').html(template('updatelog-tpl', LOG));
});