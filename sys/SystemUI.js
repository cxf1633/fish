"use strict"
// 系统UI集合

// 转圈等待
wls.namespace.UIWaiting = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Toast -1
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadStudioNode(this.fullPath("common/ui/WaitingNode.json"), this);
        if (ccnode == undefined) { return }
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);

        var self = this
        var seq = cc.Sequence.create(cc.DelayTime.create(0.1),cc.CallFunc.create(function () {
            self.circle.setRotation(self.circle.getRotation() + 30)
        }))
        this.circle.runAction(seq.repeatForever());
        this.setVisible(false);
        
        this.keyList = []
        this.waitCount = 0
        this.callBack = null
    },
    reset: function () {
        this.keyList = []
        this.waitCount = 0
        this.callBack = null
    },

    updateKey: function(bVisible,keyName,waitStr,callBack)
    {
        if (waitStr == null ) {
            waitStr = wls.Config.getLanguage(800000178)
        }
        this.Text_tips.setString(waitStr)
        if (keyName == null) {
            this.waitCount = this.waitCount + 1*(bVisible?1:-1)
            this.waitCount < 0 ? this.waitCount = 0:0
            this.updateShow()
            return  
        }
        if (bVisible) { //添加
            this.keyList.push(keyName)
            if (callBack) { this.callBack = callBack }
        } else { //删除
            for (var key in this.keyList) {
                if (keyName == this.keyList[key]) {
                    this.keyList.splice(key, 1)
                }
            }
        }
        this.updateShow()
    },   

    updateShow: function()
    {
        var count = this.keyList.length
        if (count <= 0 && this.waitCount <= 0) {
            this.show(false)
            this.callBack = null
        } else {
            this.show(true)
        }
    },   

    show: function(bVisible)
    {
        this.setVisible(bVisible);
        this.stopAllActions();
        if (bVisible)
        {
            var self = this
            wls.CallAfter(this, 15, function () {
                self.overTime()
            });
        }
    },

    overTime: function()
    {
        for (var key in this.keyList) {
            cc.log("UIWaiting overTime keyName = " + this.keyList[key])
        }
        this.getScene().waitOverTime();
    },

});

// 吐司
wls.namespace.UIToast = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Toast
    },
    onCreate: function()
    {
        var toastBg = ccui.ImageView.create()
        toastBg.loadTexture(this.fullPath("common/images/layerbg/com_pic_infobg2.png"), 1)
        toastBg.setScale9Enabled(true);
        toastBg.setCapInsets({x : 42, y : 40, width : 1, height : 1})
        toastBg.setAnchorPoint(cc.p(0.5, 0.5))
        toastBg.setPosition(cc.p(display.width / 2, display.height * 0.6))
        toastBg.setOpacity(0)
        this.addChild(toastBg)
        this._toastBg = toastBg

        var txtTips = cc.LabelTTF.create("", "Arial", 36)
        toastBg.addChild(txtTips)
        this._txtTips = txtTips
        this.setVisible(false)
    },

    showText: function(str)
    {
        this._toastBg.stopAllActions();
        this.setVisible(true);
        this._toastBg.setOpacity(255);
        this._txtTips.setString(str)
        var size = this._toastBg.getContentSize();
        size.width = this._txtTips.getContentSize().width + 70;
        size.height =  this._txtTips.getContentSize().height + 34;
        this._toastBg.setContentSize(size);
        this._txtTips.setPosition(cc.p(this._toastBg.getContentSize().width / 2, this._toastBg.getContentSize().height / 2 + 2))
        var self = this;
        this._toastBg.runAction(cc.sequence(cc.delayTime(3), cc.fadeOut(0.3), cc.callFunc(function() {
            self.setVisible(false);
        })));
    },
});

