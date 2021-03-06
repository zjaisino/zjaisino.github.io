var LOG = {
    list:[{
        ver:'v1.4.9',
        date:'2016-12-05',
        desc:[
            '1.新增onresize方法'
        ]
    },{
        ver:'v1.4.8',
        date:'2016-11-07',
        desc:[
            '1.增加全局配置方法$.calendar.config'
        ]
    },{
        ver:'v1.4.7',
        date:'2016-11-03',
        desc:[
            '1.增加elem属性',
            '2.修复多次调用组件，生成多个对象的bug',
			'3.优化组件显示时关闭其它日历逻辑',
			'4.新增工具方法$.calendar.hide | $.calendar.destory | $.calendar.reset'
        ]
    },{
        ver:'v1.4.2',
        date:'2016-10-17',
        desc:[
            '1.增加$.calendar.date方法功能，能够返回月份的最后一天'
        ]
    },{
        ver:'v1.4.1',
        date:'2016-10-14',
        desc:[
            '1.修改实例方法setOptions名称为“set”',
			'2.增加实例方法：get、destory、reset'
        ]
    },{
        ver:'v1.3.4',
        date:'2016-10-14',
        desc:[
            '1.增加时分秒下拉选择'
        ]
    },{
        ver:'v1.3.3',
        date:'2016-10-13',
        desc:[
            '1.修复组件选择小于等于2000年以下的时间时显示错误问题'
        ]
    },{
        ver:'v1.3.2',
        date:'2016-10-12',
        desc:[
            '1.修复火狐在选择年月时，每次都选中本月问题'
        ]
    },{
        ver:'v1.3.1',
        date:'2016-10-11',
        desc:[
            '1.修复组件在DOMContentLoaded、onload事件中直接调用时页面空白bug'
        ]
    },{
        ver:'v1.2.5',
        date:'2016-09-25',
        desc:[
            '1.细节优化'
        ]
    },{
        ver:'v1.2.4',
        date:'2016-09-18',
        desc:[
            '1.细节优化'
        ]
    },{
        ver:'v1.2.3',
        date:'2016-09-13',
        desc:[
            '1.修复一些bug'
        ]
    }, {
        ver:'v1.2.2',
        date:'2016-09-10',
        desc:[
            '1.修复一些bug',
            '2.取消ctrl多选功能，直接点击多选'
        ]
    }, {
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