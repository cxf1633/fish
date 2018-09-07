"use strict";
// 背包界面
wls.namespace.UIBag = ccui.Layout.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("hall/packback_panel.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        ccnode.setScale(ccnode.getScale()*scale)
        this.adaptClose(this.btn_close)
        this.wrapGameObject(this.node_info, "WNBagItemInfo");
        this.initScrollView();
        this.spr_chooseframe.setLocalZOrder(10000);
        this.spr_chooseframe.setName("spr_chooseframe")
        var item = this.scroll_bag_list.getChildByTag(101);
        if (item)
        {
            this.onSelectItem(item);
        }
    },
    onActive: function () {
        this.initScrollView()
    },
    onEventPlayerDataModified: function () {
        this.initScrollView();
    },

    initScrollView: function()
    {
        var itemList = []
        var list = this.scroll_bag_list.getChildren()
        for (var key in list) {
            if (list[key].getName() != "spr_chooseframe") {
                //list[key].removeFromParent()
                itemList.push(list[key])
                list[key].setVisible(false)
            }
        }
        var props = this.find("DAPlayer").getDisplayProps();
        var col = 4;
        var row = Math.ceil(props.length / 4);
        row = row < 4 ? 4 : row;
        var idx = 0;
        var size = this.scroll_bag_list.getContentSize();
        size.height = 540
        size.width /= 4;
        size.height /= 4;
        this.scroll_bag_list.setInnerContainerSize(cc.size(size.width * col, size.height * row));
        var x = size.width / 2;
        var y = size.height * row - size.height / 2;
        for (var r = 0; r < row; r++)
        {
            x = size.width / 2;
            for (var c = 0; c < col; c++)
            {
                var item = null
                if (itemList[idx]) {
                    item = itemList[idx]
                } else {
                    item = this.createItem(props[idx]);
                    this.scroll_bag_list.addChild(item, 0, idx + 101);
                }
                item.setVisible(true)
                item.setPosition(x, y);
                item.updateItem(props[idx]);
                if (c == 0 && r == 0) {
                    this.click_item(item.panel)
                }
                item.panel.setTouchEnabled(true);
                wls.OnClicked(item.panel, this, "item");
                idx++;
                x += size.width;
            }
            y -= size.height;
        }
    },

    click_item: function(sender)
    {
        this.onSelectItem(sender.item);
    },

    onSelectItem: function(item)
    {
        cc.log(item.data);
        if (!item.data) return;
        this.showSelectedAni(item);
        this.find("WNBagItemInfo").updateData(item.data);
    },

    showSelectedAni: function(item)
    {
        var act = cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.05, 1));
        this.spr_chooseframe.stopAllActions();
        this.spr_chooseframe.setVisible(true);
        this.spr_chooseframe.setPosition(item.getPosition());
        this.spr_chooseframe.runAction(act);
    },

    click_btn_close: function()
    {
        this.setVisible(false)
        //this.removeFromParent()
    },

    createItem: function()
    {
        var item = wls.LoadStudioLayout(this.fullPath("hall/packback_item.json"));
        wls.BindUI(item, item);
        var self = this;
        item.updateItem = function(data)
        {
            this.data = data;
            this.panel.item = this;
            if (data == null)
            {
                this.fnt_item_count.setVisible(false);
                this.spr_item.setVisible(false);
            }
            else
            {
                this.spr_item.setVisible(true);
                this.fnt_item_count.setString(data.propId == 12 ? (data.propCount / 100) + "y" : data.propCount);
                var filename = self.fullPath("common/images/prop/" + data.config.res);
                this.spr_item.loadTexture(filename, 1);
            }
        };
        return item;
    },

    //处理分解
    onDecomposeResult: function (resp) {
        if (!resp.isSuccess) {
            this.dialog(1, wls.Config.getLanguage(800000321));
        }
        var curProp = this.find("WNBagItemInfo").item.data
        var addCount = resp.newCrystalPower - this.find("DAPlayer").getPropAmount(11)

        this.getScene().addProps([{propId:curProp.propId,propCount:-curProp.config.num_decompose}]) 
        this.getScene().addProps([{propId:11,propCount:addCount}])
        this.dialog(1, wls.format(wls.Config.getLanguage(800000207),"%s",[addCount]));
    },

    //处理购买
    OnBuyProp:function (resp) {
        if (!resp.isSuccess) {
            this.dialog(1, wls.Config.getLanguage(800000321));
        }

        var buyData = wls.Config.getItemData(resp.propId)
        var costPropId =buyData.buyPropId
        var addCount = resp.propCount - this.find("DAPlayer").getPropAmount(resp.propId)
        var costPropCount =buyData.buyPropCount*addCount
        
        this.getScene().addProps([{propId:buyData.buyPropId,propCount:-costPropCount}])     
        this.getScene().addProps([{propId:resp.propId,propCount:addCount}])     
        this.toast(wls.Config.getLanguage(800000154))
    },

    //出售
    OnSellItem:function (resp) {
        if (resp.errorCode != 0) {
            this.dialog(1, wls.Config.getLanguage(800000321));
            return 
        }
        this.getScene().addProps([{propId:resp.propId,propItemId:(resp.propItemId == 0?null:resp.propItemId),propCount:-resp.count}])     

        var flyData = {
            viewid  : 0,
            propData: {propId:resp.dropPropId,propCount:resp.dropPropCount},
            firstPos: cc.p(display.width/2,display.height/2),
            zorder  : wls.ZOrder.Pop + 10
        }
        this.find("EFItems").play(flyData);

        //this.toast(wls.Config.getLanguage(800000154))
        if (this.find("UIBagSell")) {
            this.find("UIBagSell").click_btn_close()
        }
    },
});

