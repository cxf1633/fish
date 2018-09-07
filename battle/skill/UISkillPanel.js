//-----------------------------------------------------
// 技能按钮面板
//-----------------------------------------------------
wls.namespace.UISkillPanel = wls.WrapNode.extend
({
    onCreate: function()
    {
        this.skills = {};
        wls.BindUI(this, this);
        this.hideWidth = this.panel_left.getContentSize().width
        this.bOpen = true;
        this.bGroup = false;
        var btn;
        for (var i = 1; i <= 8; i++)
        {
            btn = this["btn_skill" + i];
            btn.origin = btn.getPosition();
            btn.setVisible(false);
            if (i <= 3)
            {
                btn.hidePos = cc.p(btn.x, btn.y - 150)
            }
        }

        this.mLightBindNode = [];
        this.mLightBindIdx = 0;
        this.Skill_Left.x = wls.OffsetX;
        this.Skill_Center_Bottom.setPosition(display.width / 2, 0);
        this.setVisible(true);
        this.Skill_Left.setScale(wls.MinScale)
        this.Skill_Center_Bottom.setScale(wls.MinScale)

        this.initSkill();
        this.initViolentBar();  

        wls.PlayTimelineAction(this.node_bomb_light, "doplay");
        this.node_bomb_light.setVisible(false);
    },

    // 普通场技能 
    initSkill: function()
    {
        var idx = 1
        while (true) {
            if (!this["btn_skill" + idx]) {
                break 
            }
            this["btn_skill" + idx].setVisible(false)
            idx++
        }
        var tb = FG.RoomConfig.skills;
        var length = tb.length;
        var id, btn;
        for (var i = 1; i <= length; i++ )
        {
            id = tb[i - 1];
            if (id == 0) continue;
            btn = this["btn_skill" + i];
            this.addSkill(FG.SkillMap[id], [btn, id]);
            btn.setVisible(true);
            if (i < 4) this.mLightBindNode.push(btn);
        }
        // 居中对齐
        if (length == 1)
        {
            this.btn_skill1.x = 0
            this.btn_skill1.origin.x = 0;
            this.btn_skill1.hidePos.x = 0;
        }
        else if (length == 2)
        {
            var offx = 60
            this.btn_skill1.x = -offx;
            this.btn_skill1.origin.x = -offx;
            this.btn_skill1.hidePos.x = -offx;
            this.btn_skill2.x = offx
            this.btn_skill2.origin.x = offx;
            this.btn_skill2.hidePos.x = offx;
        }
       
        this.node_open.setVisible(false)
        if (this.btn_skill6.isVisible() || this.btn_skill7.isVisible() || this.btn_skill8.isVisible())
        {
            this.node_open.setVisible(true)     
        }
    },

    // 是否鱼潮(禁用技能)
    setGroup: function(bo)
    {
        this.bGroup = bo;
    },

    addSkill: function(name, args)
    {
        var skill = this.createGameObject(name, args);
        this.skills[args[1]] = skill;
    },

    open: function()
    {
        this.bOpen = true;
        this.node_skill.stopAllActions();
        this.node_skill.runAction(cc.moveTo(0.2, cc.p(0, 50)));
    },

    close: function()
    {
        this.bOpen = false;
        this.node_skill.stopAllActions();
        this.node_skill.runAction(cc.moveTo(0.2, cc.p(-this.hideWidth, 50)));
        
    },

    click_btn_skill: function()
    {
        if (this.bOpen)
        {
            this.close();
            this.cancalBombSkill();
        }
        else
        {
            this.open();
        }
    },

    onEventTouchEnded: function()
    {
        if (this.bOpen) {this.close()}
    },

    // 更新所有icon
    updateAllIcon: function()
    {
        for ( var k in this.skills) 
        {
            this.skills[k].updateIcon();
        }
    },
    onEventEnterForgeGround: function() 
    {
        this.updateAllCD();
    },
    // 更新所有iconCD
    updateAllCD: function()
    {
        for ( var k in this.skills) 
        {
            this.skills[k].updateCD();
            this.skills[k].updateUseTime();
        }
        this.updateCountdownAct()
    },


    // 扣除费用
    doCost: function(id, viewid, useType,isSucceed)
    {
        var rate = isSucceed == false ? -1:1
        var skill = this.skills[id];
        var cannon = this.find("GOCannon" + viewid);
        if (useType == 1)
        {
            cannon.opGem(-skill.getCost()*rate);
        }
        else
        {
            cannon.opProp(skill.id, -1*rate);
        }
        if (viewid == FG.SelfViewID)
        {
            skill.icon.updateIcon();
        }
    },

    onUseSkill: function(id, viewid, useType)
    {
        if (viewid == FG.SelfViewID) return;
        this.doCost(id, viewid, useType);
    },

    cancalBombSkill: function()
    {
        var list = [6,16,21,22,23]
        for (var i = 0; i < list.length; i++) {
            var element = this.find("SKBomb"+list[i])
            if (element) {
                element.cancelSkill();
            }
        }
    },

    // 是否刚好解锁技能
    isJustRelieve: function(propId,newRate)
    {
        return this.skills[propId] && this.skills[propId].gunRateLimit == newRate
    },

    //-----------------------------------------------------
    // 狂暴栏
    //-----------------------------------------------------
    initViolentBar: function()
    {
        this.node_violentcd.origin = this.node_violentcd.getPosition();
        this.node_violentcd.showPos = cc.p(this.node_violentcd.x, this.btn_skill1.y);

        this.spr_bar.setVisible(false);
        var p = new cc.ProgressTimer(this.spr_bar);
        p.type = cc.ProgressTimer.TYPE_BAR;
        this.spr_bar.getParent().addChild(p, 1);
        p.midPoint = cc.p(0, 0.5);
        p.barChangeRate = cc.p(1, 0);
        p.setPercentage(100);
        p.setPosition(this.spr_bar.getPosition());
        this.pro = p;
    },

    showViolentBar: function(bShow)
    {
        var t = 0.5;
        var btn1 = this.find("SKLock") ? this.find("SKLock").icon : this.btn_skill1;
        var btn2 = this.find("SKViolent") ? this.find("SKViolent").icon : this.btn_skill2;
        var node = this.node_violentcd;
        if (bShow)
        {
            btn1.stopAllActions();
            btn1.runAction(cc.moveTo(t, btn1.hidePos));
            btn2.stopAllActions();
            btn2.runAction(cc.moveTo(t, btn2.hidePos));
            node.stopAllActions();
            node.runAction(cc.moveTo(t, node.showPos));
        }
        else
        {
            btn1.stopAllActions();
            btn1.runAction(cc.moveTo(t, btn1.origin));
            btn2.stopAllActions();
            btn2.runAction(cc.moveTo(t, btn2.origin));
            node.stopAllActions();
            node.runAction(cc.moveTo(t, node.origin));
        }
        this.updateSkillNoticeNode()
    },

    resetViolentRate: function(rate)
    {
        if (rate == 2)
        {
            this.btn_fourrate.setEnabled(true);
            this.btn_tworate.setEnabled(false);
        }
        else
        {
            this.btn_tworate.setEnabled(true);
            this.btn_fourrate.setEnabled(false);
        }
        this.find("SKViolent").setViolentRate(rate);
    },

    click_btn_tworate: function()
    {
        this.resetViolentRate(2);
    },

    click_btn_fourrate: function()
    {
        this.resetViolentRate(4);
    },

    runCountdownAct: function(t)
    {
        var self = this
        var p = this.pro;
        p.setPercentage(100);
        p.stopAllActions();
        p.runAction(cc.Sequence.create(cc.progressTo(t, 0),cc.CallFunc.create(function () {
            self.countdownEnd()
        })));
    },
    updateCountdownAct: function()
    {
        var go = this.find("SKViolent")
        if (!go) { return }
        var self = this
        var p = this.pro;
        p.stopAllActions();

        var dis = go.icon.beganFrame + go.duration - wls.GetCurTimeFrame() - wls.serverTimeDis
        if (dis <= 0) {
            self.countdownEnd()
            return 
        }
        p.setPercentage(dis/go.duration*100);
        p.runAction(cc.Sequence.create(cc.progressTo(dis, 0),cc.CallFunc.create(function () {
            self.countdownEnd()
        })));
    },
    countdownEnd: function()
    {
        this.find("SKViolent").stopSkill();
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        cannon.playViolentAct(false);
    },

    //提示使用技能
    createSkillNoticeNode: function(propId)
    {
        var curBtn = this.find(FG.SkillMap[propId]).icon
        if (curBtn == null) { return }
        var pos = wls.getWordPosByNode(curBtn)
        if (this.skillNotice == null) {
            var uinode = cc.Node.create()
            this.addChild(uinode)
            
            var spr = cc.Sprite.create()
            spr.setSpriteFrame(this.fullPath("battle/images/skill/bl_skill_arrow.png"))
            uinode.addChild(spr)
            spr.setPosition(cc.p(0,100))
            spr.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.MoveBy.create(0.5,cc.p(0,20)),cc.MoveBy.create(0.5,cc.p(0,-20)))))
            var fileName = wls.format("battle/images/skill/bl_pic_skill_text_id_%s.png","%s", [propId])
            var word = cc.Sprite.create()
            word.setSpriteFrame(this.fullPath(fileName))
            uinode.addChild(word)
            word.setPosition(cc.p(0,200))
            uinode.word = word
            this.skillNotice = uinode
        }
        var fileName = wls.format("battle/images/skill/bl_pic_skill_text_id_%s.png","%s", [propId])
        this.skillNotice.word.setSpriteFrame(this.fullPath(fileName))
        this.skillNotice.propId = propId
        this.skillNotice.setPosition(pos.x,50)
        this.skillNotice.setVisible(true)
        this.updateSkillNoticeNode()
    },

    hideSkillNoticeNode: function(propId)
    {
        if (this.skillNotice == null || propId == null || propId != this.skillNotice.propId ) {return}
        this.skillNotice.removeFromParent()
        this.skillNotice = null 
    },

    updateSkillNoticeNode: function()
    {
        if (this.skillNotice == null || this.skillNotice.propId != 4 ) {return}
        var isusing = this.find("SKViolent").isUsingSkill()
        this.skillNotice.setVisible(!isusing)
    },

});