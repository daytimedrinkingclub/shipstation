(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[185],{2938:function(e,t,n){Promise.resolve().then(n.t.bind(n,4080,23)),Promise.resolve().then(n.t.bind(n,7800,23)),Promise.resolve().then(n.t.bind(n,2544,23)),Promise.resolve().then(n.t.bind(n,3054,23))},905:function(e,t){"use strict";let n;Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var n in t)Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}(t,{DOMAttributeNames:function(){return r},default:function(){return a},isEqualNode:function(){return i}});let r={acceptCharset:"accept-charset",className:"class",htmlFor:"for",httpEquiv:"http-equiv",noModule:"noModule"};function l(e){let{type:t,props:n}=e,l=document.createElement(t);for(let e in n){if(!n.hasOwnProperty(e)||"children"===e||"dangerouslySetInnerHTML"===e||void 0===n[e])continue;let i=r[e]||e.toLowerCase();"script"===t&&("async"===i||"defer"===i||"noModule"===i)?l[i]=!!n[e]:l.setAttribute(i,n[e])}let{children:i,dangerouslySetInnerHTML:a}=n;return a?l.innerHTML=a.__html||"":i&&(l.textContent="string"==typeof i?i:Array.isArray(i)?i.join(""):""),l}function i(e,t){if(e instanceof HTMLElement&&t instanceof HTMLElement){let n=t.getAttribute("nonce");if(n&&!e.getAttribute("nonce")){let r=t.cloneNode(!0);return r.setAttribute("nonce",""),r.nonce=n,n===e.nonce&&e.isEqualNode(r)}}return e.isEqualNode(t)}function a(){return{mountedInstances:new Set,updateHead:e=>{let t={};e.forEach(e=>{if("link"===e.type&&e.props["data-optimized-fonts"]){if(document.querySelector('style[data-href="'+e.props["data-href"]+'"]'))return;e.props.href=e.props["data-href"],e.props["data-href"]=void 0}let n=t[e.type]||[];n.push(e),t[e.type]=n});let r=t.title?t.title[0]:null,l="";if(r){let{children:e}=r.props;l="string"==typeof e?e:Array.isArray(e)?e.join(""):""}l!==document.title&&(document.title=l),["meta","base","link","style","script"].forEach(e=>{n(e,t[e]||[])})}}}n=(e,t)=>{let n=document.getElementsByTagName("head")[0],r=n.querySelector("meta[name=next-head-count]"),a=Number(r.content),o=[];for(let t=0,n=r.previousElementSibling;t<a;t++,n=(null==n?void 0:n.previousElementSibling)||null){var u;(null==n?void 0:null==(u=n.tagName)?void 0:u.toLowerCase())===e&&o.push(n)}let s=t.map(l).filter(e=>{for(let t=0,n=o.length;t<n;t++)if(i(o[t],e))return o.splice(t,1),!1;return!0});o.forEach(e=>{var t;return null==(t=e.parentNode)?void 0:t.removeChild(e)}),s.forEach(e=>n.insertBefore(e,r)),r.content=(a-o.length+s.length).toString()},("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},9189:function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var n in t)Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}(t,{cancelIdleCallback:function(){return r},requestIdleCallback:function(){return n}});let n="undefined"!=typeof self&&self.requestIdleCallback&&self.requestIdleCallback.bind(window)||function(e){let t=Date.now();return self.setTimeout(function(){e({didTimeout:!1,timeRemaining:function(){return Math.max(0,50-(Date.now()-t))}})},1)},r="undefined"!=typeof self&&self.cancelIdleCallback&&self.cancelIdleCallback.bind(window)||function(e){return clearTimeout(e)};("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},4080:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var n in t)Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}(t,{default:function(){return g},handleClientScriptLoad:function(){return b},initScriptLoader:function(){return m}});let r=n(9920),l=n(1452),i=n(7437),a=r._(n(4887)),o=l._(n(2265)),u=n(6590),s=n(905),c=n(9189),d=new Map,f=new Set,p=["onLoad","onReady","dangerouslySetInnerHTML","children","onError","strategy","stylesheets"],_=e=>{if(a.default.preinit){e.forEach(e=>{a.default.preinit(e,{as:"style"})});return}if("undefined"!=typeof window){let t=document.head;e.forEach(e=>{let n=document.createElement("link");n.type="text/css",n.rel="stylesheet",n.href=e,t.appendChild(n)})}},y=e=>{let{src:t,id:n,onLoad:r=()=>{},onReady:l=null,dangerouslySetInnerHTML:i,children:a="",strategy:o="afterInteractive",onError:u,stylesheets:c}=e,y=n||t;if(y&&f.has(y))return;if(d.has(t)){f.add(y),d.get(t).then(r,u);return}let b=()=>{l&&l(),f.add(y)},m=document.createElement("script"),h=new Promise((e,t)=>{m.addEventListener("load",function(t){e(),r&&r.call(this,t),b()}),m.addEventListener("error",function(e){t(e)})}).catch(function(e){u&&u(e)});for(let[n,r]of(i?(m.innerHTML=i.__html||"",b()):a?(m.textContent="string"==typeof a?a:Array.isArray(a)?a.join(""):"",b()):t&&(m.src=t,d.set(t,h)),Object.entries(e))){if(void 0===r||p.includes(n))continue;let e=s.DOMAttributeNames[n]||n.toLowerCase();m.setAttribute(e,r)}"worker"===o&&m.setAttribute("type","text/partytown"),m.setAttribute("data-nscript",o),c&&_(c),document.body.appendChild(m)};function b(e){let{strategy:t="afterInteractive"}=e;"lazyOnload"===t?window.addEventListener("load",()=>{(0,c.requestIdleCallback)(()=>y(e))}):y(e)}function m(e){e.forEach(b),[...document.querySelectorAll('[data-nscript="beforeInteractive"]'),...document.querySelectorAll('[data-nscript="beforePageRender"]')].forEach(e=>{let t=e.id||e.getAttribute("src");f.add(t)})}function h(e){let{id:t,src:n="",onLoad:r=()=>{},onReady:l=null,strategy:s="afterInteractive",onError:d,stylesheets:p,..._}=e,{updateScripts:b,scripts:m,getIsSsr:h,appDir:g,nonce:v}=(0,o.useContext)(u.HeadManagerContext),E=(0,o.useRef)(!1);(0,o.useEffect)(()=>{let e=t||n;E.current||(l&&e&&f.has(e)&&l(),E.current=!0)},[l,t,n]);let O=(0,o.useRef)(!1);if((0,o.useEffect)(()=>{!O.current&&("afterInteractive"===s?y(e):"lazyOnload"===s&&("complete"===document.readyState?(0,c.requestIdleCallback)(()=>y(e)):window.addEventListener("load",()=>{(0,c.requestIdleCallback)(()=>y(e))})),O.current=!0)},[e,s]),("beforeInteractive"===s||"worker"===s)&&(b?(m[s]=(m[s]||[]).concat([{id:t,src:n,onLoad:r,onReady:l,onError:d,..._}]),b(m)):h&&h()?f.add(t||n):h&&!h()&&y(e)),g){if(p&&p.forEach(e=>{a.default.preinit(e,{as:"style"})}),"beforeInteractive"===s)return n?(a.default.preload(n,_.integrity?{as:"script",integrity:_.integrity,nonce:v,crossOrigin:_.crossOrigin}:{as:"script",nonce:v,crossOrigin:_.crossOrigin}),(0,i.jsx)("script",{nonce:v,dangerouslySetInnerHTML:{__html:"(self.__next_s=self.__next_s||[]).push("+JSON.stringify([n,{..._,id:t}])+")"}})):(_.dangerouslySetInnerHTML&&(_.children=_.dangerouslySetInnerHTML.__html,delete _.dangerouslySetInnerHTML),(0,i.jsx)("script",{nonce:v,dangerouslySetInnerHTML:{__html:"(self.__next_s=self.__next_s||[]).push("+JSON.stringify([0,{..._,id:t}])+")"}}));"afterInteractive"===s&&n&&a.default.preload(n,_.integrity?{as:"script",integrity:_.integrity,nonce:v,crossOrigin:_.crossOrigin}:{as:"script",nonce:v,crossOrigin:_.crossOrigin})}return null}Object.defineProperty(h,"__nextScript",{value:!0});let g=h;("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},3054:function(){},2544:function(e){e.exports={style:{fontFamily:"'__geistMono_c3aa02', '__geistMono_Fallback_c3aa02'"},className:"__className_c3aa02",variable:"__variable_c3aa02"}},7800:function(e){e.exports={style:{fontFamily:"'__geistSans_1e4310', '__geistSans_Fallback_1e4310'"},className:"__className_1e4310",variable:"__variable_1e4310"}}},function(e){e.O(0,[571,971,23,744],function(){return e(e.s=2938)}),_N_E=e.O()}]);