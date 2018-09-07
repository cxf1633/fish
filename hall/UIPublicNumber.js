/****************************************************************
 * 作者：xiaos
 * 日期：2018-07-31
 * 描述：公众号
 ****************************************************************/
 "use strict";
wls.namespace.UIPublicNumber = ccui.Layout.extend({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function() {
        wls.CreateMask(this)
        var node = wls.LoadPopupView(this.fullPath("hall/uipublicnumber.json"), this)
        node.setPosition(display.width/2, display.height/2)
        this.addChild(node)
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        node.setScale(node.getScale()*scale)

        //初始化奖励
        var rewardStr = wls.Config.getConfig("990000129")
        var rewardTab = wls.SplitArray(rewardStr)
        for (var key = 0; key < rewardTab.length; key += 2) {
            var propId = parseInt(rewardTab[key])
            var propCount = rewardTab[key+1]
            var config = wls.Config.getItemData(propId)
            if (!this["item"+(key/2+1)]) {continue}
            this["item"+(key/2+1)].initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this.fullPath("common/images/prop/"+config.res)))
            this["item"+(key/2+1)].getChildByName("fnt_num").setString(propCount)

        }
    },

    click_btn_close: function() {
        this.removeFromScene()
    },

    click_btn_copy: function() {
        if (isMiniGame()) {
            GiftDateLogic.createWeiXinCopy("wlgame3")
        } else {
            //Helper.CopyToClipboard("wlgame3")
        }
    },
})