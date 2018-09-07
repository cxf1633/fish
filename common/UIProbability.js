/****************************************************************
 * 作者：xiaos
 * 日期：2018-07-27
 * 描述：抽奖概率
 ****************************************************************/

wls.namespace.UIProbability = ccui.Layout.extend({
    getZorder:function () {
        return wls.ZOrder.Pop+2
    },
    onCreate: function(data) {
        var mask = wls.CreateMask(this, 0, true)
        var node = wls.LoadStudioNode(this.fullPath("common/ui/uiLotteryProbability.json"), this)
        node.setPosition(display.width/2, display.height/2)
        this.addChild(node)
        this.panel.setAnchorPoint(cc.p(0, 1))
        this.panel.setSwallowTouches(true);
        this.listview.setSwallowTouches(true);
        wls.OnClicked(mask, this, "btn_close")

        for (var key = 0; key < data.length; key++) {
            this.addItem(data[key].name, data[key].num, data[key].probability)
        }
    },

    setPanelPosByNode: function(node) {
        var worldPos = node.getParent().convertToWorldSpace(node.getPosition())
        var isOnUp = (worldPos.y >= display.height/2)
        var isOnRight = (worldPos.x >= display.width/2)
        this.panel.setAnchorPoint(cc.p(isOnRight?1:0, isOnUp?1:0))
        var localPos = this.panel.getParent().convertToNodeSpace(worldPos)
        this.panel.setPosition(localPos)
    },

    addItem: function(name, num, probability) {
        var layout = ccui.Layout.create()
        layout.setContentSize(250, 25)
        layout.setBackGroundColor(cc.c3b(0, 0, 0))
        layout.setBackGroundColorOpacity(0)
        layout.setBackGroundColorType(1)
        layout.setTouchEnabled(false)

        //
        var nameLabel = cc.LabelTTF.create(name, "Arial", 20)
        nameLabel.setAnchorPoint(cc.p(0, 0.5))
        nameLabel.setPosition(11.5, 12.5)
        nameLabel.setColor(cc.c3b(102, 167, 185))
        layout.addChild(nameLabel)

        //
        var numLabel = cc.LabelTTF.create(num == 1 ? "" : ("x"+num.toString()), "Arial", 20)
        numLabel.setAnchorPoint(cc.p(0, 0.5))
        numLabel.setPosition(nameLabel.getPositionX()+nameLabel.getContentSize().width, 12.5)
        numLabel.setColor(cc.c3b(102, 167, 185))
        layout.addChild(numLabel)

        //
        var probabilityLabel = cc.LabelTTF.create(probability, "Arial", 20)
        probabilityLabel.setPosition(213.83, 12.5)
        probabilityLabel.setColor(cc.c3b(153, 175, 189))
        layout.addChild(probabilityLabel)

        this.listview.insertCustomItem(layout,0)
    },

    click_btn_close: function() {
        this.removeFromScene()
    },
})