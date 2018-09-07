//-----------------------------------------------------
// 金币掉落动画
//-----------------------------------------------------
wls.namespace.EFCoins = wls.WrapNode.extend
({
    onCreate: function()
    {
        var config = wls.Config.get("room", wls.RoomIdx + 910000000);
        this.mFilename = config.coin_res || "friend_coin";
        this.mCoinRowAndCol = {}
        this.mCoinRowAndCol[1] = [1, 1];
        this.mCoinRowAndCol[2] = [2, 1];
        this.mCoinRowAndCol[5] = [5, 1];
        this.mCoinRowAndCol[8] = [4, 2];
        this.mCoinRowAndCol[12] = [4, 3];
        this.mCoinRowAndCol[18] = [6, 3];
        this.mCoinsPool = [];
    },

    // 鱼被捕掉落金币
    playFishDropOut: function(pos, cnt, viewid, score, fishScore)
    {
        var row = 2;
        var col = 1;
        if (this.mCoinRowAndCol[cnt])
        {
            row = this.mCoinRowAndCol[cnt][0];
            col = this.mCoinRowAndCol[cnt][1];
        }
        var idx = viewid == FG.SelfViewID ? 1 : 2;
        this.find("EFLabels").playFishDropOut(pos, score, idx);
        var gapWidth = 50
        var gapHeight = 60
        var sx = pos.x - (row - 1) * gapWidth / 2.0
        var sy = pos.y + (col - 1) * gapHeight / 2.0
        var x = sx
        var y = sy
        var dst = FG.AimPosList[viewid - 1];
        var dt = 0.5;
        for (var i = 1; i <= col; i++)
        {
            x = sx;
            for (var j = 1; j <= row; j++)
            {
                this.showCoin(idx, cc.p(x, y), dst, dt);
                x += gapWidth;
                dt += 0.12;
            }
            y -= gapHeight;
        }

        if (score != 0)
        {
            var cannon = this.find("GOCannon" + viewid);
            var cf = function()
            {
                FG.PlayEffect("gold_get02.mp3");
                cannon.doOpCoin(score);
                cannon.doOpScore(fishScore);
            };
            this.runAction(cc.sequence(cc.delayTime(2.7), cc.callFunc(cf)));
        }
    },

    showCoin: function(idx, src, dst, dt)
    {
        var coin = this.createCoin(idx);
        coin.bUse = true;
        coin.setPosition(src);
        coin.setScale(0.5);
        coin.setOpacity(255);
        coin.setVisible(false);
        var act1 = cc.sequence(cc.moveBy(0.21, cc.p(0, 88)), cc.moveBy(0.20, cc.p(0, -103)), cc.moveBy(0.13, cc.p(0, 27)));
        var act2 = cc.spawn(act1, cc.scaleTo(0.54, 0.9));
        var act3 = cc.spawn(cc.scaleTo(0.75, 0.7), cc.moveTo(0.75, dst).easing(cc.easeExponentialIn()));
        var act4 = cc.callFunc(function(){ coin.bUse = false; coin.setVisible(false); });
        var act = cc.sequence(cc.delayTime(dt), cc.show(), act2, cc.delayTime(0.83), act3, act4);
        coin.runAction(act);
    },

    // 创建金币精灵
    createCoin: function(idx)
    {
        var coin;
        for(var i = this.mCoinsPool.length - 1; i >= 0; i--)
        {
            coin = this.mCoinsPool[i];
            if (!coin.bUse && coin.idx == idx)
            {
                return coin;
            }
        }
        coin = cc.Sprite.create();
        this.addChild(coin);
        this.mCoinsPool.push(coin);

        var filename = this.mFilename + idx;
        var animation = FG.CreateAnimation(filename, 1 / 16.0,0,9);
        coin.runAction(cc.RepeatForever.create(cc.Animate.create(animation)));
        coin.bUse = false;
        coin.idx = idx;
        return coin;
    },

    showGunAwardCoin: function(viewid,propCount,coinNum)
    {
        var cannon = this.find("GOCannon" + viewid);
        var pos = cannon.getCentrePos()
        for (var index = 0; index < coinNum; index++) {
            var coin = this.createCoin(1);
            coin.bUse = true;
            var offsetX = (Math.random() -0.5)*50
            var offsetY = (Math.random() -0.5)*50
            coin.setPosition(cc.p(pos.x+offsetX,pos.y+offsetY + 100))
            coin.setScale(1)
            coin.setVisible(true)
            coin.setOpacity(0)
            var tb = 
            [
                cc.Spawn.create(cc.MoveTo.create(0.08, cc.p(pos.x+offsetX, pos.y +offsetY+ 260)), cc.FadeTo.create(0.08, 255)),
                cc.DelayTime.create(1.68 +0.16),
                cc.Spawn.create(cc.MoveTo.create(0.28, cc.p(pos.x, pos.y)), cc.FadeTo.create(0.28, 255*1)),
                cc.Hide.create(),
                cc.CallFunc.create(function () {
                    coin.bUse = false 
                    if (index == coinNum) { 
                        cannon.doOpCoin(propCount) 
                    }
                })
            ]
            coin.runAction(cc.Sequence.create(tb))
        }
    }
});