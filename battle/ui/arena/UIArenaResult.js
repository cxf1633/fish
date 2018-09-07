//-----------------------------------------------------
// 竞技场游戏内结算界面
//-----------------------------------------------------
wls.namespace.UIArenaResult = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.GreenHand-1
    },
    onCreate: function(data)
    {
        wls.CreateMask(this)
        var ccnode = wls.LoadPopupView(this.fullPath("battle/arena/uiarenaresult.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width/2, display.height/2);
        this.initView()
        this.updateView(data)
        this.runAction(cc.Sequence.create(cc.DelayTime.create(10), cc.CallFunc.create(function(){
            this.click_btn_sure()
        }.bind(this))))
    },

    initView: function()
    {
        for (var i = 1; i < 9; i++) {
            var item = this["node_rank_"+i]
            wls.BindUI(item,item)
            item.spr_rank.setSpriteFrame(this.fullPath("battle/images/compic/rank_order_"+i+".png"))
            item.txt_score.setString(0)
            item.txt_award.setString(0)
            item.setVisible(false)
        }
    },

    updateView: function(list)
    {
        list.sort( function(a, b){ return  b.score - a.score; })
        var player = FG.GetSelfPlayer()
        for (var key = 0; key < list.length; key++) {
            var isSelf = player.playerId == list[key].playerId
            var propId = list[key].props[0] ? list[key].props[0].propId : 1
            var propCount = list[key].props[0] ? list[key].props[0].propCount : 0
            var itemData = wls.Config.getItemData(propId)
            var item = this["node_rank_"+(key+1)]
            item.txt_score.setString(list[key].score)
            item.txt_name.setString(list[key].nickName)
            item.txt_award.setString(propCount)
            item.spr_prop.setSpriteFrame(this.fullPath("common/images/prop/"+itemData.res))
            item.setVisible(true)
            if (!(isSelf || false)) { continue }
            item.img_bg.loadTexture(this.fullPath("battle/images/compic/result_bg_3.png"),1)
            this.spr_title_rank.setSpriteFrame(this.fullPath("battle/images/compic/result_title_rank_"+(key+1)+".png"))
        }
    },   

    click_btn_sure: function()
    {
        this.getScene().leaveRoom()
    },


});