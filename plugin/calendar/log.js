var LOG = {
    list:[{
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