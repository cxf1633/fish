/****************************************************************
 * 作者：xiaos
 * 日期：2018-08-10
 * 描述：8人免费赛等待界面
 ****************************************************************/
wls.namespace.UIFreeMasterQueue = cc.Node.extend({

    getZorder: function () {
        return wls.ZOrder.Pop
    },

    onCreate: function(config) {
        wls.CreateMask(this)
        var node = wls.LoadStudioNode(this.fullPath("hall/uifreematchqueue.json"), this)
        node.setPosition(display.width/2, display.height/2)
        this.addChild(node)
        this.img_item_demo.setVisible(false)
        this.addItems(config.reward)
        this.playWaiting()
        this.refresh(1)
    },

    refresh: function(num) {
        this.fnt_queue_num.setString(num)
    },

    playWaiting: function() {
        var desc = "报名满8人，即可开始比赛！敬请期待"
        var times = 0
        var temp = desc
        this.text_desc.setString(desc)
        this.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(1), cc.CallFunc.create(function(){
            times = times % 4
            temp = times == 3 ? desc : (temp+".")
            times++
            this.text_desc.setString(temp)
        }.bind(this)))))
    },

    addItems: function(reward) {
        var giftList = reward.split(";")
        for (var key = 0; key < giftList.length; key+=3) {
            var rank = giftList[key]
            var propId = giftList[key+1]
            var propCount = giftList[key+2]
            var item = this.createItem(rank, propId, propCount)
            this.listview_items.pushBackCustomItem(item)
        }
    },

    createItem: function(rank, propId, propCount) {
        var itemData = wls.Config.getItemData(parseInt(propId))
        var item = this.img_item_demo.clone()
        var img_icon = item.getChildByName("img_icon")
        var img_rank = item.getChildByName("img_rank")
        var fnt_num = item.getChildByName("fnt_num")
        img_icon.loadTexture(this.fullPath("common/images/prop/"+itemData.res), 1)
        img_rank.loadTexture(this.fullPath("hall/images/hall_jjc/arena_rank_"+rank+".png"), 1)
        fnt_num.setString("x"+propCount)
        item.setVisible(true)
        return item
    },

    click_btn_close: function() {
        this.removeFromScene()
    }
})