// 对话框
wls.namespace.UIDialog = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Dialog
    },
    onCreate: function()
    { 
        wls.CreateMask(this);
        var ccnode = wls.LoadStudioNode(this.fullPath("common/ui/uiMessageDialog.json"), this);
        if (ccnode == undefined) { return }
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);

        var self = this;
        self.node_middle.setVisible(false)
        self.node_min.setVisible(false)
        self.node_hook.setVisible(false)
        self.btn_hook.getChildByName("spr_hook").setVisible(false)  
        self.btn_min_only_OK.setVisible(false)  
        self.btn_middle_only_OK.setVisible(false)
        self.btn_middle_OK.setVisible(false)  
        self.btn_middle_CANCEL.setVisible(false)

        self.btn_min_only_OK.__soundName = "exit_01.mp3"
        self.btn_middle_only_OK.__soundName = "exit_01.mp3"
        self.btn_middle_OK.__soundName = "exit_01.mp3"
        self.btn_middle_CANCEL.__soundName = "exit_01.mp3"

        self.btn_min_only_OK.setTag(0)  
        self.btn_middle_only_OK.setTag(1)
        self.btn_middle_OK.setTag(2)
        self.btn_middle_CANCEL.setTag(3)
        self.btn_hook.setTag(4)

        self.firstPos = cc.p(0, 0);
        self.firstPos.x = self.text_middle_data.getPositionX()
        self.firstPos.y = self.text_middle_data.getPositionY()
        self.textSize = cc.size(455,185)
        self.text_middle_data.ignoreContentAdaptWithSize(true)
        self.text_middle_data.setTextAreaSize(cc.size(0, 0))
        self.text_middle_desc.ignoreContentAdaptWithSize(true)
        self.text_middle_desc.setTextAreaSize(cc.size(0, 0))
        this.resetText();

        self.setVisible(false)
    },
    
    //modeType: 2. 中型，只有确定   3.中型确定取消  4.有勾， 其他. 小型，只有确定
    updateView: function(modeType, strmsg, strhook)
    {
        var self = this;
        self.setVisible(true)
        self.node_hook.setVisible(false)
        self.node_middle.setVisible(false)
        self.node_min.setVisible(false) 
        if (modeType == 2)
        {
            self.node_middle.setVisible(true)
            self.btn_middle_only_OK.setVisible(true)    
            self.btn_middle_OK.setVisible(false)
            self.btn_middle_CANCEL.setVisible(false)
            if (strmsg) self.setTextData(strmsg);
        }
        else if(modeType == 3)
        {
            self.node_middle.setVisible(true)
            self.btn_middle_only_OK.setVisible(false)   
            self.btn_middle_OK.setVisible(true)
            self.btn_middle_CANCEL.setVisible(true)
            if (strmsg) self.setTextData(strmsg);
        }
        else if(modeType == 4)
        {
            self.node_middle.setVisible(true)
            self.btn_middle_only_OK.setVisible(false)   
            self.btn_middle_OK.setVisible(true)
            self.btn_middle_CANCEL.setVisible(true)
            self.node_hook.setVisible(true)
            self.btn_hook.getChildByName("spr_hook").setVisible(false)
            self.textSize = cc.size(455,145)
            self.text_middle_data.setContentSize(cc.size(self.text_middle_data.getContentSize().width, 145))
            self.text_middle_data.setPositionY(self.text_middle_data.getPositionY()+20)
            self.text_middle_desc.setContentSize(cc.size(self.text_middle_data.getContentSize().width, 145))
            self.text_middle_desc.setPositionY(self.text_middle_data.getPositionY()+20)
            self.firstPos.y = self.text_middle_data.getPositionY()
            if (strmsg) self.setTextData(strmsg);
            self.text_notice.setString(!strhook ? "本次登录不再提示！" : strhook);
            self.text_notice.width = 300;
        }
        else
        {
            self.node_min.setVisible(true) 
            self.btn_min_only_OK.setVisible(true) 
            self.text_min_data.setString(strmsg);
        }
    },

    setTextData: function(str)
    {
        var back = str.split("$");
        var self = this;
        self.updateText(self.text_middle_data, back[0], self.textSize.width)
        self.updateText(self.text_middle_desc, back[1], self.textSize.width)

        var size1 = self.text_middle_data.getContentSize()
        var size2 = self.text_middle_desc.getContentSize()
        if (size2.width > 0)
        {
            var newPosY1 = self.firstPos.y + self.textSize.height/2 - size1.height/2
            self.text_middle_data.setPositionY(newPosY1)
            var newPosY2 = self.firstPos.y + self.textSize.height/2 - size1.height - size2.height/2
            self.text_middle_desc.setPositionY(newPosY2)
        }
        else
        {
            self.text_middle_data.setPositionY(self.firstPos.y)
        }
    },

    updateText: function(text, str, sizeWidth)
    {
        if (str == null)
        {
            text.setTextAreaSize(cc.size(0, 0))
            text.setString("")
            text.setVisible(false);
            return;
        }
        text.setVisible(true);
        text.setTextAreaSize(cc.size(0, 0))
        text.setString(str)
        var size = text.getContentSize()
        if (size.width > sizeWidth)
        {
            text.setTextAreaSize(cc.size(sizeWidth, 0));
            text.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER)
        }
        else
        {
            text.setTextHorizontalAlignment(1)
        }  
    },

    setCallback: function(callbak)
    {
        this._callback = callbak;
    },


    doClose: function(idx)
    {
        var bool = this.spr_hook.isVisible()
        var callbak = this._callback;
        this._callback = null;
        this.setVisible(false);
        if (callbak) callbak(idx, bool);
        this.resetText();
    },

    resetText: function (){
        this.text_middle_data.setString('')
        this.text_middle_desc.setString('')
    },
    click_btn_min_only_OK: function()
    {
        this.doClose(1);
    },

    click_btn_middle_only_OK: function()
    {
        this.doClose(1);
    },

    click_btn_middle_OK: function()
    {
        this.doClose(1);
    },

    click_btn_middle_CANCEL: function()
    {
        this.doClose(2);
    },

    click_btn_hook: function()
    {
        var bo = this.spr_hook.isVisible();
        this.spr_hook.setVisible(!bo);
    },
});

