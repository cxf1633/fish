/****************************************************************
 * 作者：xiaos
 * 日期：2018-07-13
 * 描述：话费兑换
 ****************************************************************/
"use strict";
wls.namespace.UIPhoneChargesExc = ccui.Layout.extend({
    getZorder:function () {
        return wls.ZOrder.Pop+1
    },
    onCreate: function() {
        wls.CreateMask(this)
        var ccnode = wls.LoadPopupView(this.fullPath("hall/uiphochargesexc.json"), this)
        ccnode.setPosition(display.width/2, display.height/2)
        this.addChild(ccnode)
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        ccnode.setScale(ccnode.getScale()*scale)
        this.adaptClose(this.btn_close)
        cc.log(wls.Config.getLanguage(800000392))
        this.txt_notice.setString(wls.Config.getLanguage(800000392))
        this.txt_notice.setContentSize(cc.LabelTTF.create(wls.Config.getLanguage(800000392), "Arial", 16).getContentSize())

        this.tf_phone = wls.TextFieldToEditBox(this.tf_phone)
        var num = this.find("DAPlayer").getPropAmount(12)
        this.text_cur_count.setPositionX(0)
        this.text_cur_count.setString(num/100)
        this.text_cur_count.setContentSize(cc.LabelTTF.create(num/100, "Arial", 24).getContentSize())
        this.text_cur_count.setColor(num/100<50?cc.c3b(255, 0, 0):cc.c3b(255, 255, 255))
        this.text_aim_count.setString("/50")
        this.text_aim_count.setContentSize(cc.LabelTTF.create("/50", "Arial", 24).getContentSize())
        this.fnt_cur_count.setString(num/100)
        
        
    },

    click_btn_sure: function() {
        var phone = this.tf_phone.getString()
        if (phone == null || phone == "" || phone.length == 0 || phone.length != 11) {
            this.toast(wls.Config.getLanguage(800000224))
            return
        }
        this.sendMsg("sendExcPhoneCharges",phone)
    },

    click_btn_close: function() {
        this.removeFromScene()
    },
})