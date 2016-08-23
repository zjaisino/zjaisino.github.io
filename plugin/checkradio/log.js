var LOG = {
    list:[{
        ver:'v1.4',
        date:'2016-08-23',
        desc:[
            '1.增加开关功能'
        ]
    }]
}

$(function(){
    $('#updatelog').html(template('updatelog-tpl', LOG));
});