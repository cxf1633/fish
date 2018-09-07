// 升级提示界面
wls.namespace.EFLevelUp = wls.WrapNode.extend
({
    getZorder:function () {
        return wls.ZOrder.limitPop+2
    },
    onCreate: function()
    {
        wls.BindUI(this, this);
        var go = wls.CreateMask(this.panel);
        go.setPosition(-display.width/2,-display.height/2)
        this.Node_Ani.setPosition(display.width / 2, display.height / 2);
        var action = this.getActionManager().getActionByTag(this.Node_Ani.getTag(), this.Node_Ani);
        this.action = action;
        this.setVisible(false);
        this.btn_sure.setLocalZOrder(10)
        this.txt_word_fx.setString(wls.Config.getLanguage(800000113)+":")
    },

    play: function(resp)
    {
        if (this.isUsing) { return false}
        if (this.propList != null) { this.getAllProp() }
        var isShare = (parseInt(wls.Config.getLevelDataByLV(resp.newGrade).doubleshare) == 0 ? false : true)
        this.grade = resp.newGrade
        this.propList = this.createAllProp(resp.dropProps)
        this.propList.endPos = resp.endPos
        this.propList.viewid = resp.viewid
        this.propList.isShowBox = resp.isShowBox
        this.Node_Ani.addChild(this.propList,10)
        this.fnt_level.setString(resp.newGrade)
        this.btn_share.setVisible(isShare)
        this.btn_sure.setPositionX(isShare? -140:0)
        this.deTime = isShare? 10:3
        this.playImpl()
        return true
    },

    playImpl: function()
    {
        this.find("SCSound").playEffect("lvup_01.mp3", false);
        this.isUsing = true
        var self = this
        this.setVisible(true);
        this.action.gotoFrameAndPlay(0, false);

        var tb = [
            cc.DelayTime.create(64/60),
            cc.CallFunc.create(function () {
                var list = self.propList.getChildren()
                for (var key in list) {
                    list[key].runAction(cc.Sequence.create(cc.DelayTime.create(0.1*key),cc.ScaleTo.create(0.3,1)))
                }
            }),
            cc.DelayTime.create(this.deTime),
            cc.CallFunc.create(function () {
                self.click_btn_sure()
            })
        ]
        this.stopActionByTag(101)
        var seq = cc.Sequence.create(tb)
        seq.setTag(101)
        this.runAction(seq)
    },

    click_btn_sure: function()
    {
        this.isUsing = false
        this.stopActionByTag(101)
        this.getAllProp()
        this.setVisible(false);
        this.find("SCLayerMgr").playEFEnd()
    },

    createAllProp: function(dropProps)
    {
        var des = ""
        var node = cc.Node.create()
        var dis = 130
        var leftPosX = -(dropProps.length -1)*dis/2
        for (var index = 0; index < dropProps.length; index++) {
            var element = dropProps[index];
            var itemData = wls.Config.getItemData(element.propId);
            if ( !itemData) { return false }
            var ccnode = wls.LoadStudioNode(this.fullPath("hall/packback_item.json"), this);
            wls.BindUI(ccnode, ccnode);
            node.addChild(ccnode);
            ccnode.setScale(0)
            ccnode.setPosition(leftPosX + index*dis,0)
            ccnode.propData = element
            ccnode.spr_item.loadTexture(this.fullPath("common/images/prop/"+itemData.res),1)
            var count = element.propId != 12 ? element.propCount : element.propCount/100
            ccnode.fnt_item_count.setString(element.propId != 12 ? count : count+"y")
            des = des + itemData.name + "x" + count  + (index < dropProps.length-1?",":"")
        }
        node.setPosition(0,-40)
        this.txt_share_word.setString(des)
        var allWidth = this.txt_share_word.getContentSize().width + this.txt_word_fx.getContentSize().width
        var pos = allWidth/2 - this.txt_word_fx.getContentSize().width - this.btn_share.getContentSize().width/2
        this.txt_share_word.setPositionX(-pos)
        this.txt_word_fx.setPositionX(-pos)
        return node
    },

    getAllProp: function()
    {
        if (this.propList == null) {return }
        if (this.propList.isShowBox == true) {
            //显示一元礼包
            this.find("SCLayerMgr").showLayerByName("UIYiYuanChest")
        }

        var list = this.propList.getChildren()
        for (var key in list) {
            var propData = list[key].propData
            var flyData = {
                viewid     : this.propList.viewid,
                firstPos   : wls.getWordPosByNode(list[key]),
                endPos     : this.propList.endPos,
                propData   : propData,
                isJump     : false,
                maxScale   : 1,
                refreshType: 1,
                zorder     : wls.ZOrder.Award+1
            }
            this.find("EFItems").play(flyData)
        }
        this.propList.removeFromParent()
        this.propList = null
        
    },
    getUsing: function(cnt)
    {
        return  this.isUsing
    },

    click_btn_share: function() {
        if (this.find("SCSend")) {
            this.find("SCSend").sendShareSuccess(4, this.grade)
        }
        var shareInfo = wls.GetShareInfo() || {}
        ShareHelper.doShare({text:shareInfo.text}, function(res) {
            if (res.errMsg == "shareAppMessage:ok") {
                cc.log("------------click_btn_share-------shareAppMessage:ok----------")
                //成功
                // if (this.find("SCSend")) {
                //     this.find("SCSend").sendShareSuccess(4, this.grade)
                // }
                // this.click_btn_sure()
            }
        }.bind(this))
        this.click_btn_sure()
    },

});