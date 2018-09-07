/****************************************************************
* 作者：xiaos
* 日期：2018-08-13
* 描述：竞技场排名
****************************************************************/
"use strict";
wls.namespace.UIMatchRank = cc.Node.extend({
    getZorder:function () {
        return wls.ZOrder.Pop +2
    },
    onCreate: function(info) {
        wls.CreateMask(this)
        var node = wls.LoadPopupView(this.fullPath("hall/uimatchrank.json"), this)
        node.setPosition(display.width/2, display.height/2)
        this.addChild(node)
        this.adaptClose(this.btn_close)
    },

    onActive: function(info) {
        this.refresh(info)
    },

    refresh: function(info) {
        this.listview_items.removeAllItems()
        this.img_item_demo.setVisible(false)
        this.addItems(info.list)
        info.rank = (info.rank && info.rank > 0) ? info.rank:"--"
        this.text_desc.setString("排行:"+(info.rank))
        info.maxScore = (info.maxScore && info.maxScore > 0) ? info.maxScore:"--"
        this.fnt_max_score.setString(info.maxScore)
    },

    addItems: function(rank) {
        for (var key = 0; key < rank.length; key++) {
            var item = this.createItem(rank[key])
            this.listview_items.pushBackCustomItem(item)
        }
    },

    createItem: function(info) {
        var item = this.img_item_demo.clone()
        var rank = info.rank || 1
        var name = info.name || "微乐捕鱼大暴击"
        var score = info.score || 1
        var propId = info.prop ? info.prop.propId : 1
        var propCount = info.prop ? info.prop.propCount : 1
        var itemData = wls.Config.getItemData(propId)
        wls.BindUI(item, item)
        item.setSwallowTouches(false)
        item.img_rank.setVisible(rank <= 3)
        item.text_rank.setVisible(rank > 3)
        item.text_rank.setString(rank)
        item.img_rank.loadTexture(this.fullPath("hall/images/hall_jjc/arena_rank_"+(rank <= 3 ? rank : 3)+".png"), 1)
        item.text_name.setString(name)
        item.fnt_rank_score.setString(score)
        item.img_prop_icon.loadTexture(this.fullPath("common/images/prop/"+itemData.res), 1)
        item.fnt_prop_num.setString(propCount)
        item.setVisible(true)
        return item
    },

    click_btn_close: function() {
        this.setVisible(false)
    }
})