;(function () {
  const LazyThirdPartyLoader = {
    observer: null,

    init() {
      this.observer = new MutationObserver(this.handleMutations.bind(this))
      this.observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      })

      this.observeLCP()
    },

    handleMutations(mutations) {
      mutations.forEach(({ addedNodes }) => {
        addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return

          if (node.tagName === 'SCRIPT') {
            this.processScript(node)
          }

          if (
            node.tagName === 'IFRAME' &&
            node.src.includes('https://www.youtube.com/')
          ) {
            node.setAttribute('data-src', node.src)
            node.removeAttribute('src')
            node.classList.add('lazy')
          }
        })
      })
    },

    processScript(node) {
      const html = node.innerHTML || ''
      const delaySrcList = [
        'facebook_pageLike_sdk.js',
        'bootstrap.min.js',
        'sweetalert.min.js',
        'base.js',
        'https://static.hsappstatic.net',
        'https://www.googletagmanager.com',
        'https://js.hscollectedforms.net',
        'https://connect.facebook.net',
        'https://js-na1.hs-scripts.com/',
        'https://static.cloudflareinsights.com',
        'https://www.gstatic.com',
        'https://apis.google.com'
        
      ]
      if (node.src && delaySrcList.some((s) => node.src.includes(s))) {
        node.setAttribute('data-src', node.src)
        node.removeAttribute('src')
        node.type = 'text/lazyload'
      }

      // const textTriggers = ['embed', 'googletagmanager', 'hsappstatic']
      // if (textTriggers.some((t) => html.includes(t))) {
      //   node.type = 'text/lazyload'
      // }
    },

    triggerLazyScripts() {
      document.querySelectorAll('script[type="text/lazyload"]').forEach((oldScript) => {
        const newScript = document.createElement('script')
        Array.from(oldScript.attributes).forEach((attr) => {
          if (attr.name !== 'type') {
            newScript.setAttribute(attr.name, attr.value)
          }
        })
        newScript.textContent = oldScript.textContent
        oldScript.parentNode.replaceChild(newScript, oldScript)
      })

      document.querySelectorAll('script[data-src]').forEach((script) => {
        const newScript = document.createElement('script')
        newScript.src = script.dataset.src
        newScript.async = true
        script.parentNode.replaceChild(newScript, script)
      })

      document.querySelectorAll('iframe[data-src]').forEach((iframe) => {
        iframe.src = iframe.dataset.src
        iframe.removeAttribute('data-src')
      })

      const asyncEvent = new Event('asyncLazyLoad')
      document.dispatchEvent(asyncEvent)
    },

    observeLCP() {
      if (!('PerformanceObserver' in window)) return

      try {
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              // 页面第一次 LCP 元素加载完成
              // 停止观察并触发懒加载资源加载
              observer.disconnect()
              console.log('[LazyLoader] LCP 完成，开始加载第三方资源')
              this.triggerLazyScripts()
              break
            }
          }
        })

        observer.observe({ type: 'largest-contentful-paint', buffered: true })

        // 兜底：400ms后强制加载
        setTimeout(() => {
          observer.disconnect()
          console.log('[LazyLoader] 超时兜底，开始加载第三方资源')
          this.triggerLazyScripts()
        }, 400)
      } catch (err) {
        console.warn('[LazyLoader] PerformanceObserver 不支持', err)
        // 不支持的浏览器，直接兜底加载
        this.triggerLazyScripts()
      }
    },

    stop() {
      this.observer && this.observer.disconnect()
    },
  }

  window.LazyThirdPartyLoader = LazyThirdPartyLoader
  LazyThirdPartyLoader.init()
})()
