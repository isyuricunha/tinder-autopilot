import{aI as Ae,c6 as so,c7 as co,c4 as uo,n as O,k as n,bY as ho,bZ as fo,l as b,p as d,au as Fe,c8 as vo,d as je,h as c,ax as bo,at as go,w as Pe,x as ve,r as D,aC as Ee,j as k,C as Ne,z as De,ap as mo,H as Be,aE as wo,O as L,aO as he,aN as fe,L as Re,q as _e,aZ as Me,bP as Se,v as U,b0 as po,av as xo,E as K,an as ze,I}from"./popup/popup.js";import{B as yo,V as ko,h as Co,j as $e,b as Oe}from"./DescriptionsItem.js";function Ro(o){const i="rgba(0, 0, 0, .85)",w="0 2px 8px 0 rgba(0, 0, 0, 0.12)",{railColor:h,primaryColor:l,baseColor:f,cardColor:x,modalColor:C,popoverColor:A,borderRadius:$,fontSize:_,opacityDisabled:V}=o;return Object.assign(Object.assign({},so),{fontSize:_,markFontSize:_,railColor:h,railColorHover:h,fillColor:l,fillColorHover:l,opacityDisabled:V,handleColor:"#FFF",dotColor:x,dotColorModal:C,dotColorPopover:A,handleBoxShadow:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowHover:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowActive:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowFocus:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",indicatorColor:i,indicatorBoxShadow:w,indicatorTextColor:f,indicatorBorderRadius:$,dotBorder:`2px solid ${h}`,dotBorderActive:`2px solid ${l}`,dotBoxShadow:""})}const So={common:Ae,self:Ro};function zo(o){const{primaryColor:i,opacityDisabled:w,borderRadius:h,textColor3:l}=o;return Object.assign(Object.assign({},co),{iconColor:l,textColor:"white",loadingColor:i,opacityDisabled:w,railColor:"rgba(0, 0, 0, .14)",railColorActive:i,buttonBoxShadow:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",buttonColor:"#FFF",railBorderRadiusSmall:h,railBorderRadiusMedium:h,railBorderRadiusLarge:h,buttonBorderRadiusSmall:h,buttonBorderRadiusMedium:h,buttonBorderRadiusLarge:h,boxShadowFocus:`0 0 0 2px ${uo(i,{alpha:.2})}`})}const Bo={common:Ae,self:zo},$o=O([n("slider",`
 display: block;
 padding: calc((var(--n-handle-size) - var(--n-rail-height)) / 2) 0;
 position: relative;
 z-index: 0;
 width: 100%;
 cursor: pointer;
 user-select: none;
 -webkit-user-select: none;
 `,[b("reverse",[n("slider-handles",[n("slider-handle-wrapper",`
 transform: translate(50%, -50%);
 `)]),n("slider-dots",[n("slider-dot",`
 transform: translateX(50%, -50%);
 `)]),b("vertical",[n("slider-handles",[n("slider-handle-wrapper",`
 transform: translate(-50%, -50%);
 `)]),n("slider-marks",[n("slider-mark",`
 transform: translateY(calc(-50% + var(--n-dot-height) / 2));
 `)]),n("slider-dots",[n("slider-dot",`
 transform: translateX(-50%) translateY(0);
 `)])])]),b("vertical",`
 box-sizing: content-box;
 padding: 0 calc((var(--n-handle-size) - var(--n-rail-height)) / 2);
 width: var(--n-rail-width-vertical);
 height: 100%;
 `,[n("slider-handles",`
 top: calc(var(--n-handle-size) / 2);
 right: 0;
 bottom: calc(var(--n-handle-size) / 2);
 left: 0;
 `,[n("slider-handle-wrapper",`
 top: unset;
 left: 50%;
 transform: translate(-50%, 50%);
 `)]),n("slider-rail",`
 height: 100%;
 `,[d("fill",`
 top: unset;
 right: 0;
 bottom: unset;
 left: 0;
 `)]),b("with-mark",`
 width: var(--n-rail-width-vertical);
 margin: 0 32px 0 8px;
 `),n("slider-marks",`
 top: calc(var(--n-handle-size) / 2);
 right: unset;
 bottom: calc(var(--n-handle-size) / 2);
 left: 22px;
 font-size: var(--n-mark-font-size);
 `,[n("slider-mark",`
 transform: translateY(50%);
 white-space: nowrap;
 `)]),n("slider-dots",`
 top: calc(var(--n-handle-size) / 2);
 right: unset;
 bottom: calc(var(--n-handle-size) / 2);
 left: 50%;
 `,[n("slider-dot",`
 transform: translateX(-50%) translateY(50%);
 `)])]),b("disabled",`
 cursor: not-allowed;
 opacity: var(--n-opacity-disabled);
 `,[n("slider-handle",`
 cursor: not-allowed;
 `)]),b("with-mark",`
 width: 100%;
 margin: 8px 0 32px 0;
 `),O("&:hover",[n("slider-rail",{backgroundColor:"var(--n-rail-color-hover)"},[d("fill",{backgroundColor:"var(--n-fill-color-hover)"})]),n("slider-handle",{boxShadow:"var(--n-handle-box-shadow-hover)"})]),b("active",[n("slider-rail",{backgroundColor:"var(--n-rail-color-hover)"},[d("fill",{backgroundColor:"var(--n-fill-color-hover)"})]),n("slider-handle",{boxShadow:"var(--n-handle-box-shadow-hover)"})]),n("slider-marks",`
 position: absolute;
 top: 18px;
 left: calc(var(--n-handle-size) / 2);
 right: calc(var(--n-handle-size) / 2);
 `,[n("slider-mark",`
 position: absolute;
 transform: translateX(-50%);
 white-space: nowrap;
 `)]),n("slider-rail",`
 width: 100%;
 position: relative;
 height: var(--n-rail-height);
 background-color: var(--n-rail-color);
 transition: background-color .3s var(--n-bezier);
 border-radius: calc(var(--n-rail-height) / 2);
 `,[d("fill",`
 position: absolute;
 top: 0;
 bottom: 0;
 border-radius: calc(var(--n-rail-height) / 2);
 transition: background-color .3s var(--n-bezier);
 background-color: var(--n-fill-color);
 `)]),n("slider-handles",`
 position: absolute;
 top: 0;
 right: calc(var(--n-handle-size) / 2);
 bottom: 0;
 left: calc(var(--n-handle-size) / 2);
 `,[n("slider-handle-wrapper",`
 outline: none;
 position: absolute;
 top: 50%;
 transform: translate(-50%, -50%);
 cursor: pointer;
 display: flex;
 `,[n("slider-handle",`
 height: var(--n-handle-size);
 width: var(--n-handle-size);
 border-radius: 50%;
 overflow: hidden;
 transition: box-shadow .2s var(--n-bezier), background-color .3s var(--n-bezier);
 background-color: var(--n-handle-color);
 box-shadow: var(--n-handle-box-shadow);
 `,[O("&:hover",`
 box-shadow: var(--n-handle-box-shadow-hover);
 `)]),O("&:focus",[n("slider-handle",`
 box-shadow: var(--n-handle-box-shadow-focus);
 `,[O("&:hover",`
 box-shadow: var(--n-handle-box-shadow-active);
 `)])])])]),n("slider-dots",`
 position: absolute;
 top: 50%;
 left: calc(var(--n-handle-size) / 2);
 right: calc(var(--n-handle-size) / 2);
 `,[b("transition-disabled",[n("slider-dot","transition: none;")]),n("slider-dot",`
 transition:
 border-color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 position: absolute;
 transform: translate(-50%, -50%);
 height: var(--n-dot-height);
 width: var(--n-dot-width);
 border-radius: var(--n-dot-border-radius);
 overflow: hidden;
 box-sizing: border-box;
 border: var(--n-dot-border);
 background-color: var(--n-dot-color);
 `,[b("active","border: var(--n-dot-border-active);")])])]),n("slider-handle-indicator",`
 font-size: var(--n-font-size);
 padding: 6px 10px;
 border-radius: var(--n-indicator-border-radius);
 color: var(--n-indicator-text-color);
 background-color: var(--n-indicator-color);
 box-shadow: var(--n-indicator-box-shadow);
 `,[Fe()]),n("slider-handle-indicator",`
 font-size: var(--n-font-size);
 padding: 6px 10px;
 border-radius: var(--n-indicator-border-radius);
 color: var(--n-indicator-text-color);
 background-color: var(--n-indicator-color);
 box-shadow: var(--n-indicator-box-shadow);
 `,[b("top",`
 margin-bottom: 12px;
 `),b("right",`
 margin-left: 12px;
 `),b("bottom",`
 margin-top: 12px;
 `),b("left",`
 margin-right: 12px;
 `),Fe()]),ho(n("slider",[n("slider-dot","background-color: var(--n-dot-color-modal);")])),fo(n("slider",[n("slider-dot","background-color: var(--n-dot-color-popover);")]))]);function He(o){return window.TouchEvent&&o instanceof window.TouchEvent}function Ie(){const o=new Map,i=w=>h=>{o.set(w,h)};return vo(()=>{o.clear()}),[o,i]}const Vo=0,To=Object.assign(Object.assign({},ve.props),{to:$e.propTo,defaultValue:{type:[Number,Array],default:0},marks:Object,disabled:{type:Boolean,default:void 0},formatTooltip:Function,keyboard:{type:Boolean,default:!0},min:{type:Number,default:0},max:{type:Number,default:100},step:{type:[Number,String],default:1},range:Boolean,value:[Number,Array],placement:String,showTooltip:{type:Boolean,default:void 0},tooltip:{type:Boolean,default:!0},vertical:Boolean,reverse:Boolean,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],onDragstart:[Function],onDragend:[Function]}),Ho=je({name:"Slider",props:To,slots:Object,setup(o){const{mergedClsPrefixRef:i,namespaceRef:w,inlineThemeDisabled:h}=Pe(o),l=ve("Slider","-slider",$o,So,o,i),f=D(null),[x,C]=Ie(),[A,$]=Ie(),_=D(new Set),V=Ee(o),{mergedDisabledRef:v}=V,T=k(()=>{const{step:e}=o;if(Number(e)<=0||e==="mark")return 0;const t=e.toString();let a=0;return t.includes(".")&&(a=t.length-t.indexOf(".")-1),a}),z=D(o.defaultValue),be=Ne(o,"value"),G=Oe(be,z),R=k(()=>{const{value:e}=G;return(o.range?e:[e]).map(P)}),ne=k(()=>R.value.length>2),ge=k(()=>o.placement===void 0?o.vertical?"right":"top":o.placement),re=k(()=>{const{marks:e}=o;return e?Object.keys(e).map(Number.parseFloat):null}),S=D(-1),J=D(-1),y=D(-1),s=D(!1),H=D(!1),j=k(()=>{const{vertical:e,reverse:t}=o;return e?t?"top":"bottom":t?"right":"left"}),W=k(()=>{if(ne.value)return;const e=R.value,t=Y(o.range?Math.min(...e):o.min),a=Y(o.range?Math.max(...e):e[0]),{value:r}=j;return o.vertical?{[r]:`${t}%`,height:`${a-t}%`}:{[r]:`${t}%`,width:`${a-t}%`}}),Q=k(()=>{const e=[],{marks:t}=o;if(t){const a=R.value.slice();a.sort((p,m)=>p-m);const{value:r}=j,{value:u}=ne,{range:g}=o,M=u?()=>!1:p=>g?p>=a[0]&&p<=a[a.length-1]:p<=a[0];for(const p of Object.keys(t)){const m=Number(p);e.push({active:M(m),key:m,label:t[p],style:{[r]:`${Y(m)}%`}})}}return e});function ee(e,t){const a=Y(e),{value:r}=j;return{[r]:`${a}%`,zIndex:t===S.value?1:0}}function ie(e){return o.showTooltip||y.value===e||S.value===e&&s.value}function me(e){return s.value?!(S.value===e&&J.value===e):!0}function we(e){var t;~e&&(S.value=e,(t=x.get(e))===null||t===void 0||t.focus())}function pe(){A.forEach((e,t)=>{ie(t)&&e.syncPosition()})}function F(e){const{"onUpdate:value":t,onUpdateValue:a}=o,{nTriggerFormInput:r,nTriggerFormChange:u}=V;a&&L(a,e),t&&L(t,e),z.value=e,r(),u()}function le(e){const{range:t}=o;if(t){if(Array.isArray(e)){const{value:a}=R;e.join()!==a.join()&&F(e)}}else Array.isArray(e)||R.value[0]!==e&&F(e)}function oe(e,t){if(o.range){const a=R.value.slice();a.splice(t,1,e),le(a)}else le(e)}function B(e,t,a){const r=a!==void 0;a||(a=e-t>0?1:-1);const u=re.value||[],{step:g}=o;if(g==="mark"){const m=E(e,u.concat(t),r?a:void 0);return m?m.value:t}if(g<=0)return t;const{value:M}=T;let p;if(r){const m=Number((t/g).toFixed(M)),N=Math.floor(m),ke=m>N?N:N-1,Ce=m<N?N:N+1;p=E(t,[Number((ke*g).toFixed(M)),Number((Ce*g).toFixed(M)),...u],a)}else{const m=ye(e);p=E(e,[...u,m])}return p?P(p.value):t}function P(e){return Math.min(o.max,Math.max(o.min,e))}function Y(e){const{max:t,min:a}=o;return(e-a)/(t-a)*100}function xe(e){const{max:t,min:a}=o;return a+(t-a)*e}function ye(e){const{step:t,min:a}=o;if(Number(t)<=0||t==="mark")return e;const r=Math.round((e-a)/t)*t+a;return Number(r.toFixed(T.value))}function E(e,t=re.value,a){if(!t?.length)return null;let r=null,u=-1;for(;++u<t.length;){const g=t[u]-e,M=Math.abs(g);(a===void 0||g*a>0)&&(r===null||M<r.distance)&&(r={index:u,distance:M,value:t[u]})}return r}function X(e){const t=f.value;if(!t)return;const a=He(e)?e.touches[0]:e,r=t.getBoundingClientRect();let u;return o.vertical?u=(r.bottom-a.clientY)/r.height:u=(a.clientX-r.left)/r.width,o.reverse&&(u=1-u),xe(u)}function te(e){if(v.value||!o.keyboard)return;const{vertical:t,reverse:a}=o;switch(e.key){case"ArrowUp":e.preventDefault(),se(t&&a?-1:1);break;case"ArrowRight":e.preventDefault(),se(!t&&a?-1:1);break;case"ArrowDown":e.preventDefault(),se(t&&a?1:-1);break;case"ArrowLeft":e.preventDefault(),se(!t&&a?1:-1);break}}function se(e){const t=S.value;if(t===-1)return;const{step:a}=o,r=R.value[t],u=Number(a)<=0||a==="mark"?r:r+a*e;oe(B(u,r,e>0?1:-1),t)}function Ue(e){var t,a;if(v.value||!He(e)&&e.button!==Vo)return;const r=X(e);if(r===void 0)return;const u=R.value.slice(),g=o.range?(a=(t=E(r,u))===null||t===void 0?void 0:t.index)!==null&&a!==void 0?a:-1:0;g!==-1&&(e.preventDefault(),we(g),Ke(),oe(B(r,R.value[g]),g))}function Ke(){s.value||(s.value=!0,o.onDragstart&&L(o.onDragstart),he("touchend",document,ue),he("mouseup",document,ue),he("touchmove",document,ce),he("mousemove",document,ce))}function de(){s.value&&(s.value=!1,o.onDragend&&L(o.onDragend),fe("touchend",document,ue),fe("mouseup",document,ue),fe("touchmove",document,ce),fe("mousemove",document,ce))}function ce(e){const{value:t}=S;if(!s.value||t===-1){de();return}const a=X(e);a!==void 0&&oe(B(a,R.value[t]),t)}function ue(){de()}function Le(e){S.value=e,v.value||(y.value=e)}function We(e){S.value===e&&(S.value=-1,de()),y.value===e&&(y.value=-1)}function Ye(e){y.value=e}function Xe(e){y.value===e&&(y.value=-1)}De(S,(e,t)=>void Re(()=>J.value=t)),De(G,()=>{if(o.marks){if(H.value)return;H.value=!0,Re(()=>{H.value=!1})}Re(pe)}),mo(()=>{de()});const Ve=k(()=>{const{self:{markFontSize:e,railColor:t,railColorHover:a,fillColor:r,fillColorHover:u,handleColor:g,opacityDisabled:M,dotColor:p,dotColorModal:m,handleBoxShadow:N,handleBoxShadowHover:ke,handleBoxShadowActive:Ce,handleBoxShadowFocus:Ze,dotBorder:qe,dotBoxShadow:Ge,railHeight:Je,railWidthVertical:Qe,handleSize:eo,dotHeight:oo,dotWidth:to,dotBorderRadius:ao,fontSize:no,dotBorderActive:ro,dotColorPopover:io},common:{cubicBezierEaseInOut:lo}}=l.value;return{"--n-bezier":lo,"--n-dot-border":qe,"--n-dot-border-active":ro,"--n-dot-border-radius":ao,"--n-dot-box-shadow":Ge,"--n-dot-color":p,"--n-dot-color-modal":m,"--n-dot-color-popover":io,"--n-dot-height":oo,"--n-dot-width":to,"--n-fill-color":r,"--n-fill-color-hover":u,"--n-font-size":no,"--n-handle-box-shadow":N,"--n-handle-box-shadow-active":Ce,"--n-handle-box-shadow-focus":Ze,"--n-handle-box-shadow-hover":ke,"--n-handle-color":g,"--n-handle-size":eo,"--n-opacity-disabled":M,"--n-rail-color":t,"--n-rail-color-hover":a,"--n-rail-height":Je,"--n-rail-width-vertical":Qe,"--n-mark-font-size":e}}),Z=h?Be("slider",void 0,Ve,o):void 0,Te=k(()=>{const{self:{fontSize:e,indicatorColor:t,indicatorBoxShadow:a,indicatorTextColor:r,indicatorBorderRadius:u}}=l.value;return{"--n-font-size":e,"--n-indicator-border-radius":u,"--n-indicator-box-shadow":a,"--n-indicator-color":t,"--n-indicator-text-color":r}}),q=h?Be("slider-indicator",void 0,Te,o):void 0;return{mergedClsPrefix:i,namespace:w,uncontrolledValue:z,mergedValue:G,mergedDisabled:v,mergedPlacement:ge,isMounted:wo(),adjustedTo:$e(o),dotTransitionDisabled:H,markInfos:Q,isShowTooltip:ie,shouldKeepTooltipTransition:me,handleRailRef:f,setHandleRefs:C,setFollowerRefs:$,fillStyle:W,getHandleStyle:ee,activeIndex:S,arrifiedValues:R,followerEnabledIndexSet:_,handleRailMouseDown:Ue,handleHandleFocus:Le,handleHandleBlur:We,handleHandleMouseEnter:Ye,handleHandleMouseLeave:Xe,handleRailKeyDown:te,indicatorCssVars:h?void 0:Te,indicatorThemeClass:q?.themeClass,indicatorOnRender:q?.onRender,cssVars:h?void 0:Ve,themeClass:Z?.themeClass,onRender:Z?.onRender}},render(){var o;const{mergedClsPrefix:i,themeClass:w,formatTooltip:h}=this;return(o=this.onRender)===null||o===void 0||o.call(this),c("div",{class:[`${i}-slider`,w,{[`${i}-slider--disabled`]:this.mergedDisabled,[`${i}-slider--active`]:this.activeIndex!==-1,[`${i}-slider--with-mark`]:this.marks,[`${i}-slider--vertical`]:this.vertical,[`${i}-slider--reverse`]:this.reverse}],style:this.cssVars,onKeydown:this.handleRailKeyDown,onMousedown:this.handleRailMouseDown,onTouchstart:this.handleRailMouseDown},c("div",{class:`${i}-slider-rail`},c("div",{class:`${i}-slider-rail__fill`,style:this.fillStyle}),this.marks?c("div",{class:[`${i}-slider-dots`,this.dotTransitionDisabled&&`${i}-slider-dots--transition-disabled`]},this.markInfos.map(l=>c("div",{key:l.key,class:[`${i}-slider-dot`,{[`${i}-slider-dot--active`]:l.active}],style:l.style}))):null,c("div",{ref:"handleRailRef",class:`${i}-slider-handles`},this.arrifiedValues.map((l,f)=>{const x=this.isShowTooltip(f);return c(yo,null,{default:()=>[c(ko,null,{default:()=>c("div",{ref:this.setHandleRefs(f),class:`${i}-slider-handle-wrapper`,tabindex:this.mergedDisabled?-1:0,role:"slider","aria-valuenow":l,"aria-valuemin":this.min,"aria-valuemax":this.max,"aria-orientation":this.vertical?"vertical":"horizontal","aria-disabled":this.disabled,style:this.getHandleStyle(l,f),onFocus:()=>{this.handleHandleFocus(f)},onBlur:()=>{this.handleHandleBlur(f)},onMouseenter:()=>{this.handleHandleMouseEnter(f)},onMouseleave:()=>{this.handleHandleMouseLeave(f)}},bo(this.$slots.thumb,()=>[c("div",{class:`${i}-slider-handle`})]))}),this.tooltip&&c(Co,{ref:this.setFollowerRefs(f),show:x,to:this.adjustedTo,enabled:this.showTooltip&&!this.range||this.followerEnabledIndexSet.has(f),teleportDisabled:this.adjustedTo===$e.tdkey,placement:this.mergedPlacement,containerClass:this.namespace},{default:()=>c(go,{name:"fade-in-scale-up-transition",appear:this.isMounted,css:this.shouldKeepTooltipTransition(f),onEnter:()=>{this.followerEnabledIndexSet.add(f)},onAfterLeave:()=>{this.followerEnabledIndexSet.delete(f)}},{default:()=>{var C;return x?((C=this.indicatorOnRender)===null||C===void 0||C.call(this),c("div",{class:[`${i}-slider-handle-indicator`,this.indicatorThemeClass,`${i}-slider-handle-indicator--${this.mergedPlacement}`],style:this.indicatorCssVars},typeof h=="function"?h(l):l)):null}})})]})})),this.marks?c("div",{class:`${i}-slider-marks`},this.markInfos.map(l=>c("div",{key:l.key,class:`${i}-slider-mark`,style:l.style},typeof l.label=="function"?l.label():l.label))):null))}}),Fo=n("switch",`
 height: var(--n-height);
 min-width: var(--n-width);
 vertical-align: middle;
 user-select: none;
 -webkit-user-select: none;
 display: inline-flex;
 outline: none;
 justify-content: center;
 align-items: center;
`,[d("children-placeholder",`
 height: var(--n-rail-height);
 display: flex;
 flex-direction: column;
 overflow: hidden;
 pointer-events: none;
 visibility: hidden;
 `),d("rail-placeholder",`
 display: flex;
 flex-wrap: none;
 `),d("button-placeholder",`
 width: calc(1.75 * var(--n-rail-height));
 height: var(--n-rail-height);
 `),n("base-loading",`
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translateX(-50%) translateY(-50%);
 font-size: calc(var(--n-button-width) - 4px);
 color: var(--n-loading-color);
 transition: color .3s var(--n-bezier);
 `,[Me({left:"50%",top:"50%",originalTransform:"translateX(-50%) translateY(-50%)"})]),d("checked, unchecked",`
 transition: color .3s var(--n-bezier);
 color: var(--n-text-color);
 box-sizing: border-box;
 position: absolute;
 white-space: nowrap;
 top: 0;
 bottom: 0;
 display: flex;
 align-items: center;
 line-height: 1;
 `),d("checked",`
 right: 0;
 padding-right: calc(1.25 * var(--n-rail-height) - var(--n-offset));
 `),d("unchecked",`
 left: 0;
 justify-content: flex-end;
 padding-left: calc(1.25 * var(--n-rail-height) - var(--n-offset));
 `),O("&:focus",[d("rail",`
 box-shadow: var(--n-box-shadow-focus);
 `)]),b("round",[d("rail","border-radius: calc(var(--n-rail-height) / 2);",[d("button","border-radius: calc(var(--n-button-height) / 2);")])]),_e("disabled",[_e("icon",[b("rubber-band",[b("pressed",[d("rail",[d("button","max-width: var(--n-button-width-pressed);")])]),d("rail",[O("&:active",[d("button","max-width: var(--n-button-width-pressed);")])]),b("active",[b("pressed",[d("rail",[d("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])]),d("rail",[O("&:active",[d("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])])])])])]),b("active",[d("rail",[d("button","left: calc(100% - var(--n-button-width) - var(--n-offset))")])]),d("rail",`
 overflow: hidden;
 height: var(--n-rail-height);
 min-width: var(--n-rail-width);
 border-radius: var(--n-rail-border-radius);
 cursor: pointer;
 position: relative;
 transition:
 opacity .3s var(--n-bezier),
 background .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 background-color: var(--n-rail-color);
 `,[d("button-icon",`
 color: var(--n-icon-color);
 transition: color .3s var(--n-bezier);
 font-size: calc(var(--n-button-height) - 4px);
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 display: flex;
 justify-content: center;
 align-items: center;
 line-height: 1;
 `,[Me()]),d("button",`
 align-items: center; 
 top: var(--n-offset);
 left: var(--n-offset);
 height: var(--n-button-height);
 width: var(--n-button-width-pressed);
 max-width: var(--n-button-width);
 border-radius: var(--n-button-border-radius);
 background-color: var(--n-button-color);
 box-shadow: var(--n-button-box-shadow);
 box-sizing: border-box;
 cursor: inherit;
 content: "";
 position: absolute;
 transition:
 background-color .3s var(--n-bezier),
 left .3s var(--n-bezier),
 opacity .3s var(--n-bezier),
 max-width .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 `)]),b("active",[d("rail","background-color: var(--n-rail-color-active);")]),b("loading",[d("rail",`
 cursor: wait;
 `)]),b("disabled",[d("rail",`
 cursor: not-allowed;
 opacity: .5;
 `)])]),Do=Object.assign(Object.assign({},ve.props),{size:{type:String,default:"medium"},value:{type:[String,Number,Boolean],default:void 0},loading:Boolean,defaultValue:{type:[String,Number,Boolean],default:!1},disabled:{type:Boolean,default:void 0},round:{type:Boolean,default:!0},"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],checkedValue:{type:[String,Number,Boolean],default:!0},uncheckedValue:{type:[String,Number,Boolean],default:!1},railStyle:Function,rubberBand:{type:Boolean,default:!0},onChange:[Function,Array]});let ae;const Io=je({name:"Switch",props:Do,slots:Object,setup(o){ae===void 0&&(typeof CSS<"u"?typeof CSS.supports<"u"?ae=CSS.supports("width","max(1px)"):ae=!1:ae=!0);const{mergedClsPrefixRef:i,inlineThemeDisabled:w}=Pe(o),h=ve("Switch","-switch",Fo,Bo,o,i),l=Ee(o),{mergedSizeRef:f,mergedDisabledRef:x}=l,C=D(o.defaultValue),A=Ne(o,"value"),$=Oe(A,C),_=k(()=>$.value===o.checkedValue),V=D(!1),v=D(!1),T=k(()=>{const{railStyle:s}=o;if(s)return s({focused:v.value,checked:_.value})});function z(s){const{"onUpdate:value":H,onChange:j,onUpdateValue:W}=o,{nTriggerFormInput:Q,nTriggerFormChange:ee}=l;H&&L(H,s),W&&L(W,s),j&&L(j,s),C.value=s,Q(),ee()}function be(){const{nTriggerFormFocus:s}=l;s()}function G(){const{nTriggerFormBlur:s}=l;s()}function R(){o.loading||x.value||($.value!==o.checkedValue?z(o.checkedValue):z(o.uncheckedValue))}function ne(){v.value=!0,be()}function ge(){v.value=!1,G(),V.value=!1}function re(s){o.loading||x.value||s.key===" "&&($.value!==o.checkedValue?z(o.checkedValue):z(o.uncheckedValue),V.value=!1)}function S(s){o.loading||x.value||s.key===" "&&(s.preventDefault(),V.value=!0)}const J=k(()=>{const{value:s}=f,{self:{opacityDisabled:H,railColor:j,railColorActive:W,buttonBoxShadow:Q,buttonColor:ee,boxShadowFocus:ie,loadingColor:me,textColor:we,iconColor:pe,[K("buttonHeight",s)]:F,[K("buttonWidth",s)]:le,[K("buttonWidthPressed",s)]:oe,[K("railHeight",s)]:B,[K("railWidth",s)]:P,[K("railBorderRadius",s)]:Y,[K("buttonBorderRadius",s)]:xe},common:{cubicBezierEaseInOut:ye}}=h.value;let E,X,te;return ae?(E=`calc((${B} - ${F}) / 2)`,X=`max(${B}, ${F})`,te=`max(${P}, calc(${P} + ${F} - ${B}))`):(E=ze((I(B)-I(F))/2),X=ze(Math.max(I(B),I(F))),te=I(B)>I(F)?P:ze(I(P)+I(F)-I(B))),{"--n-bezier":ye,"--n-button-border-radius":xe,"--n-button-box-shadow":Q,"--n-button-color":ee,"--n-button-width":le,"--n-button-width-pressed":oe,"--n-button-height":F,"--n-height":X,"--n-offset":E,"--n-opacity-disabled":H,"--n-rail-border-radius":Y,"--n-rail-color":j,"--n-rail-color-active":W,"--n-rail-height":B,"--n-rail-width":P,"--n-width":te,"--n-box-shadow-focus":ie,"--n-loading-color":me,"--n-text-color":we,"--n-icon-color":pe}}),y=w?Be("switch",k(()=>f.value[0]),J,o):void 0;return{handleClick:R,handleBlur:ge,handleFocus:ne,handleKeyup:re,handleKeydown:S,mergedRailStyle:T,pressed:V,mergedClsPrefix:i,mergedValue:$,checked:_,mergedDisabled:x,cssVars:w?void 0:J,themeClass:y?.themeClass,onRender:y?.onRender}},render(){const{mergedClsPrefix:o,mergedDisabled:i,checked:w,mergedRailStyle:h,onRender:l,$slots:f}=this;l?.();const{checked:x,unchecked:C,icon:A,"checked-icon":$,"unchecked-icon":_}=f,V=!(Se(A)&&Se($)&&Se(_));return c("div",{role:"switch","aria-checked":w,class:[`${o}-switch`,this.themeClass,V&&`${o}-switch--icon`,w&&`${o}-switch--active`,i&&`${o}-switch--disabled`,this.round&&`${o}-switch--round`,this.loading&&`${o}-switch--loading`,this.pressed&&`${o}-switch--pressed`,this.rubberBand&&`${o}-switch--rubber-band`],tabindex:this.mergedDisabled?void 0:0,style:this.cssVars,onClick:this.handleClick,onFocus:this.handleFocus,onBlur:this.handleBlur,onKeyup:this.handleKeyup,onKeydown:this.handleKeydown},c("div",{class:`${o}-switch__rail`,"aria-hidden":"true",style:h},U(x,v=>U(C,T=>v||T?c("div",{"aria-hidden":!0,class:`${o}-switch__children-placeholder`},c("div",{class:`${o}-switch__rail-placeholder`},c("div",{class:`${o}-switch__button-placeholder`}),v),c("div",{class:`${o}-switch__rail-placeholder`},c("div",{class:`${o}-switch__button-placeholder`}),T)):null)),c("div",{class:`${o}-switch__button`},U(A,v=>U($,T=>U(_,z=>c(po,null,{default:()=>this.loading?c(xo,{key:"loading",clsPrefix:o,strokeWidth:20}):this.checked&&(T||v)?c("div",{class:`${o}-switch__button-icon`,key:T?"checked-icon":"icon"},T||v):!this.checked&&(z||v)?c("div",{class:`${o}-switch__button-icon`,key:z?"unchecked-icon":"icon"},z||v):null})))),U(x,v=>v&&c("div",{key:"checked",class:`${o}-switch__checked`},v)),U(C,v=>v&&c("div",{key:"unchecked",class:`${o}-switch__unchecked`},v)))))}});export{Io as _,Ho as a};
