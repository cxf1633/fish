/****************************************************************
 * 作者：xiaos
 * 日期：2018-08-03
 * 描述：大师赛名人堂界面
 ****************************************************************/

 wls.namespace.UIHallMasterFamousItem = ccui.Layout.extend({
    onCreate: function(data) {
        var node = wls.LoadStudioNode(this.fullPath("hall/uimaster_famousitem.json"), this)
        node.setPosition(this.getItemSize().width/2, this.getItemSize().height/2)
        this.addChild(node)
        this.setContentSize(this.getItemSize())
        this.updateView(data)
     },

    getItemSize: function() {
        return this.img_bg.getContentSize()
     },

    updateView: function(data) {
        this.txt_time.setString(data.rankTime)
        this.txt_name.setString(data.nickName)
        this.txt_score.setString(data.score)
    },

 })

wls.namespace.UIHallMasterFamous = cc.Node.extend
({
    getZorder: function () {
        return wls.ZOrder.Pop+2
    },
    onCreate: function(data) {
        wls.CreateMask(this)
        var node = wls.LoadPopupView(this.fullPath("hall/uimaster_famous.json"), this)
        node.setPosition(display.width/2, display.height/2)
        this.addChild(node)
        this.startTimer("onUpdate", 0.05, 1, -1)
        this.adaptClose(this.btn_close)
    },
    onUpdate: function() {
        var curIdx = this.pageview.getCurPageIndex()+1
        this.btn_right.setVisible(curIdx != this.pageNum)
        this.btn_left.setVisible(curIdx != 1)

        for (var i = 0; i < this.dotList.length; i++) {
            var element = this.dotList[i];
            element.setEnabled(element.getTag() != curIdx)
        }

    },
    onActive: function(data) {
        this.updateView(data)
    },    
    updateView: function(data) {
        // var list = []
        // for (var i = 0; i < data.length; i++) {
        //     var tb = {
        //         nickName: data[i].nickName,
        //         score: data[i].score,
        //         rankTime:data[i].rankTime
        //     }
        //     list.push(tb)  
        // }

        this.createPages(data)
    },

    click_btn_close: function() {
        this.removeFromScene()
    },

    createPages: function(list) {
        var key = 0
        this.pageview.removeAllChildren()
        this.dotList = []
        this.btn_dot_0.setVisible(false)
        this.pageNum = Math.ceil(list.length/4)
        for (var page = 1; page <= this.pageNum; page++) {
            var tb = []
            for (var i = 0; i < 4; i++) {
                if (!list[key]) { continue }
                tb.push(list[key])
                key++
            }
            var layout = ccui.Layout.create()
            layout.setBackGroundColor(cc.c3b(255, 0, 0))
            layout.setBackGroundColorOpacity(0)
            layout.setBackGroundColorType(1)
            this.addItems(layout,tb)
            this.pageview.addPage(layout)

            var dot = this.btn_dot_0.clone()
            dot.setVisible(true)
            dot.setTag(page)
            this.btn_dot_0.getParent().addChild(dot)
            this.dotList.push(dot)
            dot.setPositionX(-(this.pageNum -1 )*50/2 + (page -1 )*50)
        }
    },

    addItems: function(layout,list) {
        this.getScene().setGameObjectRoot(layout);
        var size = this.pageview.getContentSize()
        for (var key = 0; key < list.length; key++) {
            var node = cc.Node.create()
            var item = this.createUnnamedObject("UIHallMasterFamousItem", list[key]) 
            wls.BindUI(item, item)
            var width = size.width/8
            item.setPosition(key*size.width/4, 0)
        }
        this.getScene().setGameObjectRoot(null);
    },
    
    click_btn_right: function() {
        var curIdx = this.pageview.getCurPageIndex()+1
        if (curIdx >this.pageNum ) {curIdx = this.pageNum}
        this.pageview.scrollToPage(curIdx)
    },
    click_btn_left: function() {
        var curIdx = this.pageview.getCurPageIndex()-1
        if (curIdx < 0 ) {curIdx = 0}
        this.pageview.scrollToPage(curIdx)
    },  
})