// 背包左边道具信息界面
wls.namespace.WNBagItemInfo = wls.WrapNode.extend
({
    onCreate: function()
    {
        wls.BindUI(this, this);
        var self = this;
        self.btn_buy.setVisible(false)
        self.btn_sell.setVisible(false)
        self.btn_send.setVisible(false)
        self.btn_resolve.setVisible(false)
        self.btn_exchange.setVisible(false)
        self.btn_taste.setVisible(false)
        self.node_timelimit.setVisible(false)
        self.node_type_2.setVisible(false)
        self.node_type_3.setVisible(false)
        var item = this.find("UIBag").createItem();
        item.setScale(1.3)
        this.node_curitem.addChild(item);
        this.item = item;

        this.text_buy_notice.setString(wls.Config.getLanguage(800000279))
        

    },

    updateData: function(data)
    {
        this.buyRate = 1
        this.item.updateItem(data);
        this.text_title.setString(data.config.name);
        this.text_describe.setString(data.config.pack_text);
        this.updateBtnData()
    },

    updateBtnData: function()
    {
        var data = this.item.data
        var config = this.item.data.config
        //更新一级按键
        //判断是否高级道具使用中
        if (data.propItemId != null && config.taste_time > 0) {
            this.txt_endtime.setString(data.stringProp)
        }

        this.node1BtnArr = []
        var self = this
        var setOneLVBtnState = function (btn,isAdd) {
            if (isAdd) {
                btn.setVisible(true)
                self.node1BtnArr.push(btn)
            } else {
                btn.setVisible(false)
            }
        }

        setOneLVBtnState(this.btn_sell,config.sellPropCount > 0)
        setOneLVBtnState(this.btn_send,config.allow_send == 1)
        setOneLVBtnState(this.btn_buy,config.if_showbuy == 1)
        setOneLVBtnState(this.btn_resolve,config.decomposable == 1)
        setOneLVBtnState(this.btn_exchange,config.allow_exchange == 1)
        setOneLVBtnState(this.btn_taste,config.if_taste == 1)

        if (data.stringProp != null && data.stringProp != "") {
            this.setBtnType(4)
            return
        }

        this.setBtnType(1)

    },

    setBtnType: function(itemType)
    {
        this.node_type_1.setVisible(false)
        this.node_type_2.setVisible(false)
        this.node_type_3.setVisible(false)
        this.node_timelimit.setVisible(false)

        if (itemType == 0) {
            this.node_type_1.setVisible(true)
            for (var i = 0; i < this.node1BtnArr.length; i++) {
                this.node1BtnArr[i].setVisible(false)
            }
            this.node_timelimit.setVisible(false)
        } else if (itemType == 1) {
            var dis = 176
            this.node_type_1.setVisible(true)
            var leftPos = -(this.node1BtnArr.length - 1)*dis/2
            for (var i = 0; i < this.node1BtnArr.length; i++) {
                var element = this.node1BtnArr[i];
                element.setPositionX(leftPos + i*dis)
            }
        } else if (itemType == 2) {
            var config = this.item.data.config
            this.node_type_2.setVisible(true)
            var unit = wls.Config.getItemData(config.buyPropId).name
            var buyCount = config.num_perbuy*this.buyRate
            if (buyCount*config.buyPropCount > this.find("DAPlayer").getPropAmount(config.buyPropId) ) {
                this.buyRate = this.buyRate -1
                if (this.buyRate < 1) { this.buyRate = 1}
                buyCount = config.num_perbuy*this.buyRate
            }
            this.text_buy_count.setString(buyCount)
            var allPriceStr = wls.Config.getLanguage(800000280)+":"+ buyCount*config.buyPropCount+unit
            this.text_buy_allprice.setString(allPriceStr)
            var price_count = wls.Config.getLanguage(800000281)+"/"+wls.Config.getLanguage(800000282)+wls.Config.getLanguage(800000218)+config.buyPropCount+unit+"/"+config.num_perbuy
            this.text_buy_price_count.setString(price_count)
        }else if (itemType == 3) {
            this.node_type_3.setVisible(true)
        }else if (itemType == 4) {
            this.node_type_1.setVisible(true)
            for (var i = 0; i < this.node1BtnArr.length; i++) {
                this.node1BtnArr[i].setVisible(false)
            }
            this.node_timelimit.setVisible(true)

        }
    },

    click_btn_resolve: function()
    {
        if (this.item.data.config.num_decompose > this.find("DAPlayer").getPropAmount(this.item.data.propId)) {
            this.dialog(1, wls.Config.getLanguage(800000206));
            return 
        }
        this.sendMsg("sendDecomposeReq",this.item.data.propId)
    },


    //购买按键
    click_btn_buy: function()
    {
        this.setBtnType(2)
    },
    click_btn_buy_minus: function()
    {
        if (this.buyRate == 1) { return }
        this.buyRate = this.buyRate -1
        this.setBtnType(2)
    },
    click_btn_buy_add: function()
    {
        this.buyRate = this.buyRate +1
        this.setBtnType(2)
    },
    click_btn_surebuy: function()
    {
        var self = this 
        var config = this.item.data.config
        //判断vip
        if (this.find("DAPlayer").getVipLevel() < config.require_vip ) {
            this.dialog(3,wls.Config.getLanguage(800000111) + config.require_vip + wls.Config.getLanguage(800000112),function name(ret) {
                if (ret == 2) return;
                self.find("UIBag").click_btn_close()
                self.activeGameObject("UIShop", config.buyPropId);
            })
            return 
        }
        
        var buyCount = config.num_perbuy*this.buyRate
        if (buyCount*config.buyPropCount > this.find("DAPlayer").getPropAmount(config.buyPropId) ) {

            var str = ""
            if (FISH_DISABLE_CHARGE) {
                str = wls.Config.getLanguage(config.buyPropId == 1?800000465:800000464)
                this.dialog(1,str) 
                return
            }
            str = wls.Config.getLanguage(config.buyPropId == 1?800000129:800000093)
            this.dialog(3,str,function name(ret) {
                if (ret == 2) return;
                self.find("UIBag").click_btn_close()
                self.activeGameObject("UIShop", config.buyPropId);
            })  
            return
        }
        this.sendMsg("sendBuy",this.item.data.propId,this.buyRate)
    },

    click_btn_exchange: function()
    {
        if (this.item.data.propId == 12) {
            this.pushView("UIPhoneChargesExc")
            this.find("UIBag").click_btn_close()
        }
    },

    click_btn_sell: function()
    {
        this.pushView("UIBagSell",this.item.data)
        //this.find("UIBag").click_btn_close()
    },
    


});



