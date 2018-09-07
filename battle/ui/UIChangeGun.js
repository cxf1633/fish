// 换炮面板
wls.namespace.UIChangeGun = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("battle/uiselectcannon.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        this.newScale = ccnode.getScale()*scale
        ccnode.setScale(this.newScale)
        this.adaptClose(this.btn_close)
        this.items = {};
        this.initScrollView();
        this.bPending = false;
    },

    // 初始化滚动条
    initScrollView: function()
    {
        //初始化数据
        var list = [];
        var types = {};
        wls.Config.ForEachNew("cannonoutlook", function(val) {
            if (types[val.type] == null)
            {
                list.push(val);
                types[val.type] = 0;
            }
        });

        list.sort( function(a, b){ return  b.show_order - a.show_order; })
        
        
        var cell_h_count = 4      // 格子横向数
        var cell_v_count = 1      // 格子纵向数
        var cellCountSize = this.scroll_list.getContentSize()
        // 计算出每个格子的宽高
        var cellW = cellCountSize.width / cell_h_count
        var cellH = cellCountSize.height / cell_v_count
        var total = list.length;
        this.allCount = total
        for (var i = 0; i < total; i++)
        {
            var item = this.createItem(list[i]);
            item.idx = i
            item.setPosition(cellW / 2 + cellW * i, cellH / 2);
            this.scroll_list.addChild(item);
            this.items[list[i].type] = item;
        }
        this.scroll_list.setInnerContainerSize(cc.size(cellW * total, cellH))
        this.cell_h_count = cell_h_count
        
    },

    createItem: function(data)
    {
        var item = wls.LoadStudioNode(this.fullPath("battle/uiselectcannonitem.json"));
        wls.BindUI(item, item);
        item.data = data;
        item.spr_name.setSpriteFrame(this.fullPath("hall/images/vip/" + data.rec));
        item.spr_gun.setSpriteFrame(this.fullPath("battle/cannon/"+ data.cannon_img));
        //vip资源缺失，先隐藏
        // item.spr_vip.setVisible(false);
        var str = "hall/images/vip/vip_badge_" + (data.type - 1) + ".png" 
        item.spr_vip.setSpriteFrame(this.fullPath(str));
        item.btn_get.item = item;
        item.btn_use.item = item;
        item.btn_taste.item = item;
        wls.OnClicked(item.btn_use, this);
        wls.OnClicked(item.btn_get, this);
        wls.OnClicked(item.btn_taste, this);

        if (data.type == 30) {
            var emitter = cc.ParticleSystem.create(this.fullPath("common/particle/Particle_ykvip.plist"))  
            item.item_clone.addChild(emitter,0)
            emitter.setPosition(cc.p(item.spr_vip.getPositionX(),item.spr_vip.getPositionY()))
            item.emitter = emitter
        }

        return item;
    },

    // 更新所有item
    updateAllItem: function()
    {
        this.bPending = false;
        var cannon = this.find("GOCannon" + FG.SelfViewID);

        //初始炮台更新炮身
        var c =  wls.Config.calcCannonConfig(1, cannon.getMaxGunRate());
        this.items[1].spr_gun.setSpriteFrame(this.fullPath("battle/cannon/"+ c.cannon_img));

        // 重置所有数据
        var data;
        var vipLv = this.find("DAPlayer").getVipData().vip_level;
        var limitList = this.find("DAPlayer").getLimitGun()
        for (var key in this.items)
        {
            data = this.items[key].data;
            data.isLimitGun = false
            data.isUnLock = false
            data.isUseing = false
            data.seniorData = null 
            for (var i = 0; i < limitList.length; i++) {
                var element = limitList[i];
                if (limitList[i].config.use_outlook == data.type ) {
                    data.isLimitGun = true
                    if (data.seniorData != null && limitList[i].stringProp != "") {
                        data.seniorData = limitList[i]
                    } else if (data.seniorData == null) {
                        data.seniorData = limitList[i]
                    }
                }
            }

            if(data.type == cannon.getGunType()){
                data.isUseing = true
            }

            //判断月卡
            if (data.type == 30 && this.find("DAPlayer").getMonthCardState().state != 0) {
                data.isUnLock = true
            } else if((data.type - 1) <= vipLv)
            {
                data.isUnLock = true
            }

        }
        for (var key in this.items)
        {
            this.updateItem(this.items[key]);
        }

    },
    updateItem: function(item)
    {
        var data = item.data
        //按键更新
        //设置炮的item状态 1:已装备 2:未装备  4:获取  3:体验
        item.btn_use.setVisible(false)
        item.btn_get.setVisible(false)
        item.btn_taste.setVisible(false)
        var state = 0
        if (data.isUseing) {
            state = 1
        } else if ((!data.isUnLock) && (data.isLimitGun && data.seniorData.stringProp == "")) {
            state = 3
        } else if (data.isUnLock || (data.isLimitGun && data.seniorData.stringProp != "")) {
            state = 2
        } else {
            state = 4
        }
        
        if(state == 3) {
            item.btn_taste.setVisible(true)
        } else if(state == 4) {
            item.btn_get.setVisible(true)
        } else {
            item.btn_use.setVisible(true)
            item.btn_use.setEnabled(state == 2)
            item.spr_zb.setVisible(state == 2)
            item.spr_yzb.setVisible(state == 1)
        }  

        //锁头更新
        if (!data.isLimitGun) {
            item.spr_lock.setSpriteFrame(this.fullPath("battle/cannon/bl_gun_lock.png"))
        } else {
            item.spr_lock.setSpriteFrame(this.fullPath("battle/cannon/bl_gun_limit.png"))
        }
        item.spr_lock.setVisible(!data.isUnLock)
        item.img_taste.setVisible((!data.isUnLock) && (data.isLimitGun && data.seniorData.stringProp != ""))

    },

    click_btn_use: function(sender)
    {
        if (this.bPending) return;
        this.bPending = true;
        var data = sender.item.data;
        FG.SendMsg("sendNewGunType", data.type);
    },

    click_btn_taste: function(sender)
    {
        if (this.bPending) return;
        this.bPending = true;
        var data = sender.item.data;
        var seniorData = data.seniorData
        this.find("SCSend").sendUsePropCannon(0,seniorData.propId)
    },

    click_btn_get: function(sender)
    {
        if (FISH_DISABLE_CHARGE) {return this.dialog(1,wls.Config.getLanguage(800000463))}
        if (this.bPending) return;
        this.bPending = true;
        var data = sender.item.data;
        // FG.SendMsg("sendShopBuy", data.shop_id);
        if (data.type == 30) {
            var cardState = this.find("DAPlayer").getMonthCardState();
            if (cardState.state == 0) 
            {
                this.activeGameObject("UIFirstMonthcard");
            } 
            else if (cardState.state == 1 || cardState.state == 2)
            {
                this.activeGameObject("UIMonthcard");
            }
        } else {
            this.pushView("UIVipRight",data.type-1);
        }
        this.setVisible(false);
        
    },

    click_btn_close: function()
    {
        this.setVisible(false);
    },
    onActive: function()
    {
        this.updateAllItem();
        this.jumpByGunType(this.find("GOCannon" + FG.SelfViewID).getGunType())
    },

    jumpByGunType: function(gunType)
    {
        var node = this.items[gunType]
        var per = (node.idx+1 - 2.5)/(this.allCount - this.cell_h_count)*100
        if (per < 0) {
            per = 0
        } else if (per >100) {
            per = 100
        }
        this.scroll_list.jumpToPercentHorizontal(per)    
    },

    reloadData: function()
    {
        if (!this.isVisible()) return;
        this.updateAllItem();
    },
});