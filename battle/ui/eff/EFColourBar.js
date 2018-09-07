/****************************************************************
 * 作者：xiaos
 * 日期：2018-07-17
 * 描述：悬赏任务的烟花效果
 ****************************************************************/
wls.namespace.EFColourBar = wls.WrapNode.extend({
    onCreate: function() {
        this.particles = []
        for (var key = 1; key <= 8; key++) {
            var particle = cc.ParticleSystem.create(this.fullPath("battle/images/rewardtask/Particle_caidai"+key+".plist"))
            particle.stop()
            this.addChild(particle,0)
            particles.append(particle)
        }
    },

    play: function() {
        for (var key = 0; key < this.particles.length; key++) {
            this.particles[key].play()
        }
    },

})