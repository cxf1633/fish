//-----------------------------------------------------
// 8人免费场游戏内排行榜
//-----------------------------------------------------
wls.namespace.UIArenaRank = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Normal
    },
    onCreate: function()
    {
        var ccnode = wls.LoadPopupView(this.fullPath("battle/arena/uiarenarank.json"), this);
        this.addChild(ccnode);
        this.sizeBg = this.img_bg.getContentSize()
        ccnode.setPosition(wls.OffsetX, display.height/2);
        this.myRank = 8
        this.initView()
        
    },
    initView: function()
    {
        for (var i = 1; i < 9; i++) {
            var item = this["node_rank_"+i]
            wls.BindUI(item,item)
            item.spr_rank.setSpriteFrame(this.fullPath("battle/images/compic/rank_order_"+i+".png"))
            item.txt_score.setString(0)
            item.spr_arrow.setVisible(false)
        }
    },

    updateView: function(rankData)
    {
        rankData = rankData || []
        var list = []
        var player = FG.GetSelfPlayer()
        for (var key = 0; key < rankData.length; key++) {
            var data = {}
            data.idx = key+1
            data.bulletCount = rankData[key].bulletCount
            data.score = rankData[key].score
            data.state = rankData[key].bulletCount <= 0 ? 0 : 1 //0用光子弹 1.有子弹 2.上升 3. 下降 4.不变
            data.isSelf = rankData[key].playerId == player.playerId
            if (data.isSelf) {
                if (this.myRank > data.idx) {
                    data.state = 2
                } else if (this.myRank < data.idx) {
                    data.state = 3
                } else {
                    data.state = 4
                }
                this.myRank = data.idx
            }
            list.push(data)
        }
        this.updateShowByList(list)
    },


    updateShowByList: function(list)
    {
        for (var i = 1; i < 9; i++) {
            var data = list[i-1] || {};
            var item = this["node_rank_"+i]
            item.txt_score.setString(data.score || 0)
            item.spr_arrow.setVisible(data.bulletCount <= 0 && !data.isSelf)
            if (data.state != 4) {
                item.spr_arrow_up.setVisible(data.state && (data.state == 2))
                item.spr_arrow_down.setVisible(data.state && (data.state == 3))
            }
            if (data.isSelf || this.myRank==i) {
                this.img_red_bg.setPositionY(item.getPositionY())
            }

        }
    },


});