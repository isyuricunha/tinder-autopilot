import{k as r,n as a,p as b,d as G,h as w,w as z,ca as j,cd as I,aG as M,s as T,ce as A,x as R,ay as L,j as O,E as W,bh as D,I as B}from"./popup/popup.js";import{g as F}from"./get-slot.js";const H=r("input-group",`
 display: inline-flex;
 width: 100%;
 flex-wrap: nowrap;
 vertical-align: bottom;
`,[a(">",[r("input",[a("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),a("&:not(:first-child)",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 margin-left: -1px!important;
 `)]),r("button",[a("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `,[b("state-border, border",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `)]),a("&:not(:first-child)",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `,[b("state-border, border",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `)])]),a("*",[a("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `,[a(">",[r("input",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),r("base-selection",[r("base-selection-label",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),r("base-selection-tags",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),b("box-shadow, border, state-border",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `)])])]),a("&:not(:first-child)",`
 margin-left: -1px!important;
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `,[a(">",[r("input",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),r("base-selection",[r("base-selection-label",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),r("base-selection-tags",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),b("box-shadow, border, state-border",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `)])])])])])]),U={},Q=G({name:"InputGroup",props:U,setup(t){const{mergedClsPrefixRef:e}=z(t);return j("-input-group",H,e),{mergedClsPrefix:e}},render(){const{mergedClsPrefix:t}=this;return w("div",{class:`${t}-input-group`},this.$slots)}});function V(){return I}const k={name:"Space",self:V};let v;function J(){if(!M)return!0;if(v===void 0){const t=document.createElement("div");t.style.display="flex",t.style.flexDirection="column",t.style.rowGap="1px",t.appendChild(document.createElement("div")),t.appendChild(document.createElement("div")),document.body.appendChild(t);const e=t.scrollHeight===1;return document.body.removeChild(t),v=e}return v}const K=Object.assign(Object.assign({},R.props),{align:String,justify:{type:String,default:"start"},inline:Boolean,vertical:Boolean,reverse:Boolean,size:{type:[String,Number,Array],default:"medium"},wrapItem:{type:Boolean,default:!0},itemClass:String,itemStyle:[String,Object],wrap:{type:Boolean,default:!0},internalUseGap:{type:Boolean,default:void 0}}),X=G({name:"Space",props:K,setup(t){const{mergedClsPrefixRef:e,mergedRtlRef:f}=z(t),g=R("Space","-space",void 0,k,t,e),o=L("Space",f,e);return{useGap:J(),rtlEnabled:o,mergedClsPrefix:e,margin:O(()=>{const{size:i}=t;if(Array.isArray(i))return{horizontal:i[0],vertical:i[1]};if(typeof i=="number")return{horizontal:i,vertical:i};const{self:{[W("gap",i)]:h}}=g.value,{row:n,col:y}=D(h);return{horizontal:B(y),vertical:B(n)}})}},render(){const{vertical:t,reverse:e,align:f,inline:g,justify:o,itemClass:i,itemStyle:h,margin:n,wrap:y,mergedClsPrefix:C,rtlEnabled:S,useGap:l,wrapItem:_,internalUseGap:E}=this,m=T(F(this),!1);if(!m.length)return null;const $=`${n.horizontal}px`,u=`${n.horizontal/2}px`,P=`${n.vertical}px`,p=`${n.vertical/2}px`,d=m.length-1,c=o.startsWith("space-");return w("div",{role:"none",class:[`${C}-space`,S&&`${C}-space--rtl`],style:{display:g?"inline-flex":"flex",flexDirection:t&&!e?"column":t&&e?"column-reverse":!t&&e?"row-reverse":"row",justifyContent:["start","end"].includes(o)?`flex-${o}`:o,flexWrap:!y||t?"nowrap":"wrap",marginTop:l||t?"":`-${p}`,marginBottom:l||t?"":`-${p}`,alignItems:f,gap:l?`${n.vertical}px ${n.horizontal}px`:""}},!_&&(l||E)?m:m.map((x,s)=>x.type===A?x:w("div",{role:"none",class:i,style:[h,{maxWidth:"100%"},l?"":t?{marginBottom:s!==d?P:""}:S?{marginLeft:c?o==="space-between"&&s===d?"":u:s!==d?$:"",marginRight:c?o==="space-between"&&s===0?"":u:"",paddingTop:p,paddingBottom:p}:{marginRight:c?o==="space-between"&&s===d?"":u:s!==d?$:"",marginLeft:c?o==="space-between"&&s===0?"":u:"",paddingTop:p,paddingBottom:p}]},x)))}});export{X as _,Q as a,k as s};
