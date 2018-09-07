// 商店界面
wls.namespace.UIShop = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("hall/uishop.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2+35, display.height / 2);
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        ccnode.setScale(ccnode.getScale()*scale)
        this.adaptClose(this.btn_close)

        this.SHOP_COIN = 1;
        this.SHOP_CRYSTAL = 2;
        this.SHOP_CANNON = 6;

        this.scroll_shop_fishcoin.setVisible(false)
        this.scroll_shop_crystal.setVisible(false)
        this.scroll_shop_cannon.setVisible(false)

        //先隐藏炮台
        this.btn_crystal.setPositionY(this.btn_crystal.getPositionY()-60);
        this.btn_fishcoin.setPositionY(this.btn_fishcoin.getPositionY()-60);
        this.btn_cannon.setVisible(false);

        this.initData();
        this.upDataLayer();
    },

    onActive: function(idx)
    {
        this.idx = idx || this.SHOP_COIN;
        this.removeAllItems();
        this.updateSwitchBtns(this.idx);
        this.initScrollView();
    },

    checkList: function(idx) {
        if ((idx == this.SHOP_COIN && this.scroll_shop_fishcoin.getChildren().length == 0)
            || (idx == this.SHOP_CRYSTAL && this.scroll_shop_crystal.getChildren().length == 0)
            || (idx == this.SHOP_CANNON && this.scroll_shop_cannon.getChildren().length == 0))
        {
            return true
        }
        return false
    },

    updateListData: function () {
        this.showAllItems()
        var player = this.find("DAPlayer")
        if (player.getMonthCardState().state != 0) {
            this.hideItemById(830000015)
        }

        if (player.getMaxGunRate() < 1000) {
            this.hideItemById(830001026)
            this.hideItemById(830001027)
            this.hideItemById(830001028)
        } else if (player.getMaxGunRate() >= 1000 && player.getMaxGunRate() < 2000) {
            this.hideItemById(830001028)
        }
    },

    removeAllItems: function () {
        var items = this.scroll_shop_fishcoin.getChildren();
        for (var i = items.length - 1; i > -1; i--){
            items[i].removeFromParent(true);
        }
        items = this.scroll_shop_crystal.getChildren();
        for (var i = items.length - 1; i > -1; i--){
            items[i].removeFromParent(true);
        }
        items = this.scroll_shop_cannon.getChildren();
        for (var i = items.length - 1; i > -1; i--){
            items[i].removeFromParent(true);
        }
    },

    showAllItems: function () {
        for (var i = 0; i < this.listFishCoin.length; i++) {
                this.listFishCoin[i].isShow = true;
        }
        for (var i = 0; i < this.listCrystal.length; i++) {
                this.listCrystal[i].isShow = true;
        }
        for (var i = 0; i < this.listCannon.length; i++) {
                this.listCannon[i].isShow = true;
        }
    },

    hideItemById: function (id) {
        for (var i = 0; i < this.listFishCoin.length; i++) {
            if (this.listFishCoin[i].id == id) {
                this.listFishCoin[i].isShow = false;
                break
            }
        }
        for (var i = 0; i < this.listCrystal.length; i++) {
            if (this.listCrystal[i].id == id) {
                this.listCrystal[i].isShow = false;
                break
            }
        }
        for (var i = 0; i < this.listCannon.length; i++) {
            if (this.listCannon[i].id == id) {
                this.listCannon[i].isShow = false;
                break
            }
        }
    },

    initData: function()
    {
        this.listAll = [];
        this.listFishCoin = [];
        this.listCrystal = [];
        this.listCannon = [];
        var self = this;
        var callback = function(ret)
        {
            var list = self["listAll"]
            if (list)
            {
                list.push(ret);
            }
        };
        wls.Config.ForEachNew("recharge", callback);

        for (var index = 0; index < this.listAll.length; index++) 
        {
            var element = this.listAll[index];
            if (element.recharge_order == null || element.recharge_order < 0) {continue;}
            
            if (element.recharge_type == 1) 
            {
                this.listFishCoin.push(element);
            } 
            else if (element.recharge_type == 2) 
            {
                this.listCrystal.push(element);
            }
            else if (element.recharge_type == 6) 
            {
                this.listCannon.push(element);
            }
            else//将除了鱼币水晶外的道具加入这2个列表中
            {
                this.listFishCoin.push(element);
                this.listCrystal.push(element);
            }
        }
    },

    upDataLayer: function()
    {
        var data = this.find("DAPlayer").getVipData();
        var vipLv = data.vip_level;
        var perStr = "" + data.has_cost + "/" + data.lvlup_need;
        this.costMoney = 0;

        if(data.lvlup_need <= 0)
        {
            this.spr_maxvip.setVisible(true);
            this.node_vipdata.setVisible(false);
        }
        else
        {
            this.spr_maxvip.setVisible(false);
            this.node_vipdata.setVisible(true);

            this.fnt_vip_curnum.setString(vipLv);
            this.fnt_vip_aimnum.setString(vipLv+1);
            this.bar_vip.setPercent(data.percent);

            var needMoney = (data.lvlup_need - data.has_cost)/100;
            //再冲500元，可升级到vip7
            var str = wls.Config.getLanguage(800000096) + needMoney + wls.Config.getLanguage(800000097) + "VIP" + (vipLv+1);
            this.text_word.setString(str);
        }
    },

    // 页面按钮
    updateSwitchBtns: function(showType)
    {
        if (showType == 1) 
        {
            this.btn_crystal.setEnabled(true);
            this.btn_fishcoin.setEnabled(false);
            this.btn_cannon.setEnabled(true);

            this.scroll_shop_fishcoin.setVisible(true);
            this.scroll_shop_crystal.setVisible(false);
            this.scroll_shop_cannon.setVisible(false);

            this.scroll_shop_fishcoin.jumpToLeft()
        } 
        else if (showType == 2) 
        {
            this.btn_crystal.setEnabled(false);
            this.btn_fishcoin.setEnabled(true);
            this.btn_cannon.setEnabled(true);
    
            this.scroll_shop_fishcoin.setVisible(false);
            this.scroll_shop_crystal.setVisible(true);
            this.scroll_shop_cannon.setVisible(false);
    
            this.scroll_shop_crystal.jumpToLeft()
        }
        else if (showType == 6) 
        {
            this.btn_crystal.setEnabled(true);
            this.btn_fishcoin.setEnabled(true);
            this.btn_cannon.setEnabled(false);
    
            this.scroll_shop_fishcoin.setVisible(false);
            this.scroll_shop_crystal.setVisible(false);
            this.scroll_shop_cannon.setVisible(true);
    
            this.scroll_shop_cannon.jumpToLeft()
        }
    },

    getCurListData: function() {
        switch (this.idx) {
            case this.SHOP_COIN:
                return this.listFishCoin;
            case this.SHOP_CRYSTAL:
                return this.listCrystal;
            case this.SHOP_CANNON:
                return this.listCannon;
        }
        return null
    },

    getCurListView: function() {
        switch (this.idx) {
            case this.SHOP_COIN:
                return this.scroll_shop_fishcoin;
            case this.SHOP_CRYSTAL:
                return this.scroll_shop_crystal;
            case this.SHOP_CANNON:
                return this.scroll_shop_cannon;
        }
        return null
    },

    initScrollView: function() 
    {
        var itemList = this.getCurListData()
        var listView = this.getCurListView()
        if (itemList == null || listView == null) {
            return
        }

        //--todo 获取炮倍
        var maxGunRate = this.find("DAPlayer").getMaxGunRate();
        if (maxGunRate >= 1000) 
        {
            itemList.sort(function(a, b){return b.thousands_order - a.thousands_order;});
        }
        else
        {
            itemList.sort(function(a, b){return b.recharge_order - a.recharge_order;});
        }

        this.updateListData()

        listView.setInnerContainerSize(cc.size(listView.getContentSize().width, listView.getContentSize().height));

        var firstItem = this.createItem();
        this.index = 0;
        this.beginX = 0;
        this.itemSize = cc.size(firstItem.getChildByName("panel").getContentSize().width, firstItem.getChildByName("panel").getContentSize().height);
        this.intervalW = (listView.getContentSize().height - this.itemSize.height)/2;
        var pos = cc.p(this.intervalW*2 + this.itemSize.width/2, this.itemSize.height/2);
        for (var index = 0; index < itemList.length; index++) {
            var item = itemList[index]
            if (item.isShow) {
                this.setItemData(firstItem, item)
                firstItem.setPosition(pos);
                listView.addChild(firstItem);
                this.beginX = firstItem.getPositionX();
                this.index = index
                break
            }
        }
        this.index++
        this.count = 1
        this.startTimer("loadItem", 0.05, 201, -1);
        this.stopTimer(200);
    },

    loadItem: function() {
        var itemList = this.getCurListData()
        var listView = this.getCurListView()
        if (itemList == null || listView == null) {
            return
        }

        var pos = cc.p(0,0)
        for (;this.index < itemList.length; this.index++) {
            var data = itemList[this.index]
            if (data.isShow) {
                pos = cc.p(this.beginX + this.count*this.itemSize.width + this.intervalW, this.itemSize.height/2);
                var item = this.createItem();
                item.setPosition(pos);
                this.setItemData(item, data)
                listView.addChild(item);
                this.count++
                break
            }
        }

        this.index++
        if (this.index >= itemList.length) {
            this.stopTimer(201);
            listView.setInnerContainerSize(cc.size(pos.x+this.itemSize.width/2+this.intervalW*2, listView.getContentSize().height));
            return
        }
    },

    createItem: function()
    {
        var item = wls.LoadStudioLayout(this.fullPath("hall/uishopitem.json"));
        wls.BindUI(item, item);
        wls.OnClicked(item.btn_buy, this, "item");
        item.btn_buy.item = item;
        return item;
    },

    setItemData: function(item, valTab)
    {
        item.id = valTab.id;
        item.recharge_name = valTab.recharge_name;
        item.recharge_order = valTab.recharge_order;
        item.thousands_order = valTab.thousands_order;
        var recharge_type = valTab.recharge_type;
        var recharge = valTab.recharge;
        var gift_num = valTab.gift_num;
        var recharge_method = valTab.recharge_method;
        var frist_change_enable = valTab.frist_change_enable;

        //得到货币数值
        item.recharge_num = valTab.recharge_num;
        //商城IOCN资源
        if (valTab.recharge_res != null && valTab.recharge_res.length > 0) 
        {
            item.spr_shop_item.setSpriteFrame(this.fullPath("hall/images/shop/"+valTab.recharge_res));
        }

        this.setType(item, recharge_type);
        this.setPrice(item, recharge);
        this.setIsRecharge(item, frist_change_enable);
        this.setExtraCharges(item, gift_num);
        this.setGoodsName(item, item.recharge_name);
    },

    //类型  鱼币 水晶
    setType: function(item, recharge_type)
    {
        item.recharge_type = recharge_type;
        if (recharge_type == 1) 
        {
            item.unit = wls.Config.getLanguage(800000098);
        } 
        else if (recharge_type == 2) 
        {
            item.unit = wls.Config.getLanguage(800000099);
        }
        else if (recharge_type == 3) 
        {
            item.unit = wls.Config.getLanguage(800000375);
        }
        else if (recharge_type == 4) 
        {
            item.unit = wls.Config.getLanguage(800000376);
        }
        else if (recharge_type == 5) 
        {
            item.unit = "锻造宝箱";
        }
    },

    //充值额度
    setPrice: function(item, recharge)
    {
        item.recharge = recharge;
        item.fnt_price.setString("r"+(recharge/100)+".00");
    },

    //是否首充，或者充值过了
    setIsRecharge: function(item, isRecharge)
    {
        item.isRecharge = isRecharge;
    },

    //额外赠送
    setExtraCharges: function(item, gift_num)
    {
        item.gift_num = gift_num;
        var str = null;
        if (item.isRecharge == 1) 
        {
            str = wls.Config.getLanguage(800000100);
        } 
        else 
        {
            if (item.gift_num == 0) 
            {
                str = "";
            } 
            else 
            {
                str = wls.Config.getLanguage(800000101) + gift_num + item.unit;
            }
        }

        if (item.recharge_type == 3) 
        {
            str = wls.Config.getLanguage(800000311);
        } 
        else if (item.recharge_type == 4) 
        {
            str = wls.Config.getLanguage(800000377);
        }
        item.text_word.setString(str);
    },

    //设置物品名称
    setGoodsName: function(item, recharge_name)
    {
        item.recharge_name = recharge_name;
        item.text_name.setString(recharge_name);
    },

    click_item: function(sender)
    {
        cc.log("recharge_name:"+sender.item.recharge_name);
        /*var item = sender.item;
        if (item.data.list_type == 1) {
            this.dialog(1, wls.Config.getLanguage(800000310));
        } else {
            this.exchangeItem(item.data);
        }*/
        var recharge_type = sender.item.recharge_type;
        if (recharge_type == 3) {
            if (this.find("DAPlayer").getMonthCardState().state == 0) 
            {
                this.activeGameObject("UIFirstMonthcard");
            } else {
                this.activeGameObject("UIMonthcard");
            }
            this.setVisible(false);
        }
        else if (recharge_type == 1 || recharge_type == 2 || recharge_type == 6) {
            var tb = {}
            tb.goods = sender.item.id;
            tb.price = sender.item.recharge;
            tb.name = sender.item.recharge_name;
            this.showPay(tb);
            wls.rechargeId = sender.item.id
        }
        else if (recharge_type == 5) {
            this.find("SCLayerMgr").showBoxById(sender.item.id)
            this.setVisible(false);
        }
    },
   
    click_btn_lock: function()
    {
        this.setVisible(false);
        this.pushView("UIVipRight");
    },

    click_btn_fishcoin: function()
    {
        this.idx = this.SHOP_COIN
        this.updateSwitchBtns(this.idx);
        this.scroll_shop_fishcoin.jumpToTop()
        if (this.checkList(this.idx)) {
            this.initScrollView();
        }
    },

    click_btn_crystal: function()
    {
        this.idx = this.SHOP_CRYSTAL
        this.updateSwitchBtns(this.idx);
        this.scroll_shop_crystal.jumpToTop()
        if (this.checkList(this.idx)) {
            this.initScrollView();
        }
    },

    click_btn_cannon: function()
    {
        this.idx = this.SHOP_CANNON
        this.updateSwitchBtns(this.idx);
        this.scroll_shop_cannon.jumpToTop()
        if (this.checkList(this.idx)) {
            this.initScrollView();
        }
    },

    click_btn_close: function()
    {
        this.stopTimer(200);
        this.setVisible(false);
    },

});