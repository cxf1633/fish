/****************************************************************
 * 作者：xiaos
 * 日期：2018-08-03
 * 描述：大师赛日常任务界面
 ****************************************************************/

 wls.namespace.UIHallMasterTaskItem = ccui.Layout.extend({
    onCreate: function(data) {
        var node = wls.LoadStudioNode(this.fullPath("hall/uimaster_taskitem.json"), this)
        node.setPosition(this.getItemSize().width/2, this.getItemSize().height/2)
        this.addChild(node)
        this.setContentSize(this.getItemSize())

     },

    getItemSize: function() {
        return this.img_bg.getContentSize()
     },

    updateView: function(data) {
        var aim = data.taskData.task_data2
        var cur = data.nTaskNum
        var per = cur/aim*100
        this.bar_per.setPercent(per > 100? 10 : per)
        this.txt_per.setString(cur+"/"+aim)
        this.fnt_award.setString(data.taskData.awardCount)
        
        var des = wls.format(data.taskData.task_text,"%d",[data.taskData.task_data2])
        this.txt_task_des.setString(des)

        this.img_black.setVisible(per >= 100)
        this.spr_tick.setVisible(per >= 100)
    },

 })

wls.namespace.UIHallMasterTask = cc.Node.extend
({
    getZorder: function () {
        return wls.ZOrder.Pop+2
    },
    onCreate: function() {
        wls.CreateMask(this)
        var node = wls.LoadPopupView(this.fullPath("hall/uimaster_task.json"), this)
        node.setPosition(display.width/2, display.height/2)
        this.addChild(node)
        this.adaptClose(this.btn_close)
    },

    onActive: function() {
        this.updateView()
    },    
    updateView: function() {
        this.listview_items.setGravity(1)
        var list = this.find("DAMaster").getTaskListData()
        var showList = []
        var showList2 = []
        for (var i = 0; i < list.length; i++) {
            var taskData = wls.Config.getTaskDataById(list[i].nTaskID)
            if (!taskData ||taskData.show_type != 2 ) { continue }
            if (list[i].isReward) { 
                list[i].taskData = taskData
                showList2.push(list[i])
                continue
            }
            if (list[i].nTaskNum >= taskData.task_data2) {
                this.sendMsg("sendGetTaskReward",list[i].nTaskID)
                list[i].taskData = taskData
                showList2.push(list[i])
                continue
            }
            list[i].taskData = taskData
            showList.push(list[i])
        }
        showList.sort( function(a, b){ return  b.taskData.task_turn - a.taskData.task_turn; })
        showList2.sort( function(a, b){ return  b.taskData.task_turn - a.taskData.task_turn; })
        for (var i = 0; i < showList2.length; i++) {
            showList.push(showList2[i])
        }

        this.listview_items.removeAllChildren()
        this.getScene().setGameObjectRoot(this.listview_items)
        for (var key = 0; key < showList.length; key++) {
            var item = this.createUnnamedObject("UIHallMasterTaskItem", {})
            item.updateView(showList[key])
        }
        this.getScene().setGameObjectRoot(null)
        this.listview_items.setGravity(2)
    },

    click_btn_close: function() {
        this.removeFromScene()
    },
})