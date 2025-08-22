const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["SiteSettings.js","popup/popup.js"])))=>i.map(i=>d[i]);
import{d as Q,h as p,r as H,u as zt,i as kt,a as we,b as Et,c as $t,e as Xe,t as Bt,m as Mt,f as Wt,F as Lt,N as It,g as Ot,j as ye,o as Ft,k as o,l as d,n as E,p as O,q as Nt,s as Ce,v as Ie,V as Ae,w as jt,x as Ge,y as Ht,z as Te,A as qe,B as Dt,C as G,D as Vt,E as q,G as me,H as Ut,I as Xt,J as Gt,T as qt,K as Qt,L as Pe,M as Kt,O as xe,P as ue,Q as y,R as ae,S as Yt,U as Jt,W as Zt,X as w,Y as P,Z as f,_ as ea,$ as A,a0 as s,a1 as V,a2 as te,a3 as ta,a4 as be,a5 as fe,a6 as aa,a7 as c,a8 as Oe,a9 as na}from"./popup/popup.js";import{c as Fe,a as ra,u as Ne,b as oa,o as ia,_ as sa,d as la,e as da,N as ca}from"./DescriptionsItem.js";import{A as ba,S as fa}from"./Scrollbar.js";import{_ as ua}from"./Flex.js";import"./get-slot.js";const pa=Fe(".v-x-scroll",{overflow:"auto",scrollbarWidth:"none"},[Fe("&::-webkit-scrollbar",{width:0,height:0})]),ga=Q({name:"XScroll",props:{disabled:Boolean,onScroll:Function},setup(){const e=H(null);function r(a){!(a.currentTarget.offsetWidth<a.currentTarget.scrollWidth)||a.deltaY===0||(a.currentTarget.scrollLeft+=a.deltaY+a.deltaX,a.preventDefault())}const i=zt();return pa.mount({id:"vueuc/x-scroll",head:!0,anchorMetaName:ra,ssr:i}),Object.assign({selfRef:e,handleWheel:r},{scrollTo(...a){var R;(R=e.value)===null||R===void 0||R.scrollTo(...a)}})},render(){return p("div",{ref:"selfRef",onScroll:this.onScroll,onWheel:this.disabled?void 0:this.handleWheel,class:"v-x-scroll"},this.$slots)}});var va=/\s/;function ha(e){for(var r=e.length;r--&&va.test(e.charAt(r)););return r}var ma=/^\s+/;function xa(e){return e&&e.slice(0,ha(e)+1).replace(ma,"")}var je=NaN,ya=/^[-+]0x[0-9a-f]+$/i,wa=/^0b[01]+$/i,_a=/^0o[0-7]+$/i,Sa=parseInt;function He(e){if(typeof e=="number")return e;if(kt(e))return je;if(we(e)){var r=typeof e.valueOf=="function"?e.valueOf():e;e=we(r)?r+"":r}if(typeof e!="string")return e===0?e:+e;e=xa(e);var i=wa.test(e);return i||_a.test(e)?Sa(e.slice(2),i?2:8):ya.test(e)?je:+e}var ze=function(){return Et.Date.now()},Ra="Expected a function",Ca=Math.max,Aa=Math.min;function Ta(e,r,i){var x,a,R,m,g,C,_=0,S=!1,F=!1,N=!0;if(typeof e!="function")throw new TypeError(Ra);r=He(r)||0,we(i)&&(S=!!i.leading,F="maxWait"in i,R=F?Ca(He(i.maxWait)||0,r):R,N="trailing"in i?!!i.trailing:N);function T(u){var h=x,Y=a;return x=a=void 0,_=u,m=e.apply(Y,h),m}function B(u){return _=u,g=setTimeout(I,r),S?T(u):m}function z(u){var h=u-C,Y=u-_,re=r-h;return F?Aa(re,R-Y):re}function L(u){var h=u-C,Y=u-_;return C===void 0||h>=r||h<0||F&&Y>=R}function I(){var u=ze();if(L(u))return M(u);g=setTimeout(I,z(u))}function M(u){return g=void 0,N&&x?T(u):(x=a=void 0,m)}function K(){g!==void 0&&clearTimeout(g),_=0,x=C=a=g=void 0}function j(){return g===void 0?m:M(ze())}function v(){var u=ze(),h=L(u);if(x=arguments,a=this,C=u,h){if(g===void 0)return B(C);if(F)return clearTimeout(g),g=setTimeout(I,r),T(C)}return g===void 0&&(g=setTimeout(I,r)),m}return v.cancel=K,v.flush=j,v}var Pa="Expected a function";function ke(e,r,i){var x=!0,a=!0;if(typeof e!="function")throw new TypeError(Pa);return we(i)&&(x="leading"in i?!!i.leading:x,a="trailing"in i?!!i.trailing:a),Ta(e,r,{leading:x,maxWait:r,trailing:a})}const Be=$t("n-tabs"),Qe={tab:[String,Number,Object,Function],name:{type:[String,Number],required:!0},disabled:Boolean,displayDirective:{type:String,default:"if"},closable:{type:Boolean,default:void 0},tabProps:Object,label:[String,Number,Object,Function]},za=Q({__TAB_PANE__:!0,name:"TabPane",alias:["TabPanel"],props:Qe,slots:Object,setup(e){const r=Xe(Be,null);return r||Bt("tab-pane","`n-tab-pane` must be placed inside `n-tabs`."),{style:r.paneStyleRef,class:r.paneClassRef,mergedClsPrefix:r.mergedClsPrefixRef}},render(){return p("div",{class:[`${this.mergedClsPrefix}-tab-pane`,this.class],style:this.style},this.$slots)}}),ka=Object.assign({internalLeftPadded:Boolean,internalAddable:Boolean,internalCreatedByPane:Boolean},Ft(Qe,["displayDirective"])),$e=Q({__TAB__:!0,inheritAttrs:!1,name:"Tab",props:ka,setup(e){const{mergedClsPrefixRef:r,valueRef:i,typeRef:x,closableRef:a,tabStyleRef:R,addTabStyleRef:m,tabClassRef:g,addTabClassRef:C,tabChangeIdRef:_,onBeforeLeaveRef:S,triggerRef:F,handleAdd:N,activateTab:T,handleClose:B}=Xe(Be);return{trigger:F,mergedClosable:ye(()=>{if(e.internalAddable)return!1;const{closable:z}=e;return z===void 0?a.value:z}),style:R,addStyle:m,tabClass:g,addTabClass:C,clsPrefix:r,value:i,type:x,handleClose(z){z.stopPropagation(),!e.disabled&&B(e.name)},activateTab(){if(e.disabled)return;if(e.internalAddable){N();return}const{name:z}=e,L=++_.id;if(z!==i.value){const{value:I}=S;I?Promise.resolve(I(e.name,i.value)).then(M=>{M&&_.id===L&&T(z)}):T(z)}}}},render(){const{internalAddable:e,clsPrefix:r,name:i,disabled:x,label:a,tab:R,value:m,mergedClosable:g,trigger:C,$slots:{default:_}}=this,S=a??R;return p("div",{class:`${r}-tabs-tab-wrapper`},this.internalLeftPadded?p("div",{class:`${r}-tabs-tab-pad`}):null,p("div",Object.assign({key:i,"data-name":i,"data-disabled":x?!0:void 0},Mt({class:[`${r}-tabs-tab`,m===i&&`${r}-tabs-tab--active`,x&&`${r}-tabs-tab--disabled`,g&&`${r}-tabs-tab--closable`,e&&`${r}-tabs-tab--addable`,e?this.addTabClass:this.tabClass],onClick:C==="click"?this.activateTab:void 0,onMouseenter:C==="hover"?this.activateTab:void 0,style:e?this.addStyle:this.style},this.internalCreatedByPane?this.tabProps||{}:this.$attrs)),p("span",{class:`${r}-tabs-tab__label`},e?p(Lt,null,p("div",{class:`${r}-tabs-tab__height-placeholder`}," "),p(It,{clsPrefix:r},{default:()=>p(ba,null)})):_?_():typeof S=="object"?S:Wt(S??i)),g&&this.type==="card"?p(Ot,{clsPrefix:r,class:`${r}-tabs-tab__close`,onClick:this.handleClose,disabled:x}):null))}}),Ea=o("tabs",`
 box-sizing: border-box;
 width: 100%;
 display: flex;
 flex-direction: column;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
`,[d("segment-type",[o("tabs-rail",[E("&.transition-disabled",[o("tabs-capsule",`
 transition: none;
 `)])])]),d("top",[o("tab-pane",`
 padding: var(--n-pane-padding-top) var(--n-pane-padding-right) var(--n-pane-padding-bottom) var(--n-pane-padding-left);
 `)]),d("left",[o("tab-pane",`
 padding: var(--n-pane-padding-right) var(--n-pane-padding-bottom) var(--n-pane-padding-left) var(--n-pane-padding-top);
 `)]),d("left, right",`
 flex-direction: row;
 `,[o("tabs-bar",`
 width: 2px;
 right: 0;
 transition:
 top .2s var(--n-bezier),
 max-height .2s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `),o("tabs-tab",`
 padding: var(--n-tab-padding-vertical); 
 `)]),d("right",`
 flex-direction: row-reverse;
 `,[o("tab-pane",`
 padding: var(--n-pane-padding-left) var(--n-pane-padding-top) var(--n-pane-padding-right) var(--n-pane-padding-bottom);
 `),o("tabs-bar",`
 left: 0;
 `)]),d("bottom",`
 flex-direction: column-reverse;
 justify-content: flex-end;
 `,[o("tab-pane",`
 padding: var(--n-pane-padding-bottom) var(--n-pane-padding-right) var(--n-pane-padding-top) var(--n-pane-padding-left);
 `),o("tabs-bar",`
 top: 0;
 `)]),o("tabs-rail",`
 position: relative;
 padding: 3px;
 border-radius: var(--n-tab-border-radius);
 width: 100%;
 background-color: var(--n-color-segment);
 transition: background-color .3s var(--n-bezier);
 display: flex;
 align-items: center;
 `,[o("tabs-capsule",`
 border-radius: var(--n-tab-border-radius);
 position: absolute;
 pointer-events: none;
 background-color: var(--n-tab-color-segment);
 box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .08);
 transition: transform 0.3s var(--n-bezier);
 `),o("tabs-tab-wrapper",`
 flex-basis: 0;
 flex-grow: 1;
 display: flex;
 align-items: center;
 justify-content: center;
 `,[o("tabs-tab",`
 overflow: hidden;
 border-radius: var(--n-tab-border-radius);
 width: 100%;
 display: flex;
 align-items: center;
 justify-content: center;
 `,[d("active",`
 font-weight: var(--n-font-weight-strong);
 color: var(--n-tab-text-color-active);
 `),E("&:hover",`
 color: var(--n-tab-text-color-hover);
 `)])])]),d("flex",[o("tabs-nav",`
 width: 100%;
 position: relative;
 `,[o("tabs-wrapper",`
 width: 100%;
 `,[o("tabs-tab",`
 margin-right: 0;
 `)])])]),o("tabs-nav",`
 box-sizing: border-box;
 line-height: 1.5;
 display: flex;
 transition: border-color .3s var(--n-bezier);
 `,[O("prefix, suffix",`
 display: flex;
 align-items: center;
 `),O("prefix","padding-right: 16px;"),O("suffix","padding-left: 16px;")]),d("top, bottom",[o("tabs-nav-scroll-wrapper",[E("&::before",`
 top: 0;
 bottom: 0;
 left: 0;
 width: 20px;
 `),E("&::after",`
 top: 0;
 bottom: 0;
 right: 0;
 width: 20px;
 `),d("shadow-start",[E("&::before",`
 box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, .12);
 `)]),d("shadow-end",[E("&::after",`
 box-shadow: inset -10px 0 8px -8px rgba(0, 0, 0, .12);
 `)])])]),d("left, right",[o("tabs-nav-scroll-content",`
 flex-direction: column;
 `),o("tabs-nav-scroll-wrapper",[E("&::before",`
 top: 0;
 left: 0;
 right: 0;
 height: 20px;
 `),E("&::after",`
 bottom: 0;
 left: 0;
 right: 0;
 height: 20px;
 `),d("shadow-start",[E("&::before",`
 box-shadow: inset 0 10px 8px -8px rgba(0, 0, 0, .12);
 `)]),d("shadow-end",[E("&::after",`
 box-shadow: inset 0 -10px 8px -8px rgba(0, 0, 0, .12);
 `)])])]),o("tabs-nav-scroll-wrapper",`
 flex: 1;
 position: relative;
 overflow: hidden;
 `,[o("tabs-nav-y-scroll",`
 height: 100%;
 width: 100%;
 overflow-y: auto; 
 scrollbar-width: none;
 `,[E("&::-webkit-scrollbar, &::-webkit-scrollbar-track-piece, &::-webkit-scrollbar-thumb",`
 width: 0;
 height: 0;
 display: none;
 `)]),E("&::before, &::after",`
 transition: box-shadow .3s var(--n-bezier);
 pointer-events: none;
 content: "";
 position: absolute;
 z-index: 1;
 `)]),o("tabs-nav-scroll-content",`
 display: flex;
 position: relative;
 min-width: 100%;
 min-height: 100%;
 width: fit-content;
 box-sizing: border-box;
 `),o("tabs-wrapper",`
 display: inline-flex;
 flex-wrap: nowrap;
 position: relative;
 `),o("tabs-tab-wrapper",`
 display: flex;
 flex-wrap: nowrap;
 flex-shrink: 0;
 flex-grow: 0;
 `),o("tabs-tab",`
 cursor: pointer;
 white-space: nowrap;
 flex-wrap: nowrap;
 display: inline-flex;
 align-items: center;
 color: var(--n-tab-text-color);
 font-size: var(--n-tab-font-size);
 background-clip: padding-box;
 padding: var(--n-tab-padding);
 transition:
 box-shadow .3s var(--n-bezier),
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[d("disabled",{cursor:"not-allowed"}),O("close",`
 margin-left: 6px;
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),O("label",`
 display: flex;
 align-items: center;
 z-index: 1;
 `)]),o("tabs-bar",`
 position: absolute;
 bottom: 0;
 height: 2px;
 border-radius: 1px;
 background-color: var(--n-bar-color);
 transition:
 left .2s var(--n-bezier),
 max-width .2s var(--n-bezier),
 opacity .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `,[E("&.transition-disabled",`
 transition: none;
 `),d("disabled",`
 background-color: var(--n-tab-text-color-disabled)
 `)]),o("tabs-pane-wrapper",`
 position: relative;
 overflow: hidden;
 transition: max-height .2s var(--n-bezier);
 `),o("tab-pane",`
 color: var(--n-pane-text-color);
 width: 100%;
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 opacity .2s var(--n-bezier);
 left: 0;
 right: 0;
 top: 0;
 `,[E("&.next-transition-leave-active, &.prev-transition-leave-active, &.next-transition-enter-active, &.prev-transition-enter-active",`
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 transform .2s var(--n-bezier),
 opacity .2s var(--n-bezier);
 `),E("&.next-transition-leave-active, &.prev-transition-leave-active",`
 position: absolute;
 `),E("&.next-transition-enter-from, &.prev-transition-leave-to",`
 transform: translateX(32px);
 opacity: 0;
 `),E("&.next-transition-leave-to, &.prev-transition-enter-from",`
 transform: translateX(-32px);
 opacity: 0;
 `),E("&.next-transition-leave-from, &.next-transition-enter-to, &.prev-transition-leave-from, &.prev-transition-enter-to",`
 transform: translateX(0);
 opacity: 1;
 `)]),o("tabs-tab-pad",`
 box-sizing: border-box;
 width: var(--n-tab-gap);
 flex-grow: 0;
 flex-shrink: 0;
 `),d("line-type, bar-type",[o("tabs-tab",`
 font-weight: var(--n-tab-font-weight);
 box-sizing: border-box;
 vertical-align: bottom;
 `,[E("&:hover",{color:"var(--n-tab-text-color-hover)"}),d("active",`
 color: var(--n-tab-text-color-active);
 font-weight: var(--n-tab-font-weight-active);
 `),d("disabled",{color:"var(--n-tab-text-color-disabled)"})])]),o("tabs-nav",[d("line-type",[d("top",[O("prefix, suffix",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),o("tabs-nav-scroll-content",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),o("tabs-bar",`
 bottom: -1px;
 `)]),d("left",[O("prefix, suffix",`
 border-right: 1px solid var(--n-tab-border-color);
 `),o("tabs-nav-scroll-content",`
 border-right: 1px solid var(--n-tab-border-color);
 `),o("tabs-bar",`
 right: -1px;
 `)]),d("right",[O("prefix, suffix",`
 border-left: 1px solid var(--n-tab-border-color);
 `),o("tabs-nav-scroll-content",`
 border-left: 1px solid var(--n-tab-border-color);
 `),o("tabs-bar",`
 left: -1px;
 `)]),d("bottom",[O("prefix, suffix",`
 border-top: 1px solid var(--n-tab-border-color);
 `),o("tabs-nav-scroll-content",`
 border-top: 1px solid var(--n-tab-border-color);
 `),o("tabs-bar",`
 top: -1px;
 `)]),O("prefix, suffix",`
 transition: border-color .3s var(--n-bezier);
 `),o("tabs-nav-scroll-content",`
 transition: border-color .3s var(--n-bezier);
 `),o("tabs-bar",`
 border-radius: 0;
 `)]),d("card-type",[O("prefix, suffix",`
 transition: border-color .3s var(--n-bezier);
 `),o("tabs-pad",`
 flex-grow: 1;
 transition: border-color .3s var(--n-bezier);
 `),o("tabs-tab-pad",`
 transition: border-color .3s var(--n-bezier);
 `),o("tabs-tab",`
 font-weight: var(--n-tab-font-weight);
 border: 1px solid var(--n-tab-border-color);
 background-color: var(--n-tab-color);
 box-sizing: border-box;
 position: relative;
 vertical-align: bottom;
 display: flex;
 justify-content: space-between;
 font-size: var(--n-tab-font-size);
 color: var(--n-tab-text-color);
 `,[d("addable",`
 padding-left: 8px;
 padding-right: 8px;
 font-size: 16px;
 justify-content: center;
 `,[O("height-placeholder",`
 width: 0;
 font-size: var(--n-tab-font-size);
 `),Nt("disabled",[E("&:hover",`
 color: var(--n-tab-text-color-hover);
 `)])]),d("closable","padding-right: 8px;"),d("active",`
 background-color: #0000;
 font-weight: var(--n-tab-font-weight-active);
 color: var(--n-tab-text-color-active);
 `),d("disabled","color: var(--n-tab-text-color-disabled);")])]),d("left, right",`
 flex-direction: column; 
 `,[O("prefix, suffix",`
 padding: var(--n-tab-padding-vertical);
 `),o("tabs-wrapper",`
 flex-direction: column;
 `),o("tabs-tab-wrapper",`
 flex-direction: column;
 `,[o("tabs-tab-pad",`
 height: var(--n-tab-gap-vertical);
 width: 100%;
 `)])]),d("top",[d("card-type",[o("tabs-scroll-padding","border-bottom: 1px solid var(--n-tab-border-color);"),O("prefix, suffix",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),o("tabs-tab",`
 border-top-left-radius: var(--n-tab-border-radius);
 border-top-right-radius: var(--n-tab-border-radius);
 `,[d("active",`
 border-bottom: 1px solid #0000;
 `)]),o("tabs-tab-pad",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),o("tabs-pad",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `)])]),d("left",[d("card-type",[o("tabs-scroll-padding","border-right: 1px solid var(--n-tab-border-color);"),O("prefix, suffix",`
 border-right: 1px solid var(--n-tab-border-color);
 `),o("tabs-tab",`
 border-top-left-radius: var(--n-tab-border-radius);
 border-bottom-left-radius: var(--n-tab-border-radius);
 `,[d("active",`
 border-right: 1px solid #0000;
 `)]),o("tabs-tab-pad",`
 border-right: 1px solid var(--n-tab-border-color);
 `),o("tabs-pad",`
 border-right: 1px solid var(--n-tab-border-color);
 `)])]),d("right",[d("card-type",[o("tabs-scroll-padding","border-left: 1px solid var(--n-tab-border-color);"),O("prefix, suffix",`
 border-left: 1px solid var(--n-tab-border-color);
 `),o("tabs-tab",`
 border-top-right-radius: var(--n-tab-border-radius);
 border-bottom-right-radius: var(--n-tab-border-radius);
 `,[d("active",`
 border-left: 1px solid #0000;
 `)]),o("tabs-tab-pad",`
 border-left: 1px solid var(--n-tab-border-color);
 `),o("tabs-pad",`
 border-left: 1px solid var(--n-tab-border-color);
 `)])]),d("bottom",[d("card-type",[o("tabs-scroll-padding","border-top: 1px solid var(--n-tab-border-color);"),O("prefix, suffix",`
 border-top: 1px solid var(--n-tab-border-color);
 `),o("tabs-tab",`
 border-bottom-left-radius: var(--n-tab-border-radius);
 border-bottom-right-radius: var(--n-tab-border-radius);
 `,[d("active",`
 border-top: 1px solid #0000;
 `)]),o("tabs-tab-pad",`
 border-top: 1px solid var(--n-tab-border-color);
 `),o("tabs-pad",`
 border-top: 1px solid var(--n-tab-border-color);
 `)])])])]),$a=Object.assign(Object.assign({},Ge.props),{value:[String,Number],defaultValue:[String,Number],trigger:{type:String,default:"click"},type:{type:String,default:"bar"},closable:Boolean,justifyContent:String,size:{type:String,default:"medium"},placement:{type:String,default:"top"},tabStyle:[String,Object],tabClass:String,addTabStyle:[String,Object],addTabClass:String,barWidth:Number,paneClass:String,paneStyle:[String,Object],paneWrapperClass:String,paneWrapperStyle:[String,Object],addable:[Boolean,Object],tabsPadding:{type:Number,default:0},animated:Boolean,onBeforeLeave:Function,onAdd:Function,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],onClose:[Function,Array],labelSize:String,activeName:[String,Number],onActiveNameChange:[Function,Array]}),Ba=Q({name:"Tabs",props:$a,slots:Object,setup(e,{slots:r}){var i,x,a,R;const{mergedClsPrefixRef:m,inlineThemeDisabled:g}=jt(e),C=Ge("Tabs","-tabs",Ea,Ht,e,m),_=H(null),S=H(null),F=H(null),N=H(null),T=H(null),B=H(null),z=H(!0),L=H(!0),I=Ne(e,["labelSize","size"]),M=Ne(e,["activeName","value"]),K=H((x=(i=M.value)!==null&&i!==void 0?i:e.defaultValue)!==null&&x!==void 0?x:r.default?(R=(a=Ce(r.default())[0])===null||a===void 0?void 0:a.props)===null||R===void 0?void 0:R.name:null),j=oa(M,K),v={id:0},u=ye(()=>{if(!(!e.justifyContent||e.type==="card"))return{display:"flex",justifyContent:e.justifyContent}});Te(j,()=>{v.id=0,$(),oe()});function h(){var t;const{value:n}=j;return n===null?null:(t=_.value)===null||t===void 0?void 0:t.querySelector(`[data-name="${n}"]`)}function Y(t){if(e.type==="card")return;const{value:n}=S;if(!n)return;const l=n.style.opacity==="0";if(t){const b=`${m.value}-tabs-bar--disabled`,{barWidth:k,placement:U}=e;if(t.dataset.disabled==="true"?n.classList.add(b):n.classList.remove(b),["top","bottom"].includes(U)){if(pe(["top","maxHeight","height"]),typeof k=="number"&&t.offsetWidth>=k){const X=Math.floor((t.offsetWidth-k)/2)+t.offsetLeft;n.style.left=`${X}px`,n.style.maxWidth=`${k}px`}else n.style.left=`${t.offsetLeft}px`,n.style.maxWidth=`${t.offsetWidth}px`;n.style.width="8192px",l&&(n.style.transition="none"),n.offsetWidth,l&&(n.style.transition="",n.style.opacity="1")}else{if(pe(["left","maxWidth","width"]),typeof k=="number"&&t.offsetHeight>=k){const X=Math.floor((t.offsetHeight-k)/2)+t.offsetTop;n.style.top=`${X}px`,n.style.maxHeight=`${k}px`}else n.style.top=`${t.offsetTop}px`,n.style.maxHeight=`${t.offsetHeight}px`;n.style.height="8192px",l&&(n.style.transition="none"),n.offsetHeight,l&&(n.style.transition="",n.style.opacity="1")}}}function re(){if(e.type==="card")return;const{value:t}=S;t&&(t.style.opacity="0")}function pe(t){const{value:n}=S;if(n)for(const l of t)n.style[l]=""}function $(){if(e.type==="card")return;const t=h();t?Y(t):re()}function oe(){var t;const n=(t=T.value)===null||t===void 0?void 0:t.$el;if(!n)return;const l=h();if(!l)return;const{scrollLeft:b,offsetWidth:k}=n,{offsetLeft:U,offsetWidth:X}=l;b>U?n.scrollTo({top:0,left:U,behavior:"smooth"}):U+X>b+k&&n.scrollTo({top:0,left:U+X-k,behavior:"smooth"})}const D=H(null);let ne=0,W=null;function ie(t){const n=D.value;if(n){ne=t.getBoundingClientRect().height;const l=`${ne}px`,b=()=>{n.style.height=l,n.style.maxHeight=l};W?(b(),W(),W=null):W=b}}function Z(t){const n=D.value;if(n){const l=t.getBoundingClientRect().height,b=()=>{document.body.offsetHeight,n.style.maxHeight=`${l}px`,n.style.height=`${Math.max(ne,l)}px`};W?(W(),W=null,b()):W=b}}function ee(){const t=D.value;if(t){t.style.maxHeight="",t.style.height="";const{paneWrapperStyle:n}=e;if(typeof n=="string")t.style.cssText=n;else if(n){const{maxHeight:l,height:b}=n;l!==void 0&&(t.style.maxHeight=l),b!==void 0&&(t.style.height=b)}}}const J={value:[]},ve=H("next");function _e(t){const n=j.value;let l="next";for(const b of J.value){if(b===n)break;if(b===t){l="prev";break}}ve.value=l,Ke(t)}function Ke(t){const{onActiveNameChange:n,onUpdateValue:l,"onUpdate:value":b}=e;n&&xe(n,t),l&&xe(l,t),b&&xe(b,t),K.value=t}function Ye(t){const{onClose:n}=e;n&&xe(n,t)}function Me(){const{value:t}=S;if(!t)return;const n="transition-disabled";t.classList.add(n),$(),t.classList.remove(n)}const se=H(null);function Se({transitionDisabled:t}){const n=_.value;if(!n)return;t&&n.classList.add("transition-disabled");const l=h();l&&se.value&&(se.value.style.width=`${l.offsetWidth}px`,se.value.style.height=`${l.offsetHeight}px`,se.value.style.transform=`translateX(${l.offsetLeft-Xt(getComputedStyle(n).paddingLeft)}px)`,t&&se.value.offsetWidth),t&&n.classList.remove("transition-disabled")}Te([j],()=>{e.type==="segment"&&Pe(()=>{Se({transitionDisabled:!1})})}),qe(()=>{e.type==="segment"&&Se({transitionDisabled:!0})});let We=0;function Je(t){var n;if(t.contentRect.width===0&&t.contentRect.height===0||We===t.contentRect.width)return;We=t.contentRect.width;const{type:l}=e;if((l==="line"||l==="bar")&&Me(),l!=="segment"){const{placement:b}=e;Re((b==="top"||b==="bottom"?(n=T.value)===null||n===void 0?void 0:n.$el:B.value)||null)}}const Ze=ke(Je,64);Te([()=>e.justifyContent,()=>e.size],()=>{Pe(()=>{const{type:t}=e;(t==="line"||t==="bar")&&Me()})});const le=H(!1);function et(t){var n;const{target:l,contentRect:{width:b,height:k}}=t,U=l.parentElement.parentElement.offsetWidth,X=l.parentElement.parentElement.offsetHeight,{placement:ce}=e;if(!le.value)ce==="top"||ce==="bottom"?U<b&&(le.value=!0):X<k&&(le.value=!0);else{const{value:ge}=N;if(!ge)return;ce==="top"||ce==="bottom"?U-b>ge.$el.offsetWidth&&(le.value=!1):X-k>ge.$el.offsetHeight&&(le.value=!1)}Re(((n=T.value)===null||n===void 0?void 0:n.$el)||null)}const tt=ke(et,64);function at(){const{onAdd:t}=e;t&&t(),Pe(()=>{const n=h(),{value:l}=T;!n||!l||l.scrollTo({left:n.offsetLeft,top:0,behavior:"smooth"})})}function Re(t){if(!t)return;const{placement:n}=e;if(n==="top"||n==="bottom"){const{scrollLeft:l,scrollWidth:b,offsetWidth:k}=t;z.value=l<=0,L.value=l+k>=b}else{const{scrollTop:l,scrollHeight:b,offsetHeight:k}=t;z.value=l<=0,L.value=l+k>=b}}const nt=ke(t=>{Re(t.target)},64);Dt(Be,{triggerRef:G(e,"trigger"),tabStyleRef:G(e,"tabStyle"),tabClassRef:G(e,"tabClass"),addTabStyleRef:G(e,"addTabStyle"),addTabClassRef:G(e,"addTabClass"),paneClassRef:G(e,"paneClass"),paneStyleRef:G(e,"paneStyle"),mergedClsPrefixRef:m,typeRef:G(e,"type"),closableRef:G(e,"closable"),valueRef:j,tabChangeIdRef:v,onBeforeLeaveRef:G(e,"onBeforeLeave"),activateTab:_e,handleClose:Ye,handleAdd:at}),ia(()=>{$(),oe()}),Vt(()=>{const{value:t}=F;if(!t)return;const{value:n}=m,l=`${n}-tabs-nav-scroll-wrapper--shadow-start`,b=`${n}-tabs-nav-scroll-wrapper--shadow-end`;z.value?t.classList.remove(l):t.classList.add(l),L.value?t.classList.remove(b):t.classList.add(b)});const rt={syncBarPosition:()=>{$()}},ot=()=>{Se({transitionDisabled:!0})},Le=ye(()=>{const{value:t}=I,{type:n}=e,l={card:"Card",bar:"Bar",line:"Line",segment:"Segment"}[n],b=`${t}${l}`,{self:{barColor:k,closeIconColor:U,closeIconColorHover:X,closeIconColorPressed:ce,tabColor:ge,tabBorderColor:it,paneTextColor:st,tabFontWeight:lt,tabBorderRadius:dt,tabFontWeightActive:ct,colorSegment:bt,fontWeightStrong:ft,tabColorSegment:ut,closeSize:pt,closeIconSize:gt,closeColorHover:vt,closeColorPressed:ht,closeBorderRadius:mt,[q("panePadding",t)]:he,[q("tabPadding",b)]:xt,[q("tabPaddingVertical",b)]:yt,[q("tabGap",b)]:wt,[q("tabGap",`${b}Vertical`)]:_t,[q("tabTextColor",n)]:St,[q("tabTextColorActive",n)]:Rt,[q("tabTextColorHover",n)]:Ct,[q("tabTextColorDisabled",n)]:At,[q("tabFontSize",t)]:Tt},common:{cubicBezierEaseInOut:Pt}}=C.value;return{"--n-bezier":Pt,"--n-color-segment":bt,"--n-bar-color":k,"--n-tab-font-size":Tt,"--n-tab-text-color":St,"--n-tab-text-color-active":Rt,"--n-tab-text-color-disabled":At,"--n-tab-text-color-hover":Ct,"--n-pane-text-color":st,"--n-tab-border-color":it,"--n-tab-border-radius":dt,"--n-close-size":pt,"--n-close-icon-size":gt,"--n-close-color-hover":vt,"--n-close-color-pressed":ht,"--n-close-border-radius":mt,"--n-close-icon-color":U,"--n-close-icon-color-hover":X,"--n-close-icon-color-pressed":ce,"--n-tab-color":ge,"--n-tab-font-weight":lt,"--n-tab-font-weight-active":ct,"--n-tab-padding":xt,"--n-tab-padding-vertical":yt,"--n-tab-gap":wt,"--n-tab-gap-vertical":_t,"--n-pane-padding-left":me(he,"left"),"--n-pane-padding-right":me(he,"right"),"--n-pane-padding-top":me(he,"top"),"--n-pane-padding-bottom":me(he,"bottom"),"--n-font-weight-strong":ft,"--n-tab-color-segment":ut}}),de=g?Ut("tabs",ye(()=>`${I.value[0]}${e.type[0]}`),Le,e):void 0;return Object.assign({mergedClsPrefix:m,mergedValue:j,renderedNames:new Set,segmentCapsuleElRef:se,tabsPaneWrapperRef:D,tabsElRef:_,barElRef:S,addTabInstRef:N,xScrollInstRef:T,scrollWrapperElRef:F,addTabFixed:le,tabWrapperStyle:u,handleNavResize:Ze,mergedSize:I,handleScroll:nt,handleTabsResize:tt,cssVars:g?void 0:Le,themeClass:de==null?void 0:de.themeClass,animationDirection:ve,renderNameListRef:J,yScrollElRef:B,handleSegmentResize:ot,onAnimationBeforeLeave:ie,onAnimationEnter:Z,onAnimationAfterEnter:ee,onRender:de==null?void 0:de.onRender},rt)},render(){const{mergedClsPrefix:e,type:r,placement:i,addTabFixed:x,addable:a,mergedSize:R,renderNameListRef:m,onRender:g,paneWrapperClass:C,paneWrapperStyle:_,$slots:{default:S,prefix:F,suffix:N}}=this;g==null||g();const T=S?Ce(S()).filter(v=>v.type.__TAB_PANE__===!0):[],B=S?Ce(S()).filter(v=>v.type.__TAB__===!0):[],z=!B.length,L=r==="card",I=r==="segment",M=!L&&!I&&this.justifyContent;m.value=[];const K=()=>{const v=p("div",{style:this.tabWrapperStyle,class:`${e}-tabs-wrapper`},M?null:p("div",{class:`${e}-tabs-scroll-padding`,style:i==="top"||i==="bottom"?{width:`${this.tabsPadding}px`}:{height:`${this.tabsPadding}px`}}),z?T.map((u,h)=>(m.value.push(u.props.name),Ee(p($e,Object.assign({},u.props,{internalCreatedByPane:!0,internalLeftPadded:h!==0&&(!M||M==="center"||M==="start"||M==="end")}),u.children?{default:u.children.tab}:void 0)))):B.map((u,h)=>(m.value.push(u.props.name),Ee(h!==0&&!M?Ue(u):u))),!x&&a&&L?Ve(a,(z?T.length:B.length)!==0):null,M?null:p("div",{class:`${e}-tabs-scroll-padding`,style:{width:`${this.tabsPadding}px`}}));return p("div",{ref:"tabsElRef",class:`${e}-tabs-nav-scroll-content`},L&&a?p(Ae,{onResize:this.handleTabsResize},{default:()=>v}):v,L?p("div",{class:`${e}-tabs-pad`}):null,L?null:p("div",{ref:"barElRef",class:`${e}-tabs-bar`}))},j=I?"top":i;return p("div",{class:[`${e}-tabs`,this.themeClass,`${e}-tabs--${r}-type`,`${e}-tabs--${R}-size`,M&&`${e}-tabs--flex`,`${e}-tabs--${j}`],style:this.cssVars},p("div",{class:[`${e}-tabs-nav--${r}-type`,`${e}-tabs-nav--${j}`,`${e}-tabs-nav`]},Ie(F,v=>v&&p("div",{class:`${e}-tabs-nav__prefix`},v)),I?p(Ae,{onResize:this.handleSegmentResize},{default:()=>p("div",{class:`${e}-tabs-rail`,ref:"tabsElRef"},p("div",{class:`${e}-tabs-capsule`,ref:"segmentCapsuleElRef"},p("div",{class:`${e}-tabs-wrapper`},p("div",{class:`${e}-tabs-tab`}))),z?T.map((v,u)=>(m.value.push(v.props.name),p($e,Object.assign({},v.props,{internalCreatedByPane:!0,internalLeftPadded:u!==0}),v.children?{default:v.children.tab}:void 0))):B.map((v,u)=>(m.value.push(v.props.name),u===0?v:Ue(v))))}):p(Ae,{onResize:this.handleNavResize},{default:()=>p("div",{class:`${e}-tabs-nav-scroll-wrapper`,ref:"scrollWrapperElRef"},["top","bottom"].includes(j)?p(ga,{ref:"xScrollInstRef",onScroll:this.handleScroll},{default:K}):p("div",{class:`${e}-tabs-nav-y-scroll`,onScroll:this.handleScroll,ref:"yScrollElRef"},K()))}),x&&a&&L?Ve(a,!0):null,Ie(N,v=>v&&p("div",{class:`${e}-tabs-nav__suffix`},v))),z&&(this.animated&&(j==="top"||j==="bottom")?p("div",{ref:"tabsPaneWrapperRef",style:_,class:[`${e}-tabs-pane-wrapper`,C]},De(T,this.mergedValue,this.renderedNames,this.onAnimationBeforeLeave,this.onAnimationEnter,this.onAnimationAfterEnter,this.animationDirection)):De(T,this.mergedValue,this.renderedNames)))}});function De(e,r,i,x,a,R,m){const g=[];return e.forEach(C=>{const{name:_,displayDirective:S,"display-directive":F}=C.props,N=B=>S===B||F===B,T=r===_;if(C.key!==void 0&&(C.key=_),T||N("show")||N("show:lazy")&&i.has(_)){i.has(_)||i.add(_);const B=!N("if");g.push(B?Gt(C,[[Kt,T]]):C)}}),m?p(qt,{name:`${m}-transition`,onBeforeLeave:x,onEnter:a,onAfterEnter:R},{default:()=>g}):g}function Ve(e,r){return p($e,{ref:"addTabInstRef",key:"__addable",name:"__addable",internalCreatedByPane:!0,internalAddable:!0,internalLeftPadded:r,disabled:typeof e=="object"&&e.disabled})}function Ue(e){const r=Qt(e);return r.props?r.props.internalLeftPadded=!0:r.props={internalLeftPadded:!0},r}function Ee(e){return Array.isArray(e.dynamicProps)?e.dynamicProps.includes("internalLeftPadded")||e.dynamicProps.push("internalLeftPadded"):e.dynamicProps=["internalLeftPadded"],e}const Ma={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 24 24"},Wa=Q({name:"ManageAccountsRound",render:function(r,i){return y(),ue("svg",Ma,i[0]||(i[0]=[ae("path",{d:"M10.67 13.02c-.22-.01-.44-.02-.67-.02c-2.42 0-4.68.67-6.61 1.82c-.88.52-1.39 1.5-1.39 2.53V19c0 .55.45 1 1 1h8.26a6.963 6.963 0 0 1-.59-6.98z",fill:"currentColor"},null,-1),ae("circle",{cx:"10",cy:"8",r:"4",fill:"currentColor"},null,-1),ae("path",{d:"M20.75 16c0-.22-.03-.42-.06-.63l.84-.73c.18-.16.22-.42.1-.63l-.59-1.02a.488.488 0 0 0-.59-.22l-1.06.36c-.32-.27-.68-.48-1.08-.63l-.22-1.09a.503.503 0 0 0-.49-.4h-1.18c-.24 0-.44.17-.49.4l-.22 1.09c-.4.15-.76.36-1.08.63l-1.06-.36a.496.496 0 0 0-.59.22l-.59 1.02c-.12.21-.08.47.1.63l.84.73c-.03.21-.06.41-.06.63s.03.42.06.63l-.84.73c-.18.16-.22.42-.1.63l.59 1.02c.12.21.37.3.59.22l1.06-.36c.32.27.68.48 1.08.63l.22 1.09c.05.23.25.4.49.4h1.18c.24 0 .44-.17.49-.4l.22-1.09c.4-.15.76-.36 1.08-.63l1.06.36c.23.08.47-.02.59-.22l.59-1.02c.12-.21.08-.47-.1-.63l-.84-.73c.03-.21.06-.41.06-.63zM17 18c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2z",fill:"currentColor"},null,-1)]))}}),La={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 24 24"},Ia=Q({name:"PlayArrowOutlined",render:function(r,i){return y(),ue("svg",La,i[0]||(i[0]=[ae("path",{d:"M10 8.64L15.27 12L10 15.36V8.64M8 5v14l11-7L8 5z",fill:"currentColor"},null,-1)]))}}),Oa={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 24 24"},Fa=Q({name:"PlayArrowRound",render:function(r,i){return y(),ue("svg",Oa,i[0]||(i[0]=[ae("path",{d:"M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.69L9.54 5.98A.998.998 0 0 0 8 6.82z",fill:"currentColor"},null,-1)]))}}),Na={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 24 24"},ja=Q({name:"QueryStatsRound",render:function(r,i){return y(),ue("svg",Na,i[0]||(i[0]=[ae("path",{d:"M19.88 18.47c.48-.77.75-1.67.69-2.66c-.13-2.15-1.84-3.97-3.97-4.2a4.5 4.5 0 0 0-5.02 4.47c0 2.49 2.01 4.5 4.49 4.5c.88 0 1.7-.26 2.39-.7l2.41 2.41c.39.39 1.03.39 1.42 0c.39-.39.39-1.03 0-1.42l-2.41-2.4zm-3.8.11a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5zm-.36-8.5c-.74.02-1.45.18-2.1.45l-.55-.83l-3.08 5.01a1 1 0 0 1-1.61.13l-2.12-2.47l-3.06 4.9c-.31.49-.97.62-1.44.28c-.42-.31-.54-.89-.26-1.34l3.78-6.05c.36-.57 1.17-.63 1.61-.12L9 12.5l3.18-5.17a.996.996 0 0 1 1.68-.03l1.86 2.78zm2.59.5c-.64-.28-1.33-.45-2.05-.49L20.8 2.9c.31-.49.97-.61 1.43-.27c.43.31.54.9.26 1.34l-4.18 6.61z",fill:"currentColor"},null,-1)]))}}),Ha={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 24 24"},Da=Q({name:"QuestionAnswerRound",render:function(r,i){return y(),ue("svg",Ha,i[0]||(i[0]=[ae("path",{d:"M20 6h-1v8c0 .55-.45 1-1 1H6v1c0 1.1.9 2 2 2h10l4 4V8c0-1.1-.9-2-2-2zm-3 5V4c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v13l4-4h9c1.1 0 2-.9 2-2z",fill:"currentColor"},null,-1)]))}}),Va={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 24 24"},Ua=Q({name:"SettingsRound",render:function(r,i){return y(),ue("svg",Va,i[0]||(i[0]=[ae("path",{d:"M19.5 12c0-.23-.01-.45-.03-.68l1.86-1.41c.4-.3.51-.86.26-1.3l-1.87-3.23a.987.987 0 0 0-1.25-.42l-2.15.91c-.37-.26-.76-.49-1.17-.68l-.29-2.31c-.06-.5-.49-.88-.99-.88h-3.73c-.51 0-.94.38-1 .88l-.29 2.31c-.41.19-.8.42-1.17.68l-2.15-.91c-.46-.2-1-.02-1.25.42L2.41 8.62c-.25.44-.14.99.26 1.3l1.86 1.41a7.343 7.343 0 0 0 0 1.35l-1.86 1.41c-.4.3-.51.86-.26 1.3l1.87 3.23c.25.44.79.62 1.25.42l2.15-.91c.37.26.76.49 1.17.68l.29 2.31c.06.5.49.88.99.88h3.73c.5 0 .93-.38.99-.88l.29-2.31c.41-.19.8-.42 1.17-.68l2.15.91c.46.2 1 .02 1.25-.42l1.87-3.23c.25-.44.14-.99-.26-1.3l-1.86-1.41c.03-.23.04-.45.04-.68zm-7.46 3.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5z",fill:"currentColor"},null,-1)]))}}),Ya={__name:"Settings",setup(e){const r=ta(()=>na(()=>import("./SiteSettings.js"),__vite__mapDeps([0,1]))),i=ea(),x=Yt(),a=Jt(),{isBasic:R,isPro:m,isUltimate:g,maxSwipesRandomNumber:C,showTinder:_,showBumble:S,showOkCupid:F,showLovoo:N,showBadoo:T,showPoF:B,showZoosk:z,showMatch:L}=Zt(a),I=function(){i.push({name:"stats"})},M=function(){i.push({name:"subscription"})},K=function(){i.push({name:"options"})},j=function(){window.open("https://www.auto-swiper.ch/#faq")},v=H(0),u=function($){v.value=$},h=H(null);qe(async()=>{w.tabs.query({active:!0,currentWindow:!0}).then($=>{$[0].url?$[0].url.includes("bumble")?h.value="bumble":$[0].url.includes("tinder")?h.value="tinder":$[0].url.includes("okcupid")?h.value="okcupid":$[0].url.includes("lovoo")?h.value="lovoo":$[0].url.includes("badoo")?h.value="badoo":$[0].url.includes("pof")?h.value="pof":$[0].url.includes("zoosk")?h.value="zoosk":$[0].url.includes("match")?h.value="match":h.value="tinder":h.value="tinder"})});const Y=function(){pe(!1)},re=function(){pe(!0)},pe=function($=!1){w.tabs.query({active:!0,currentWindow:!0}).then(oe=>{if(parseInt(oe[0].id.toString()),a.isFree&&a.dailySwipes>=500||a.isBasic&&a.dailySwipes>=5e3){x.warning(w.i18n.getMessage("ERROR_MAX_SWIPES"));return}try{w.tabs.update(oe[0].id,{autoDiscardable:!1})}catch{}const D=(W,ie)=>Math.random()*(ie-W)+W;C.value=Math.round(D(a.maxSwipes[0],a.maxSwipes[1])),v.value===0&&(v.value=h.value);const ne=JSON.parse(JSON.stringify({uuid:c(a.uuid),isFree:c(a.isFree),isBasic:c(a.isBasic),isPro:c(a.isPro),isUltimate:c(a.isUltimate),userId:c(a.userId),userEmail:c(a.loginEmail),site:c(v.value),enableMaxSwipesFilter:c(a.enableMaxSwipesFilter),maxSwipes:c(a.maxSwipesRandomNumber),forceMatch:$,enableLeftSwipesPercentageFilter:c(a.enableLeftSwipesPercentageFilter),leftSwipePercentage:c(a.leftSwipePercentages),enableAgeFilter:c(a.enableAgeFilter),minMaxAge:c(a.minMaxAge),enableHeightFilter:c(a.enableHeightFilter),minMaxHeight:c(a.minMaxHeight),enableDistanceFilter:c(a.enableDistanceFilter),maxDistance:c(a.maxDistance),skipEmptyDistance:c(a.skipEmptyDistance),enableMinPicturesFilter:c(a.enableMinPicturesFilter),minPictures:c(a.minPictures),minMaxSwipeTime:c(a.minMaxSwipeTime),enableBreak:c(a.enableBreak),breakBetweenSwipes:c(a.breakBetweenSwipes),breakDuration:c(a.breakDuration),enableAutomaticPageReload:c(a.enableAutomaticPageReload),reloadPageBetweenSwipes:c(a.reloadPageBetweenSwipes),enableDelayAfterPageReload:c(a.enableDelayAfterPageReload),delayBetweenAfterPageReload:c(a.delayBetweenAfterPageReload),noEmptyDescription:c(a.noEmptyDescription),onlyVerifyedProfiles:c(a.onlyVerifyedProfiles),onlyRecentlyActive:c(a.onlyRecentlyActive),enableRandomUsageSimulation:c(a.enableRandomUsageSimulation),randomUsageSimulation:c(a.randomUsageSimulation),bannedWords:c(a.bannedWords),preferredWords:c(a.preferredWords),requiredWords:c(a.requiredWords),stats:c(a.stats),swipeLog:[],tabId:null,withNotification:c(a.withNotification),stopOnRightSwipe:c(a.stopOnRightSwipe),enableGatheringPictureUrls:c(a.enableGatheringPictureUrls)}));Oe("sent: auto-swiper-message-backgroundjs-start"),w.runtime.sendMessage({action:"auto-swiper-message-backgroundjs-start",options:ne}).then(W=>{i.push({name:"progress"})}).catch(W=>{W&&Oe(W)})})};return($,oe)=>{const D=za,ne=Ba,W=fa,ie=la,Z=ca,ee=aa,J=da,ve=ua,_e=sa;return y(),P(_e,{"label-placement":"top",column:1},{default:f(()=>[A(ie,{label:s(w).i18n.getMessage("SITES")},{default:f(()=>[A(W,{style:{"max-height":"480px"}},{default:f(()=>[h.value?(y(),P(ne,{key:0,"justify-content":"space-evenly",type:"line",size:"small",animated:"","default-value":h.value,"onUpdate:value":u},{default:f(()=>[s(_)?(y(),P(D,{key:0,name:"tinder",tab:"Tinder","aria-label":s(w).i18n.getMessage("ARIA_ENABLE_TINDER"),"display-directive":"show"},{default:f(()=>[(y(),P(te(s(r)),{site:"tinder"}))]),_:1},8,["aria-label"])):V("",!0),s(S)?(y(),P(D,{key:1,name:"bumble",tab:"Bumble","aria-label":s(w).i18n.getMessage("ARIA_ENABLE_BUMBLE"),"display-directive":"show"},{default:f(()=>[(y(),P(te(s(r)),{site:"bumble"}))]),_:1},8,["aria-label"])):V("",!0),s(F)?(y(),P(D,{key:2,name:"okcupid",tab:"OkCupid","aria-label":s(w).i18n.getMessage("ARIA_ENABLE_OKCUPID"),"display-directive":"show"},{default:f(()=>[(y(),P(te(s(r)),{site:"okcupid"}))]),_:1},8,["aria-label"])):V("",!0),s(N)?(y(),P(D,{key:3,name:"lovoo",tab:"Lovoo","aria-label":s(w).i18n.getMessage("ARIA_ENABLE_LOVOO"),"display-directive":"show"},{default:f(()=>[(y(),P(te(s(r)),{site:"lovoo"}))]),_:1},8,["aria-label"])):V("",!0),s(T)?(y(),P(D,{key:4,name:"badoo",tab:"Badoo","aria-label":s(w).i18n.getMessage("ARIA_ENABLE_BADOO"),"display-directive":"show"},{default:f(()=>[(y(),P(te(s(r)),{site:"badoo"}))]),_:1},8,["aria-label"])):V("",!0),s(B)?(y(),P(D,{key:5,name:"pof",tab:"PoF","aria-label":s(w).i18n.getMessage("ARIA_ENABLE_POF"),"display-directive":"show"},{default:f(()=>[(y(),P(te(s(r)),{site:"pof"}))]),_:1},8,["aria-label"])):V("",!0),s(z)?(y(),P(D,{key:6,name:"zoosk",tab:"Zoosk","aria-label":s(w).i18n.getMessage("ARIA_ENABLE_ZOOSK"),"display-directive":"show"},{default:f(()=>[(y(),P(te(s(r)),{site:"zoosk"}))]),_:1},8,["aria-label"])):V("",!0),s(L)?(y(),P(D,{key:7,name:"match",tab:"Match","aria-label":s(w).i18n.getMessage("ARIA_ENABLE_MATCH"),"display-directive":"show"},{default:f(()=>[(y(),P(te(s(r)),{site:"Match"}))]),_:1},8,["aria-label"])):V("",!0)]),_:1},8,["default-value"])):V("",!0)]),_:1})]),_:1},8,["label"]),A(ie,{label:s(w).i18n.getMessage("ACTIONS")},{default:f(()=>[A(ve,{justify:"space-between",inline:""},{default:f(()=>[A(J,{trigger:"hover"},{trigger:f(()=>[A(ee,{type:"primary",size:"small",onClick:Y,"aria-label":s(w).i18n.getMessage("ARIA_START_SWIPE")},{icon:f(()=>[A(Z,null,{default:f(()=>[A(s(Fa))]),_:1})]),_:1},8,["aria-label"])]),default:f(()=>[be(" "+fe(s(w).i18n.getMessage("SWIPE")),1)]),_:1}),s(m)||s(g)?(y(),P(J,{key:0,trigger:"hover"},{trigger:f(()=>[s(m)||s(g)?(y(),P(ee,{key:0,type:"success",size:"small",onClick:re,"aria-label":s(w).i18n.getMessage("ARIA_FORCE_MATCH_SWIPE")},{icon:f(()=>[A(Z,null,{default:f(()=>[A(s(Ia))]),_:1})]),_:1},8,["aria-label"])):V("",!0)]),default:f(()=>[be(" "+fe(s(w).i18n.getMessage("FORCE_MATCH_SWIPE_TOOLTIP")),1)]),_:1})):V("",!0),s(R)||s(m)||s(g)?(y(),P(J,{key:1,trigger:"hover"},{trigger:f(()=>[s(R)||s(m)||s(g)?(y(),P(ee,{key:0,type:"info",size:"small",onClick:I,"aria-label":s(w).i18n.getMessage("ARIA_SHOW_STATS")},{icon:f(()=>[A(Z,null,{default:f(()=>[A(s(ja))]),_:1})]),_:1},8,["aria-label"])):V("",!0)]),default:f(()=>[be(" "+fe(s(w).i18n.getMessage("STATS")),1)]),_:1})):V("",!0),A(J,{trigger:"hover"},{trigger:f(()=>[A(ee,{type:"success",size:"small",onClick:M,"aria-label":s(w).i18n.getMessage("ARIA_MANAGE_SUBSCRIPTION")},{icon:f(()=>[A(Z,null,{default:f(()=>[A(s(Wa))]),_:1})]),_:1},8,["aria-label"])]),default:f(()=>[be(" "+fe(s(w).i18n.getMessage("SUBSCRIPTION")),1)]),_:1}),A(J,{trigger:"hover"},{trigger:f(()=>[A(ee,{type:"warning",size:"small",onClick:K,"aria-label":s(w).i18n.getMessage("ARIA_OPEN_OPTIONS")},{icon:f(()=>[A(Z,null,{default:f(()=>[A(s(Ua))]),_:1})]),_:1},8,["aria-label"])]),default:f(()=>[be(" "+fe(s(w).i18n.getMessage("OPTIONS")),1)]),_:1}),A(J,{trigger:"hover"},{trigger:f(()=>[A(ee,{type:"error",size:"small",onClick:j,"aria-label":s(w).i18n.getMessage("ARIA_OPEN_FAQ")},{icon:f(()=>[A(Z,null,{default:f(()=>[A(s(Da))]),_:1})]),_:1},8,["aria-label"])]),default:f(()=>[be(" "+fe(s(w).i18n.getMessage("FAQ")),1)]),_:1})]),_:1})]),_:1},8,["label"])]),_:1})}}};export{Ya as default};
