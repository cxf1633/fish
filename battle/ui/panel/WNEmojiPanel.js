//-----------------------------------------------------
// 表情面板
//-----------------------------------------------------
wls.namespace.WNEmojiPanel = wls.WrapNode.extend
({
    onCreate: function()
    {
        wls.BindUI(this, this);
        this.setVisible(false);
        this.updateType(1);
        this.type = 1;
        for (var i = 1; i < 9; i++)
        {
            var emoji = this["Emoji_" + i];
            emoji.setTouchEnabled(true);
            emoji.setTag(i);
            wls.OnClicked(emoji, this, "emoji");
        }
        for (var i = 1; i < 3; i++)
        {
            var btn = this["btn_type" + i];
            btn.setTouchEnabled(true);
            btn.setTag(i);
            wls.OnClicked(btn, this, "type");
        }
    },

    updateType: function(type)
    {
        this.type = type;
        this["btn_type" + type].setColor(cc.c3b(31, 106, 174));
        for (var i = 1; i < 3; i++)
        {
            if (i != type)
            {
                this["btn_type" + i].setColor(cc.c3b(22, 67, 108));
            }
        }

        var start = type == 1 ? 0 : 8;
        for (var i = 1; i < 9; i++)
        {
            var id = i + start;
            var emoji = this["Emoji_" + i];
            var filename = "emoji" + ((id < 10) ? ("0" + id) : id) + "_00.png";
            emoji.loadTexture(this.fullPath("battle/images/emoji/" + filename), 1);
        }
    },

    click_type: function(sender)
    {
        this.updateType(sender.getTag());
    },

    click_emoji: function(sender)
    {
        var tag = sender.getTag();
        this.close();
        var start = this.type == 1 ? 0 : 8;
        var id = tag + start;
        FG.SendMsg("sendEmotionIcon", id);
    },

    onEventTouchEnded: function()
    {
        this.close();
    }, 

    open: function()
    {
        this.setVisible(true);
        var p = FG.CannonPosList[FG.SelfViewID - 1];
        var pos = cc.p(p.x, p.y);
        pos.y += 160;
        pos.x -= 250;
        this.setPosition(pos);
    },

    close: function()
    {
        this.setVisible(false);
    },
});