// 公告
wls.namespace.UINotice = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop -5
    },
    onCreate: function (type)
    {   
        var self = this;
        self.ROLL_SPEED = 60;
        var ccnode = wls.LoadStudioNode(this.fullPath("common/ui/uiannouncement.json"), this);
        self.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        self.size = self.panel_clip.getContentSize()
        
        self.setPositionY(150);
        self.setVisible(false);
        self._msgList = [];
        self._isShowing = false;
        this.initBg(type);
    },
    //初始化背景图片
    initBg: function (type)
    {
        if (type == 1) {
            this.bg.loadTexture(this.fullPath("common/images/com_pic_racelamp_bg2.png"), 1)
            this.bg.setCapInsets({x : 85, y : 13, width : 1, height: 14})
            this.bg.setContentSize(cc.size(this.size.width + 100,this.size.height))
            this.bg.setPositionX(-30)
        } else {

        }
    },

    /** 添加公告到播放队列中 */
    pushNotice: function (msg)
    {
        this._msgList.push(msg);
        this.updateNoticeList();
    },

    /** 更新公告播放队列 */
    updateNoticeList: function()
    {
        if(this._msgList.length <= 0)
        {
            this.setVisible(false);
            return ;
        }
        this.setVisible(true);
        if(this._isShowing)return ;
        this._isShowing = true;
        this.showNotice(this._msgList[0])
    },

    showNotice: function(msg)
    {
        var self = this;
        if(!msg) return ;
        self.node_word.setPositionX(self.bg.getContentSize().width);
        var list = this.analyzeMsg(msg)

        var richText = ccui.RichText.create()  
        richText.ignoreContentAdaptWithSize(true)  

        for (var i = 0; i < list.resultTb.length; i++) {
            var v = list.resultTb[i];
            var font = ccui.RichElementText.create( i, cc.c3b(v.r, v.g, v.b), v.a, v.word, "Arial", v.size ) 
            richText.pushBackElement(font)
        }
        richText.setLocalZOrder(10)  
        richText.setTag(100)
        richText.setName("richText")
        richText.setPosition(cc.p(self.size.width/2, 0))

        self.node_word.addChild(richText)
        self.node_word.setPositionX(self.size.width)

        var text_word = ccui.Text.create()
        text_word.ignoreContentAdaptWithSize(true)
        text_word.setFontSize(24)
        text_word.setString(list.allStr)
        var allSize = text_word.getContentSize().width 

        var seq = cc.Sequence.create(cc.MoveTo.create(allSize/60,cc.p(-self.size.width,25)),cc.CallFunc.create(function ()
        {
            richText.removeFromParent()
            self._msgList.shift();
            self._isShowing = false;
            self.updateNoticeList()
        }))
        self.node_word.runAction(seq)

    },

    analyzeMsg: function(msg)
    {
        var result = []
        var fntData = {
            r:255,
            g:255,
            b:255,
            a:255,
            size:24,
        }
        var idx = 0
        var strArray = msg.msgTemplete.split("[")
        var allStr = ""
        for(var key in strArray){
            var subStr = strArray[key];
            var end = subStr.indexOf("]");
            
            if(end < 0){
                var data = {};
                data = wls.Copy(fntData)
                data.word = subStr
                result.push(data)
                allStr = allStr +subStr
            } else {
                var data = {};
                var newStr = subStr.substring(1, end);
                var subArray = newStr.split("|");
                data.r = subArray[0];
                data.g = subArray[1];
                data.b = subArray[2];
                data.a = subArray[3];
                data.size = subArray[4];
                data.word = msg.params[idx]
                result.push(data)
                allStr = allStr + msg.params[idx]
                idx++

                var newStr2 = subStr.substring(end+1, subStr.length)
                if (newStr2 != "") {
                    var data2 = {};
                    data2 = wls.Copy(fntData)
                    data2.word = newStr2
                    result.push(data2)
                    allStr = allStr + newStr2
                }
            }
        }

        return {resultTb:result,allStr:allStr}
    },

});