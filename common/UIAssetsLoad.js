"use strict";
// 资源加载界面
wls.namespace.UIAssetsLoad = ccui.Layout.extend
({
    getZorder:function () {
        return wls.ZOrder.Loading
    },
    onCreate: function()
    {
        this.setContentSize(cc.size(display.width, display.height));
        this.setTouchEnabled(true);

        var bg = new ccui.ImageView("src/libs/preload_res/img_bg.jpg");
        this.addChild(bg);
        bg.setPosition(display.width / 2, display.height / 2);
        bg.setScale(wls.MainScale);

        var l = new cc.LabelTTF("", 48);
        this.addChild(l);
        l.setPosition(display.width * 0.5, display.height * 0.4);
        this.label = l;

        this._updateView = new UpdateView();
        this._updateView.addToEx(this);
        this._updateView.updateMsgText("正在检查更新...")
        wls.CallAfter(this, 0.01, "doStartLoad");       
    },

    getAssetsList: function()
    {
        if (FishApp)
        {
            return ["config"];
        }
        else
        {
            return ["config", "common", "hall", "battle", "plist"];
        }
    },

    doStartLoad: function()
    {
        var tb = this.getAssetsList();
        var self = this;
        var list = [];
        var head = this._getResUrlHead();
        cc.log(head);
        for (var j = 0; j < tb.length; j++)
        {
            var l1 = fish_res[tb[j]];
            for (var i = 0; i < l1.length; i++)
            {
                list.push(head + l1[i]);
            }
        }
        this.loadAssets(list, function(){
            self.gotoNextState();
        });
    },

    loadAssets: function(tb, callback)
    {
        NotificationCenter.addNotification(this, "event_show_update_progress");
        var callback1 = function()
        {
            //cc.log(arguments);
        };

        var callback2 = function(err, result)
        {
            NotificationCenter.removeNotificationByName(this, "event_show_update_progress");
            if (callback) 
            {
                callback();
            }
        }
        //cc.loader.load(tb, callback1, callback2);
        if (wls.IsMiniProgrom())
        {
            Loader.loadFish(tb, callback2, false);
        }
        else
        {
            cc.loader.load(tb, callback1, callback2);
        }    
    },

    // 显示下载进度
    event_show_update_progress : function(progress, receivedBytes, totalBytes) {
        //this.label.setString(receivedBytes + "/" + totalBytes);
        this._updateView.showUpdateProgress(progress, receivedBytes, totalBytes);
    },

    _getResUrlHead : function()
    {
        return "";
        if (!this._urlHead)
        {
            this._urlHead = LocalStorage.getString("__res_file_url_head")
        }
        return this._urlHead
    },
});