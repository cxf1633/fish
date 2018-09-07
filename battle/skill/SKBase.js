//-----------------------------------------------------
// 技能基类
//-----------------------------------------------------
wls.SKBase = cc.Node.extend
({
    onCreate: function(args) 
    {
        this.id = args[1];
        var config = wls.Config.get("item", 200000000 + this.id);
        this.gunRateLimit = config.need_cannon;
        this.vipLimit = config.require_vip;
        this.can_buy = config.can_buy == 1
        this.propDes = "("+wls.Config.getLanguage(800000337)+wls.Config.getLanguage(800000218)+config.pack_text+")"
        this.cost = parseInt(wls.SplitArray(config.price)[1]);
        this.bUse = false;
        var c2 = wls.Config.get("skill", this.id);
        this.cd = c2.cool_down;
        this.duration = c2.duration;
        this.usingTime = c2.duration;
        this.initParent();
        this.initSkill();
        this.initIcon(args[0]);
    },

    // 初始化父结点
    initParent: function()
    {
        this.retain();
        this.removeFromParent(false);
        FG.SkillRoot.addChild(this);
        this.release();
    },

    // 技能icon
    initIcon: function(icon)
    {
        var go = this.wrapGameObject(icon, "UISkillIcon", this);
        go.updateIcon();
        this.icon = go;
    },

    updateIcon: function()
    {
        this.icon.updateIcon();
    },
    updateCD: function()
    {
        this.icon.updateCD(this.cd);
    },
    //更新使用时间 有需要的技能就重写 如锁定技能
    updateUseTime: function() { },

    doActiveSkill: function()
    {
        if (!this.isCanUse())
        {
            return;
        }
        this.activeSkill();
        this.find("UISkillPanel").doCost(this.id, FG.SelfViewID, this.calcUseType());
    },

    initSkill: function() {},
    activeSkill: function() {},
    releaseSkill: function() {},
    stopSkill: function() {},
    cancelSkill: function() {},

    doUseSkill: function()
    {
        this.bUse = true;
    },

    // 是否正在使用技能
    isUsingSkill: function()
    {
        return this.bUse;
    },

    startCoolDown: function()
    {
        this.icon.startCD(this.cd);
    },

    // 判断使用方式  0 个数  1 水晶
    calcUseType: function()
    {
        var ret = this.getAmount() > 0 ? 0 : 1;
        return ret;
    },

    // 获得数量
    getAmount: function()
    {
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        return cannon.getProp(this.id) || 0;
    },

    // 获得消耗
    getCost: function()
    {
        return this.cost;
    },

    getIconFilename: function()
    {
        var i = this.id;
        var name = "bl_pic_skill_prop_0" + ((i < 10) ? ("0" + i) : i);
        if (this.isGunRateLimit() && this.getAmount() <= 0)
        {
            name += "_gray";
        }
        name += ".png";
        return this.fullPath("battle/images/skill/" + name);
    },

    isCanUse: function()
    {
        // 鱼潮来临
        if (this.find("UISkillPanel").bGroup)
        {
            this.toast(wls.Config.getLanguage(800000085));
            return false;
        }

        //个数判断
        if (this.calcUseType() == 0) {return true; }
        if (!this.can_buy) {
            //var des = wls.format(wls.Config.getLanguage(800000348),"%s",[tb.rate,tb.propCount,])
            this.dialog(2,"个数不足，不能使用");
            return 
        }
        var self = this
        //狂暴提示判断
        if (this.id == 17 && this.isViolentNotice() != null) {
            var tb = this.isViolentNotice()
            var des = wls.format(wls.Config.getLanguage(800000348),"%s",[tb.rate,tb.propCount,])
            this.dialog(3,des, function(ret) {
                if (ret == 2) return;
                self.pushView("UIUnlockCannon");
            });
            return false 
        }

        //vip判断
        if (this.isVipLimit()) {
            var des = "\n"+wls.Config.getLanguage(800000111)+this.vipLimit+wls.Config.getLanguage(800000112) + "$"+this.propDes
            this.dialog(3,des, function(ret) {
                if (ret == 2) return;
                self.gotoShop(1)
            });
            return false;
        }

        //炮倍判断
        if (this.isGunRateLimit())
        {
            var des = "\n"+wls.Config.getLanguage(800000345)+this.gunRateLimit+wls.Config.getLanguage(800000346)+"$"+this.propDes
            this.dialog(3,des, function(ret) {
                if (ret == 2) return;
                self.pushView("UIUnlockCannon");
            });
            return false;
        }

        //水晶判断
        if (this.isGemLimit())
        {
            this.notEngoughTips();
            return false;
        }
        return true;
    },

    // 炮倍限制
    isGunRateLimit: function()
    {
        if (this.getAmount() > 0)
        {
            return false;
        }
        var r = this.find("GOCannon" + FG.SelfViewID).getMaxGunRate();
        return r < this.gunRateLimit;
    },

    // vip限制
    isVipLimit: function()
    {
        if (FISH_DISABLE_CHARGE) {return false}
        var r = this.find("DAPlayer").getVipLevel();
        return r < this.vipLimit;
    },

    // 水晶判断
    isGemLimit: function()
    {
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        return this.getCost() > cannon.getGem()
    },

    // 狂暴判断
    isViolentNotice: function()
    {
        var r = this.find("GOCannon" + FG.SelfViewID).getMaxGunRate();
        var list = wls.Config.getViolentNoticeList()
        for (var index = 0; index < list.length; index++) {
            var element = list[index];
            if (r < list[index].rate ) {
                rate = list[index].rate
                return {rate:list[index].rate,propCount:list[index].propCount}
            }
        }
        return null
    },

    notEngoughTips: function()
    {
        this.find("SCLayerMgr").setCurShowList(9)
        //this.getScene().showNotEnoughGemTip();
    },
});
