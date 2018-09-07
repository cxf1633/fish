// 图鉴
wls.namespace.UIHandBook = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("battle/fishform/uifishform.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        ccnode.setScale(ccnode.getScale()*scale)
        this.adaptClose(this.btn_close)
        var self = this;
        self.scrollSize = self.scroll_fish_list.getContentSize()
        self.scroll_fish_list.setScrollBarEnabled(false)
        self.normal_v_count = 8
        self.special_v_count = 4
        // 计算出每个格子的宽高
        self.cellW1 = self.scrollSize.width / self.normal_v_count
        self.cellW2 = self.scrollSize.width / self.special_v_count
        self.cellH = 96
        var tb = {};
        tb[1] = 1;
        tb[2] = 1;
        tb[3] = 2;
        tb[4] = 1;
        tb[5] = 3;
        tb[6] = 1;
        this.TypeMapFile = tb;
        this.initScrollView();
    },

    initScrollView: function()
    {
        var normals = [];
        var specails = [];
        var id = 910000000 + wls.RoomIdx;
        wls.Config.ForEachNew("roomfish", function(ret){
            if (ret.room_id == id)
            {
                ret.fish_type == 6 ? specails.push(ret) : normals.push(ret);
            }
        });
        // 计算有几行
        var self = this;
        var c1 = Math.ceil(normals.length / self.normal_v_count);
        var c2 = Math.ceil(specails.length / self.special_v_count);
        var h = (c1 + c2) * self.cellH;
        self.scroll_fish_list.setInnerContainerSize(cc.size(self.scrollSize.width, h));
        var sx = self.cellW1 / 2;
        var y = h - self.cellH / 2;
        var x = sx;
        var idx = 0;
        // 普通鱼
        for (var i = 0; i < normals.length; i++)
        {
            var item = this.createItem(normals[i]);
            self.scroll_fish_list.addChild(item);
            item.setPosition(x, y);
            idx++;
            x += self.cellW1;
            if (idx == self.normal_v_count)
            {
                x = sx;
                idx = 0;
                y -= self.cellH;
            }
        }
        // 特殊鱼
        y = h - self.cellH / 2 - self.cellH * c1;
        sx = self.cellW2 / 2;
        x = sx;
        for (var i = 0; i < specails.length; i++)
        {
            var item = this.createItem(specails[i]);
            self.scroll_fish_list.addChild(item);
            item.setPosition(x, y);
            idx++;
            x += self.cellW2;
            if (idx == self.special_v_count)
            {
                x = sx;
                idx = 0;
                y -= self.cellH;
            }
        }
    },

    createItem: function(data)
    {
        var id = data.fish_id - 100000000;
        var item = wls.LoadStudioNode(this.fullPath("battle/fishform/uiformitem.json"));
        wls.BindUI(item, item);
        data.show_score == 0 ? item.fnt_rate.setVisible(false) : item.fnt_rate.setString(data.show_score)
        item.spr_fish.setSpriteFrame(this.fullPath("battle/images/form/fishid_" + id + ".png"))
        filename = "battle/images/form/form_box_" + this.TypeMapFile[data.fish_type] + ".png";
        var filename = this.fullPath(filename)
        item.image_formbg.loadTexture(filename, 1)
        if (data.fish_type == 6)
        {
            var size = item.image_formbg.getContentSize()
            item.image_formbg.setContentSize(cc.size(size.width + 134, size.height))
        }
        if (data.show_score > 0) {
            item.spr_be.setPositionX(item.fnt_rate.getContentSize().width)
        }
        return item;
    },

    click_btn_close: function()
    {
        this.setVisible(false);
    },
});