//-----------------------------------------------------
// 掉落金币数字提示
//-----------------------------------------------------
wls.namespace.EFLabels = wls.WrapNode.extend
({
    onCreate: function()
    {
        this.mLabelPool = [];
        this.mCannonLabels = {};
    },

    // 鱼掉落，金币提示
    playFishDropOut: function(pos, score, idx)
    {
        if (score <= 0) return 
        var label = this.createLabel(idx);
        label.setString("+" + score);
        label.setPosition(pos);
        label.setVisible(true);
        label.setOpacity(255);
        label.setScale(1);
        FG.PlayEffect("collect_01.mp3");
        var act1 = cc.spawn(cc.fadeOut(0.3), cc.moveBy(0.3, cc.p(0, 30)));
        var act = cc.sequence(cc.show(), cc.scaleTo(0.08, 1.5), cc.scaleTo(0.08, 1.0), cc.delayTime(0.6),
            act1, cc.hide());
        label.runAction(act);
    },

    // 炮台上文字提示
    playCannonTips: function(viewid, score)
    {
        var label = this.mCannonLabels[viewid];
        if (label == null)
        {
            var idx = viewid == FG.SelfViewID ? 1 : 2;
            label = new ccui.TextBMFont();
            label.setFntFile(wls.CheckPath(this.fullPath("common/fnt/bonus_num_" + idx + ".fnt")));
            this.addChild(label, 1);
            label.setScale(0.7);
            this.mCannonLabels[viewid] = label;
            var pos = this.find("GOCannon" + viewid).Node_fnt_curadd.convertToWorldSpaceAR(cc.p(0, 0));
            label.setPosition(pos);
        }
        label.setString("+" + score);
        label.stopAllActions();
        label.setOpacity(255)
        var act = cc.Sequence.create
        (
            cc.DelayTime.create(0.8),
            cc.FadeOut.create(0.2)
        )
        label.runAction(act);
    },

    createLabel: function(idx)
    {
        var label;
        for(var i = this.mLabelPool.length - 1; i >= 0; i--)
        {
            label = this.mLabelPool[i];
            if (!label.isVisible() && label.idx == idx)
            {
                return label;
            }
        }

        label = new ccui.TextBMFont();
        label.setFntFile(wls.CheckPath(this.fullPath("common/fnt/bonus_num_" + idx + ".fnt")));
        label.idx = idx;
        this.addChild(label);
        this.mLabelPool.push(label);
        return label;
    }
});