// 背包出售界面
wls.namespace.UIBagSell = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop + 2
    },
    onCreate: function(data)
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("hall/packback_sell.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        ccnode.setScale(ccnode.getScale()*scale)

        this.initProp(data)
        this.sellCount = 1
        this.propCount = 0
        this.updateSellCount()
    },
    initProp: function (data) {
        if (this.config && this.config.id == data.config.id) { return }
        this.config = data.config
        this.propId = data.propId
        this.propItemId = data.propItemId
        this.spr_prop.setSpriteFrame(this.fullPath("common/images/prop/"+this.config.res))
        this.spr_price.setString(this.config.sellPropCount)
        this.txt_name.setString(this.config.name)

        var sellProp = wls.Config.getItemData(this.config.sellPropId)
        this.spr_cell.setSpriteFrame(this.fullPath("common/images/prop/"+sellProp.res))
    
    },
    onActive: function (data) {
        this.initProp(data)
        this.onEventPlayerDataModified()
    },

    onEventPlayerDataModified: function () {
        this.propCount = this.find("DAPlayer").getPropAmount(this.propId)
        this.sellCount = 1
        this.updateSellCount()
    },
    
    updateSellCount: function()
    {
        this.text_sell_count.setString(this.sellCount*this.config.num_perbuy)
    },

    click_btn_close: function()
    {
        this.setVisible(false)
    },

    click_btn_sell_minus: function()
    {
        if (this.sellCount <= 1) { return  }
        this.sellCount = this.sellCount - 1
        this.updateSellCount()
    },

    click_btn_sell_add: function()
    {
        if (this.propCount < (this.sellCount + 1)*this.config.num_perbuy) { return }
        this.sellCount = this.sellCount + 1
        this.updateSellCount()
    },

    click_btn_sure: function()
    {
        if (this.propCount < this.config.num_perbuy) {
            this.toast(wls.Config.getLanguage(800000317))
            return 
        }
        this.sendMsg("sendSellItem",this.propId,this.sellCount*this.config.num_perbuy,this.propItemId)
    },

});
