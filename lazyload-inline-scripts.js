;(function () {
  const LazyInlineScriptLoader = {
    triggered: false,

    loadLazyScripts() {
      if (this.triggered) return
      this.triggered = true

      document.querySelectorAll('script[type="text/lazyload"]').forEach((oldScript) => {
        const newScript = document.createElement('script')

        // 复制所有属性，除 type 外
        Array.from(oldScript.attributes).forEach((attr) => {
          if (attr.name !== 'type') {
            newScript.setAttribute(attr.name, attr.value)
          }
        })

        // 复制内联 JS 内容
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent
        }

        // 替换原有 script
        oldScript.parentNode.replaceChild(newScript, oldScript)
      })

      console.log('[LazyInlineScriptLoader] 懒加载脚本已触发')
    },

    bindTriggerEvent() {
      const trigger = this.loadLazyScripts.bind(this)

      // 滚动触发
      window.addEventListener('scroll', trigger, { once: true })

      // 用户交互兜底（点击/键盘）
      window.addEventListener('click', trigger, { once: true })
      window.addEventListener('keydown', trigger, { once: true })

      // 兜底超时触发（如用户停留未操作）
      setTimeout(trigger, 5000)
    },

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.bindTriggerEvent())
      } else {
        this.bindTriggerEvent()
      }
    }
  }

  window.LazyInlineScriptLoader = LazyInlineScriptLoader
  LazyInlineScriptLoader.init()
})()
