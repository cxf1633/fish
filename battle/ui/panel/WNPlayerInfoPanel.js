//-----------------------------------------------------
// 玩家信息面板
//-----------------------------------------------------
wls.namespace.WNPlayerInfoPanel = wls.WrapNode.extend
({
    onCreate: function()
    {
        wls.BindUI(this, this);
        this.setVisible(false);
        this.initScorllView();
        // this.spr_vip.setVisible(false);
    }, 
    
    initScorllView: function()
    {
        this.img_select.setLocalZOrder(100);
        var list = [];
        wls.Config.ForEachNew("magicprop", function(ret) {
            list.push(ret);
        });

        var cell_h_count = 4      // 格子横向数
        var cell_v_count = 1      // 格子纵向数
        var cellCountSize = this.scroll_list.getContentSize()
        // 计算出每个格子的宽高
        var cellW = cellCountSize.width / cell_h_count
        var cellH = cellCountSize.height / cell_v_count
        var total = list.length;
        this.itemList =  [];
        for (var i = 0; i < total; i++)
        {
            var item = this.createItem(list[i]);
            item.setPosition(cellW / 2 + cellW * i, cellH / 2);
            if(i == 0)
            {
                this.img_select.setPosition(item.getPosition());
            }
            this.scroll_list.addChild(item);
            this.itemList.push(item);
        }
        this.scroll_list.setInnerContainerSize(cc.size(cellW * total, cellH))
    },

    createItem: function(data)
    {
        var item = wls.LoadStudioLayout(this.fullPath("battle/playerinfo/uipropitem.json"));
        wls.BindUI(item, item);
        var f = this.fullPath("battle/images/magicprop/magicproppic/" + data.magicprop_res + ".png");
        item.icon.loadTexture(f, 1);
        if (data.crystal_need == 0)
        {
            item.img_subbg.setVisible(false);
        }
        else
        {
            item.img_subbg.setVisible(true);
            item.font_diamon.setString(data.crystal_need);
            var imgSubbgWidth = item.img_subbg.getContentSize().width;
            var fontDiamonWidth = item.font_diamon.getContentSize().width;
            var diamonWidth = item.diamon.getContentSize().width;
            var sizeX = (imgSubbgWidth - fontDiamonWidth - diamonWidth*1.25)/2;
            item.diamon.setPositionX(sizeX);
            item.font_diamon.setPositionX(item.diamon.x+diamonWidth*1.25);
        }
        item.icon.setTouchEnabled(true);
        item.icon.data = data;
        wls.OnClicked(item.icon, this, "item");
        return item;
    },

    updatePlayer: function(viewid)
    {
        //记录当前座位用于播放挑衅动画
        this.viewid = viewid;
        var cannon = this.find("GOCannon" + viewid);
        var player = FG.GetPlayerByViewID(this.viewid);
        // cc.log(cannon.getPlayer());
        
        this.text_name.setString(player.nickName)
        this.text_rate.setString(cannon.getMaxGunRate());
        this.text_grade.setString(wls.Config.getLevelData(player.gradeExp).level);
        this.text_playerid.setString(player.playerId);
        this.text_word_dqyb.setString("玩家ID")
        var str = this.fullPath("hall/images/vip/vip_badge_" + cannon.getVipLevel() + ".png");
        cc.log(str)
        this.spr_vip.setSpriteFrame(str);
        var f = this.fullPath("hall/images/vip/"+cannon.config.rec);
        this.spr_gunname.setSpriteFrame(f);

        for (var index = 0; index < this.itemList.length; index++) {
            var item = this.itemList[index];
            if(item.icon.data.unlock_vip == 0)
            {
                item.img_vip.setColor(cc.c3b(255, 72, 0));
                //item.text_select.ignoreContentAdaptWithSize(true);
                item.text_select.setString("免费");
                //item.icon.setTouchEnabled(true);
            }
            else
            {
                if (FISH_DISABLE_CHARGE){
                    item.img_vip.setVisible(false);
                    item.text_select.setVisible(false);
                }
                item.img_vip.setColor(cc.c3b(0, 168, 204));
                item.text_select.setString("V" + item.icon.data.unlock_vip);
                /*var mycannon = this.find("GOCannon" + FG.SelfViewID);
                if(mycannon.getVipLevel() >= item.icon.data.unlock_vip)
                {
                    item.icon.setTouchEnabled(true);
                }
                else{
                    item.icon.setTouchEnabled(false);
                }*/
            }
        }
   
    },

    open: function(viewid)
    {
        this.updatePlayer(viewid);
        this.setVisible(true);
        var p = FG.CannonPosList[viewid - 1];
        var pos = cc.p(p.x, p.y);
        if (viewid >= 3)
        {
            pos.y -= 200;
        } 
        else
        {
            pos.y += 400;
        }
        this.setPosition(pos);

        // 需要一个房主权限
        // this.btn_kickout.setVisible(false);
        // this.btn_kickout.setTouchEnabled(false);
    },

    close: function()
    {
        this.setVisible(false);
    },

    onEventTouchEnded: function()
    {
        this.close();
    }, 

    click_item: function(icon)
    {   
        //判断vip
        var self = this;
        cc.log("getVipLevel:"+this.find("DAPlayer").getVipLevel()+" icon.data.unlock_vip:"+icon.data.unlock_vip)
        if(this.find("DAPlayer").getVipLevel() < icon.data.unlock_vip && !FISH_DISABLE_CHARGE) 
        {
            this.dialog(3,wls.Config.getLanguage(800000111) + icon.data.unlock_vip + wls.Config.getLanguage(800000112),function name(ret) {
                if (ret == 2) return;
                self.activeGameObject("UIShop");
            })
            return 
        }

        var myCannon = this.find('GOCannon' + FG.GetSelfPlayer().viewid);
        var player = FG.GetPlayerByViewID(this.viewid);
        var data = icon.data;
        this.img_select.setPosition(icon.parent.getPosition())
        if (!player) return ;
        if(myCannon.getGem() < data.crystal_need)
        {
            if (FISH_DISABLE_CHARGE) { return this.dialog(1,wls.Config.getLanguage(800000464)) }
            this.dialog(3,wls.Config.getLanguage(800000087),function name(ret) {
                if (ret == 2) return;
                self.activeGameObject("UIShop", 2);
            })
            return;
        }
        //动画播放中限制发送请求
        if(this.find('EFMagicProp').playing[FG.GetSelfPlayer().viewid]) return ;
        // cc.log(player);
        this.find('SCSend').sendMagicProp(player.playerId, data.id);
        this.close()
        // cc.log('发送播放动画请求');
    },

    click_btn_kickout: function(){
        var player = FG.GetPlayerByViewID(this.viewid);
        if(!player) return ;
        FG.SendMsg('sendFriendKickOut', player.playerId)
    }
});