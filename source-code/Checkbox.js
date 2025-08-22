import{c as ae,h as l,n as i,k as c,bT as ne,bU as le,l as b,p as t,aX as ie,d as de,v as te,a_ as se,aN as be,e as he,r as $,w as ue,C as ke,ak as ve,aC as fe,x as K,bX as xe,ay as me,j as B,E as I,H as ge,aP as pe,O as T}from"./popup/popup.js";import{b as Ce}from"./DescriptionsItem.js";const we=ae("n-checkbox-group"),ye=()=>l("svg",{viewBox:"0 0 64 64",class:"check-icon"},l("path",{d:"M50.42,16.76L22.34,39.45l-8.1-11.46c-1.12-1.58-3.3-1.96-4.88-0.84c-1.58,1.12-1.95,3.3-0.84,4.88l10.26,14.51  c0.56,0.79,1.42,1.31,2.38,1.45c0.16,0.02,0.32,0.03,0.48,0.03c0.8,0,1.57-0.27,2.2-0.78l30.99-25.03c1.5-1.21,1.74-3.42,0.52-4.92  C54.13,15.78,51.93,15.55,50.42,16.76z"})),ze=()=>l("svg",{viewBox:"0 0 100 100",class:"line-icon"},l("path",{d:"M80.2,55.5H21.4c-2.8,0-5.1-2.5-5.1-5.5l0,0c0-3,2.3-5.5,5.1-5.5h58.7c2.8,0,5.1,2.5,5.1,5.5l0,0C85.2,53.1,82.9,55.5,80.2,55.5z"})),Re=i([c("checkbox",`
 font-size: var(--n-font-size);
 outline: none;
 cursor: pointer;
 display: inline-flex;
 flex-wrap: nowrap;
 align-items: flex-start;
 word-break: break-word;
 line-height: var(--n-size);
 --n-merged-color-table: var(--n-color-table);
 `,[b("show-label","line-height: var(--n-label-line-height);"),i("&:hover",[c("checkbox-box",[t("border","border: var(--n-border-checked);")])]),i("&:focus:not(:active)",[c("checkbox-box",[t("border",`
 border: var(--n-border-focus);
 box-shadow: var(--n-box-shadow-focus);
 `)])]),b("inside-table",[c("checkbox-box",`
 background-color: var(--n-merged-color-table);
 `)]),b("checked",[c("checkbox-box",`
 background-color: var(--n-color-checked);
 `,[c("checkbox-icon",[i(".check-icon",`
 opacity: 1;
 transform: scale(1);
 `)])])]),b("indeterminate",[c("checkbox-box",[c("checkbox-icon",[i(".check-icon",`
 opacity: 0;
 transform: scale(.5);
 `),i(".line-icon",`
 opacity: 1;
 transform: scale(1);
 `)])])]),b("checked, indeterminate",[i("&:focus:not(:active)",[c("checkbox-box",[t("border",`
 border: var(--n-border-checked);
 box-shadow: var(--n-box-shadow-focus);
 `)])]),c("checkbox-box",`
 background-color: var(--n-color-checked);
 border-left: 0;
 border-top: 0;
 `,[t("border",{border:"var(--n-border-checked)"})])]),b("disabled",{cursor:"not-allowed"},[b("checked",[c("checkbox-box",`
 background-color: var(--n-color-disabled-checked);
 `,[t("border",{border:"var(--n-border-disabled-checked)"}),c("checkbox-icon",[i(".check-icon, .line-icon",{fill:"var(--n-check-mark-color-disabled-checked)"})])])]),c("checkbox-box",`
 background-color: var(--n-color-disabled);
 `,[t("border",`
 border: var(--n-border-disabled);
 `),c("checkbox-icon",[i(".check-icon, .line-icon",`
 fill: var(--n-check-mark-color-disabled);
 `)])]),t("label",`
 color: var(--n-text-color-disabled);
 `)]),c("checkbox-box-wrapper",`
 position: relative;
 width: var(--n-size);
 flex-shrink: 0;
 flex-grow: 0;
 user-select: none;
 -webkit-user-select: none;
 `),c("checkbox-box",`
 position: absolute;
 left: 0;
 top: 50%;
 transform: translateY(-50%);
 height: var(--n-size);
 width: var(--n-size);
 display: inline-block;
 box-sizing: border-box;
 border-radius: var(--n-border-radius);
 background-color: var(--n-color);
 transition: background-color 0.3s var(--n-bezier);
 `,[t("border",`
 transition:
 border-color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 border-radius: inherit;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 border: var(--n-border);
 `),c("checkbox-icon",`
 display: flex;
 align-items: center;
 justify-content: center;
 position: absolute;
 left: 1px;
 right: 1px;
 top: 1px;
 bottom: 1px;
 `,[i(".check-icon, .line-icon",`
 width: 100%;
 fill: var(--n-check-mark-color);
 opacity: 0;
 transform: scale(0.5);
 transform-origin: center;
 transition:
 fill 0.3s var(--n-bezier),
 transform 0.3s var(--n-bezier),
 opacity 0.3s var(--n-bezier),
 border-color 0.3s var(--n-bezier);
 `),ie({left:"1px",top:"1px"})])]),t("label",`
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 user-select: none;
 -webkit-user-select: none;
 padding: var(--n-label-padding);
 font-weight: var(--n-label-font-weight);
 `,[i("&:empty",{display:"none"})])]),ne(c("checkbox",`
 --n-merged-color-table: var(--n-color-table-modal);
 `)),le(c("checkbox",`
 --n-merged-color-table: var(--n-color-table-popover);
 `))]),Se=Object.assign(Object.assign({},K.props),{size:String,checked:{type:[Boolean,String,Number],default:void 0},defaultChecked:{type:[Boolean,String,Number],default:!1},value:[String,Number],disabled:{type:Boolean,default:void 0},indeterminate:Boolean,label:String,focusable:{type:Boolean,default:!0},checkedValue:{type:[Boolean,String,Number],default:!0},uncheckedValue:{type:[Boolean,String,Number],default:!1},"onUpdate:checked":[Function,Array],onUpdateChecked:[Function,Array],privateInsideTable:Boolean,onChange:[Function,Array]}),Te=de({name:"Checkbox",props:Se,setup(o){const n=he(we,null),h=$(null),{mergedClsPrefixRef:u,inlineThemeDisabled:m,mergedRtlRef:D}=ue(o),w=$(o.defaultChecked),y=ke(o,"checked"),z=Ce(y,w),r=ve(()=>{if(n){const e=n.valueSetRef.value;return e&&o.value!==void 0?e.has(o.value):!1}else return z.value===o.checkedValue}),g=fe(o,{mergedSize(e){const{size:d}=o;if(d!==void 0)return d;if(n){const{value:a}=n.mergedSizeRef;if(a!==void 0)return a}if(e){const{mergedSize:a}=e;if(a!==void 0)return a.value}return"medium"},mergedDisabled(e){const{disabled:d}=o;if(d!==void 0)return d;if(n){if(n.disabledRef.value)return!0;const{maxRef:{value:a},checkedCountRef:s}=n;if(a!==void 0&&s.value>=a&&!r.value)return!0;const{minRef:{value:f}}=n;if(f!==void 0&&s.value<=f&&r.value)return!0}return e?e.disabled.value:!1}}),{mergedDisabledRef:p,mergedSizeRef:R}=g,S=K("Checkbox","-checkbox",Re,xe,o,u);function C(e){if(n&&o.value!==void 0)n.toggleCheckbox(!r.value,o.value);else{const{onChange:d,"onUpdate:checked":a,onUpdateChecked:s}=o,{nTriggerFormInput:f,nTriggerFormChange:M}=g,x=r.value?o.uncheckedValue:o.checkedValue;a&&T(a,x,e),s&&T(s,x,e),d&&T(d,x,e),f(),M(),w.value=x}}function k(e){p.value||C(e)}function V(e){if(!p.value)switch(e.key){case" ":case"Enter":C(e)}}function j(e){switch(e.key){case" ":e.preventDefault()}}const P={focus:()=>{var e;(e=h.value)===null||e===void 0||e.focus()},blur:()=>{var e;(e=h.value)===null||e===void 0||e.blur()}},U=me("Checkbox",D,u),_=B(()=>{const{value:e}=R,{common:{cubicBezierEaseInOut:d},self:{borderRadius:a,color:s,colorChecked:f,colorDisabled:M,colorTableHeader:x,colorTableHeaderModal:E,colorTableHeaderPopover:F,checkMarkColor:H,checkMarkColorDisabled:N,border:O,borderFocus:L,borderDisabled:A,borderChecked:G,boxShadowFocus:W,textColor:X,textColorDisabled:Y,checkMarkColorDisabledChecked:q,colorDisabledChecked:J,borderDisabledChecked:Q,labelPadding:Z,labelLineHeight:ee,labelFontWeight:oe,[I("fontSize",e)]:re,[I("size",e)]:ce}}=S.value;return{"--n-label-line-height":ee,"--n-label-font-weight":oe,"--n-size":ce,"--n-bezier":d,"--n-border-radius":a,"--n-border":O,"--n-border-checked":G,"--n-border-focus":L,"--n-border-disabled":A,"--n-border-disabled-checked":Q,"--n-box-shadow-focus":W,"--n-color":s,"--n-color-checked":f,"--n-color-table":x,"--n-color-table-modal":E,"--n-color-table-popover":F,"--n-color-disabled":M,"--n-color-disabled-checked":J,"--n-text-color":X,"--n-text-color-disabled":Y,"--n-check-mark-color":H,"--n-check-mark-color-disabled":N,"--n-check-mark-color-disabled-checked":q,"--n-font-size":re,"--n-label-padding":Z}}),v=m?ge("checkbox",B(()=>R.value[0]),_,o):void 0;return Object.assign(g,P,{rtlEnabled:U,selfRef:h,mergedClsPrefix:u,mergedDisabled:p,renderedChecked:r,mergedTheme:S,labelId:pe(),handleClick:k,handleKeyUp:V,handleKeyDown:j,cssVars:m?void 0:_,themeClass:v==null?void 0:v.themeClass,onRender:v==null?void 0:v.onRender})},render(){var o;const{$slots:n,renderedChecked:h,mergedDisabled:u,indeterminate:m,privateInsideTable:D,cssVars:w,labelId:y,label:z,mergedClsPrefix:r,focusable:g,handleKeyUp:p,handleKeyDown:R,handleClick:S}=this;(o=this.onRender)===null||o===void 0||o.call(this);const C=te(n.default,k=>z||k?l("span",{class:`${r}-checkbox__label`,id:y},z||k):null);return l("div",{ref:"selfRef",class:[`${r}-checkbox`,this.themeClass,this.rtlEnabled&&`${r}-checkbox--rtl`,h&&`${r}-checkbox--checked`,u&&`${r}-checkbox--disabled`,m&&`${r}-checkbox--indeterminate`,D&&`${r}-checkbox--inside-table`,C&&`${r}-checkbox--show-label`],tabindex:u||!g?void 0:0,role:"checkbox","aria-checked":m?"mixed":h,"aria-labelledby":y,style:w,onKeyup:p,onKeydown:R,onClick:S,onMousedown:()=>{be("selectstart",window,k=>{k.preventDefault()},{once:!0})}},l("div",{class:`${r}-checkbox-box-wrapper`}," ",l("div",{class:`${r}-checkbox-box`},l(se,null,{default:()=>this.indeterminate?l("div",{key:"indeterminate",class:`${r}-checkbox-icon`},ze()):l("div",{key:"check",class:`${r}-checkbox-icon`},ye())}),l("div",{class:`${r}-checkbox-box__border`}))),C)}});export{Te as _};
