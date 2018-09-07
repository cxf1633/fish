"use strict";
// 启动捕鱼大厅
window.StartMiniHall = function(root)
{
    
    // 功能开关
    var t = {};
    t.Enable_Exchange = GameApp.CheckModuleEnable(ModuleTag.Exchange); // 是否有兑换功能
    t.Enable_Share = true;
    wls.Modules = t;
    cc.log("功能开关")
    wls.warn(t);


    window.FishApp = isNative();
    window.FISH_DISABLE_CHARGE = (isIOS() && isMiniGame());// 取消支付功能
    var cls = wls.namespace.GSFishHall;
    if (!wls.IsMiniProgrom())
    {
        if (window.LoadFishJS === undefined)
        {
            window.LoadFishJS = true;
            var baseDir = "";
            cc.loader.loadJs(baseDir, fish_res.js, function() {
                cc.director.setDisplayStats(false);
                var layer = new cls();
                layer.play(root);
            });
            return;
        }
    }
    
    cc.director.setDisplayStats(false);
    var layer = new cls();
    layer.play(root);
};
