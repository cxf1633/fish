/**
 * 挑衅道具
 */
wls.namespace.EFMagicProp = wls.WrapNode.extend(
{
    getZorder:function () {
        return wls.ZOrder.limitPop-1
    },
    onCreate: function()
    {   
        this.actionOffsetY = 100;
        this.actionInterval = 0.2;
        this.moveTime = 0.3;
        this.playing = {};
    },
    /** 播放使用怼他道具动画 */
    play: function(toId, propId, fromId){
        //限制每个人同一时间只能播放一次
        if(this.playing[fromId]) return ;
        this.playing[fromId] = true;

        var prop = wls.Config.get('magicprop',propId)

        var sprite = cc.Sprite.create();
        var animate = this.getAnimate(prop, sprite);
        sprite.setPosition(this.getActionPostion(fromId));
        sprite.data = {
            toId:toId,
            fromId:fromId,
            propId:propId
        }
        this.addChild(sprite);
        if (this.isRight(fromId))
        {
            sprite.setScaleX(-1);
        }
        var action =  this[prop.magicprop_res] ? 
            this[prop.magicprop_res](toId, animate, sprite, fromId, prop) : 
            this.defMagicProp(toId, animate, sprite, fromId, prop)
        sprite.runAction(action);
    },
    /** 获取序列帧动画对象 */
    getAnimate: function(prop, sprite)
    {   
        // var ani = cc.animationCache.getAnimation(prop.magicprop_res);
        // if(!ani)
        // {
            var i = 0; 
            ani = cc.Animation.create();
            if (prop.id == 410000001) //锤子
            {
                var count = 0;
                this.actionInterval = 0.12;
                while(true)
                {
                    if (i > 7 && count<2) {
                        i = 4;
                        count++;
                    }
                    var f = this.fullPath('battle/images/magicprop/magicproppic/' + prop.magicprop_res + '_' + i + '.png');
                    var t = cc.spriteFrameCache.getSpriteFrame(f);
                    if(i == 0 ) sprite.setSpriteFrame(t);
                    if(!t) break;
                    i++;
                    ani.addSpriteFrame(t);
                }
            } 
            else 
            {
                this.actionInterval = 0.2;
                while(true)
                {
                    var f = this.fullPath('battle/images/magicprop/magicproppic/' + prop.magicprop_res + '_' + i + '.png');
                    var t = cc.spriteFrameCache.getSpriteFrame(f);
                    if(i == 0 ) sprite.setSpriteFrame(t);
                    if(!t) break;
                    i++;
                    ani.addSpriteFrame(t);
                }
            }
            
            ani.setLoops(true);
            // ani.setRestoreOriginalFrame(true);
            //动画两帧之间的间隔
            ani.setDelayPerUnit(this.actionInterval);
            // cc.animationCache.addAnimation(ani, prop.magicprop_res);
        // }
        return cc.Animate.create(ani);
    },
    /** 使用viewid获取动画播放位置 */
    getActionPostion: function(id)
    {
        var cannon = this.find("GOCannon" + id);
        return cc.p(cannon.x, cannon.y  +  (id < 3 ? this.actionOffsetY : -this.actionOffsetY));
    },
    /** 判断是否在右边 */
    isRight: function(fromId){
        return fromId == 2 || fromId == 3;
    },
    /** 动画播放完毕后移除动画节点 */
    onActionEnd: function(sprite)
    {   
        this.playing[sprite.data.fromId] = false; 
        // cc.log.apply(cc,arguments);
        this.removeChild(sprite);
    },
    /** 获取旋转角度 */
    getRotation: function(fromId,toId)
    {   
        var fromPos = this.getActionPostion(fromId);
        var toPos = this.getActionPostion(toId);
        if(fromPos.y == toPos.y) return 0;
        var c = Math.sqrt(Math.pow(toPos.y - fromPos.y, 2) + Math.pow(toPos.x - fromPos.x , 2));
        var rotation = Math.asin((toPos.y - fromPos.y) / c) / Math.PI * 180;
        // cc.log(rotation);
        return rotation * (this.isRight(fromId) ? 1 : -1);
    },
    /** 
     * 默认动画过程，当无指定动画时使用这个效果
     * @param toId {Number} 对方viewid
     * @param animate {cc.Animate}  使用this.getAnimate获取到的动画对象
     * @param sprite {cc.Sprite}    用于播放动画的精灵节点
     */
    defMagicProp: function(toId, animate, sprite, fromId, prop)
    {
        var self = this;
        var action = cc.sequence(
            cc.moveTo(this.moveTime , this.getActionPostion(toId)),
            cc.spawn(
                animate,
                cc.callFunc(function(){
                    self.find('SCSound').playEffect(prop.magicprop_res + '.mp3');
                })
            ),
            cc.callFunc(this.onActionEnd.bind(this)))
        return action;
    },
    /** 喷漆动画 */
    magicprop05: function(toId, animate, sprite, fromId, prop)
    {   
        sprite.setScaleX(1);
        return this.defMagicProp(toId, animate, sprite, fromId, prop);
    },
    /** 臭鸡蛋动画，飞行过程中鸡蛋翻滚 */
    magicprop02: function(toId, animate, sprite, fromId, prop)
    {
        var self = this;
        var action = cc.sequence(
            cc.sequence(
                cc.spawn(
                    cc.moveTo(this.moveTime , this.getActionPostion(toId)),
                    cc.rotateBy(this.moveTime ,360,360)
                ),
                cc.callFunc(function()
                {
                    self.find('SCSound').playEffect('magicprop02.mp3');
                    sprite.setScaleX(1);
                })
            ),
            animate,
            cc.callFunc(this.onActionEnd.bind(this)))
        return action;
    },
    /** 开枪动画，无飞行过程，自己开枪对方中弹 */
    magicprop04: function(toId, animate, sprite, fromId, prop)
    {
        var self = this;
        sprite.setScaleX(this.isRight(fromId) ? 1 : -1);

        sprite.setRotation(this.getRotation(fromId , toId));

        var action = cc.sequence(
            cc.spawn(
                cc.sequence(
                    cc.delayTime(this.actionInterval * 3),
                    cc.callFunc(function(){
                        self.find('SCSound').playEffect('magicprop04.mp3');
                        sprite.setPosition(self.getActionPostion(toId))
                    })
                ),
                animate),
            cc.callFunc(this.onActionEnd.bind(this)))
        return action;
    },
});

