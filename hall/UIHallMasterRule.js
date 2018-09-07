/****************************************************************
 * 作者：xiaos
 * 日期：2018-08-03
 * 描述：大师赛规则界面
 ****************************************************************/

wls.namespace.UIHallMasterRule = cc.Node.extend
({
    getZorder: function () {
        return wls.ZOrder.Pop+2
    },
    onCreate: function(idstr) {
        wls.CreateMask(this)
        var node = wls.LoadPopupView(this.fullPath("hall/uimaster_rule.json"), this)
        node.setPosition(display.width/2, display.height/2)
        this.addChild(node)
        this.adaptClose(this.btn_close)
    },

    onActive: function(idstr) {
        this.ids = idstr.split(";")
        this.click_btn_join()
    },
    updateView: function(idx) {
        var descId = this.ids[idx-1] || ""
        this.btn_join.setEnabled(idx != 1)
        this.btn_game.setEnabled(idx != 2)
        this.btn_award.setEnabled(idx != 3)
        var des = wls.Config.getLanguage(descId)
        des = des == 0 ? "" : des
        des = des.replace(/[\\]n/g, '\n')
        this.txt_des.setString(des)

    },
    click_btn_join: function() {
        this.updateView(1)
    },
    click_btn_game: function() {
        this.updateView(2)
    },
    click_btn_award: function() {
        this.updateView(3)
    },
    click_btn_close: function() {
        this.removeFromScene()
    },
})