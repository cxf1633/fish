// 奖池说明
wls.namespace.UIBonusPoolDes = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadStudioNode(this.fullPath("battle/lottery/uibonuspooldes.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        this.adaptClose(this.btn_close)
        this.txt_award_limit.setString(wls.Config.get("config",990000137).data)
        var des = wls.Config.getLanguage(800000479)
        des = des.replace(/[\\]n/g, '\n')
        this.txt_des.setString(wls.format(des,"%s",[wls.roomData.name]))
        this.unitFront = wls.Config.getLanguage(800000005)
        this.unit = wls.Config.getItemData(1).name

        this.topPos = 70
        this.itemDis = 28
        this.posX = this.panel_list.getContentSize().width/2
        this.itemList = []
        for (var i = 1; i < 5; i++) {
            var item = this["node_award_"+i]
            if (item) {
                wls.BindUI(item, item);
                this.itemList.push(item)
            }
        }

        this.updateItemPos()
    },
    updateItemPos: function()
    {
        for (var i = 0; i < 4; i++) {
            this.itemList[i].setPositionY(this.topPos - i*this.itemDis)
        }
    },

    onActive: function()
    {
        if (this.find("DALottery")) {
            this.setPoolNum(this.find("DALottery").getPoolNum())
        }
        this.startCheck()
    },

    click_btn_close: function()
    {
        this.setVisible(false);
        this.stopCheck()
    },

    setPoolNum: function(val)
    {
        this.fnt_pool.setString(val)
    },

    initViewData: function()
    {
        var list = this.find("DALottery").getPoolReward()
        for (var i = 0; i < 4; i++) {
            var item = this.itemList[i]
            if (list[i] == null) {
                item.setVisible(false)
                continue
            }
            item.setVisible(true)
            item.stopAllActions()
            item.txt_name.setString(list[i].nickName)
            item.txt_award.setString(this.unitFront+list[i].money+this.unit)
            item.txt_time.setString(list[i].time)
            item.desData = list[i]
        }
        this.updateItemPos()
    },

    startCheck: function()
    {
        this.stopCheck()
        var self = this 
        var seq = cc.Sequence.create(cc.DelayTime.create(1.5),cc.CallFunc.create(function () {
            self.check()
        }))
        var rep = cc.RepeatForever.create(seq)
        rep.setTag(101)
        this.runAction(rep)
    },
    stopCheck: function()
    {
        this.stopActionByTag(101)
        this.initViewData()
    },
    check: function()
    {
        var list = this.find("DALottery").getPoolReward()
        this.initViewData()
        if (list.length <= 3) { return }
        this.find("DALottery").delPoolReward()

        for (var i = 0; i < 4; i++) {
            var item = this.itemList[i]
            var aimPos = cc.p(this.posX,this.topPos + this.itemDis*(1 -i))
            item.stopAllActions()
            item.runAction(cc.MoveTo.create(0.3,aimPos))
        }
    },


});