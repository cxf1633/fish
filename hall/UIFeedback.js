/****************************************************************
* 作者：xiaos
* 日期：2018-07-16
* 描述：意见反馈
****************************************************************/
"use strict";
wls.namespace.UIFeedback = ccui.Layout.extend({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function() {
        wls.CreateMask(this)
        var node = wls.LoadPopupView(this.fullPath("hall/uifeedback.json"), this)
        node.setPosition(display.width/2, display.height/2)
        this.addChild(node)
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        node.setScale(node.getScale()*scale)
        this.adaptClose(this.btn_close)
        this.tf_phonenum = wls.TextFieldToEditBox(this.tf_phonenum)
        this.tf_content = wls.TextFieldToEditBox(this.tf_content)
        this.spr_progress_1.runAction(cc.RepeatForever.create(cc.RotateBy.create(1, 30)))
        this.spr_progress_2.runAction(cc.RepeatForever.create(cc.RotateBy.create(1, 30)))
        this.spr_progress_1.setVisible(false)
        this.spr_progress_2.setVisible(false)

        this.btn_delete_pic_1.setVisible(false)
        this.btn_delete_pic_2.setVisible(false)
        this.photoUrlpath = ""
    },

    uploadImg: function(imgurl, circle) {
        if( imgurl == null || imgurl == undefined || imgurl.length == 0 ) {
            circle.setVisible(false)
            return
        }
        ApiHelper.UploadCloudimg(imgurl,function (result){
            cc.log(result)
            DelayTimer.call(1.5, function(){
                cc.log(result)
                if( result && result.status == 0 ) {
                    circle.setVisible(false)
                    if (this.photoUrlpath.length == 0) {
                        this.photoUrlpath = result
                        return
                    }
                    this.photoUrlpath = this.photoUrlpath+"||"+this.photoUrlpath
                }
            }.bind(this))
        }.bind(this))
    },

    click_btn_get_pic1: function() {
        Device.callImagePicker("library", function(imgfullpath) {
            cc.log(imgfullpath)
            this.spr_progress_1.setVisible(true)
            this.btn_delete_pic_1.setVisible(true)
            this.btn_get_pic1.loadTextures(imgfullpath, imgfullpath, imgfullpath)
            this.uploadImg(imgfullpath, this.spr_progress_1)
        }.bind(this), false)
    },

    click_btn_get_pic2: function() {
        Device.callImagePicker("library", function(imgfullpath) {
            cc.log(imgfullpath)
            this.spr_progress_2.setVisible(true)
            this.btn_delete_pic_2.setVisible(true)
            this.btn_get_pic2.loadTextures(imgfullpath, imgfullpath, imgfullpath)
            this.uploadImg(imgfullpath, this.spr_progress_2)
        }.bind(this), false)
    },

    click_btn_delete_pic_1: function() {
        this.btn_delete_pic_1.setVisible(false)
        this.spr_progress_1.setVisible(false)
        this.btn_get_pic1.loadTextures(this.fullPath("hall/images/feedback/feedback_bg_2.png"),
                                        this.fullPath("hall/images/feedback/feedback_bg_2.png"),
                                        this.fullPath("hall/images/feedback/feedback_bg_2.png"),1)
    },

    click_btn_delete_pic_2: function() {
        this.btn_delete_pic_2.setVisible(false)
        this.spr_progress_2.setVisible(false)
        this.btn_get_pic2.loadTextures(this.fullPath("hall/images/feedback/feedback_bg_2.png"),
                                        this.fullPath("hall/images/feedback/feedback_bg_2.png"),
                                        this.fullPath("hall/images/feedback/feedback_bg_2.png"),1)
    },

    click_btn_commit: function() {
        var phone = this.tf_phonenum.getString()
        var msg = this.tf_content.getString()
        if (msg.length == 0 && this.photoUrlpath.length == 0) {
            this.toast(wls.Config.getLanguage(800000365))
            return
        }
        if (phone.length == 0 || phone.length != 11) {
            this.toast(wls.Config.getLanguage(800000366))
            return 
        }
        ApiHelper.FeedBack( Device.getDeviceCode() , wls.GameID, 0 ,msg || "用户没有输入文本！", phone , this.photoUrlpath, function(result)
        {
            if( result || result.status == 0 )
            {
                this.toast(wls.Config.getLanguage(800000367))
            }
        }.bind(this))
    },

    click_btn_close: function() {
        this.removeFromScene()
    }
})