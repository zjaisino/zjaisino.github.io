var LOG = {
    list:[{
        ver:'v3.2.2',
        date:'2016-04-09',
        desc:[
            '1.增加layerConfig全局配置方法'
        ]
    }, {
        ver:'v3.2.1',
        date:'2016-04-08',
        desc:[
            '1.修复一些bug',
            '2.增加maxHeight属性'
        ]
    }, {
        ver:'v3.1.3',
        date:'2016-04-04',
        desc:[
            '1.修复一些bug'
        ]
    }, {
        ver:'v3.1.2',
        date:'2016-01-26',
        desc:[
            '1.优化代码逻辑'
        ]
    }, {
        ver:'v3.1.1',
        date:'2016-01-18',
        desc:[
            '1.优化代码逻辑',
            '2.增加padding属性'
        ]
    }, {
        ver:'v3.0.1',
        date:'2015-12-30',
        desc:[
            '1.增加button属性，可自定义配置底部按钮，配置后将覆盖cancel和confirm'
        ]
    }, {
        ver:'v3.0',
        date:'2015-12-24',
        desc:[
            '1.优化代码逻辑'
        ]
    }, {
        ver:'v2.9',
        date:'2015-11-11',
        desc:[
            '1.修复取消按钮没有设置回调函数无法关闭bug'
        ]
    }, {
        ver:'v2.8.9',
        date:'2015-11-04',
        desc:[
            '1.按钮逻辑修改'
        ]
    }, {
        ver:'v2.8.8',
        date:'2015-09-30',
        desc:[
            '1.修复IE6弹出层初始化高度自适应问题'
        ]
    }, {
        ver:'v2.8.7',
        date:'2015-08-14',
        desc:[
            '1.将遮罩层优化为全局的，如果显示多个都设置了遮罩的弹出层，直到关闭最后一个才会关闭遮罩层'
        ]
    }, {
        ver:'v2.8.6',
        desc:[
            '1.优化了实例方法layerResize逻辑'
        ]
    }, {
        ver:'v2.8.4',
        desc:[
            '1.优化了Layer.extend逻辑'
        ]
    }, {
        ver:'v2.8.3',
        desc:[
            '1.修复了提示层没有绑定事件在关闭时，unbind报错问题',
            '2.修复了弹出层在关闭时options未定义错误'
        ]
    }]
}

$(function(){
    $('#updatelog').html(template('updatelog-tpl', LOG));
});